import { inspectBehaviorWrapper, isBehaviorWebUrl } from "./behavior-tools";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import {
  createBehaviorPilotCases,
  createBehaviorExpansionCases,
  createBehaviorControlCases,
} from "./behavior-cases";
import {
  behaviorComparisonPolicySha256,
  behaviorProbeHostPolicy,
  matchesBehaviorTargetCommand,
  matchesBehaviorJudgeCommand,
} from "./behavior-policy";
import {
  validateBehaviorSession,
  validateBehaviorRunCoverage,
} from "./behavior-validate";
const hash = (s: string | Buffer) =>
  createHash("sha256").update(s).digest("hex");
const stable = (v: any): any =>
  Array.isArray(v)
    ? v.map(stable)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, stable(v[k])]),
        )
      : v;
const digest = (v: unknown) => hash(JSON.stringify(stable(v)));
export const behaviorArchiveDirectory = "evals/results/behavior-2026-11-26";
/** Offline evidence integrity is distinct from a model coaching verdict. Failed observations remain visible. */
export function validateBehaviorArchive(directory = behaviorArchiveDirectory) {
  const index = JSON.parse(
    readFileSync(resolve(directory, "index.json"), "utf8"),
  );
  const indexBinding =
    "e5314e81e9abf441b6cdadaf03c65e7e460f9f5f57af16e491beb6a7dd494afd";
  const cases = new Map(
    [
      ...createBehaviorPilotCases(),
      ...createBehaviorExpansionCases(),
      ...createBehaviorControlCases(),
    ].map((c) => [c.id, c]),
  );
  const releasedSkill = readFileSync(
    "evals/fixtures/behavior-sources/skill-ai-v0.1.2.md",
    "utf8",
  );
  const oldSkill = readFileSync(
    "evals/fixtures/behavior-sources/skill-before-routing-fix.md",
    "utf8",
  );
  const issues: string[] = [],
    observations: string[] = [];
  const original = new Map<string, any>(),
    replication = new Map<string, any>();
  const currentChecks = new Map<
    string,
    ReturnType<typeof validateBehaviorSession>
  >();
  if (hash(readFileSync(resolve(directory, "index.json"))) !== indexBinding)
    issues.push(
      "behavior index changed; explicit reviewed archive update required",
    );
  const sessions = new Map<string, any>(),
    current = new Map<string, any>();
  const archives: { record: any; value: any }[] = [];
  let nativeTargetTurns = 0;
  for (const record of index.records) {
    if (!/^[a-zA-Z0-9_.-]+\.json$/.test(record.file)) {
      issues.push("unsafe archive path");
      continue;
    }
    const bytes = readFileSync(resolve(directory, record.file));
    if (hash(bytes) !== record.sha256 || bytes.length !== record.bytes)
      issues.push(record.file + ": archive bytes changed");
    const value = JSON.parse(bytes.toString());
    archives.push({ record, value });
    if (!["run", "replication"].includes(record.kind)) continue;
    issues.push(...validateBehaviorRunCoverage(value, [...cases.values()]));
    for (const session of value.sessions) {
      const expected = cases.get(session.case?.id);
      if (!expected) {
        issues.push("unknown case " + session.case?.id);
        continue;
      }
      const checked = validateBehaviorSession(
        session,
        expected,
        record.skillSnapshot === "before-routing-fix"
          ? { skillBody: oldSkill }
          : { skillBody: releasedSkill },
      );
      issues.push(...checked.issues);
      observations.push(
        ...(checked.observations ?? []).map(
          (s) => `${record.file}/${session.case.id}/${session.route}: ${s}`,
        ),
      );
      sessions.set(digest(session), session);
      const sessionKey = session.case.id + "/" + session.route;
      if (record.kind === "replication") replication.set(sessionKey, session);
      if (
        record.kind === "run" &&
        record.skillSnapshot === "before-routing-fix" &&
        !session.case.id.includes("control") &&
        session.case.id !== "implicit-gentle-start"
      )
        original.set(sessionKey, session);
      nativeTargetTurns += session.turns.length;
      if (
        record.kind === "run" &&
        !session.case.id.includes("control") &&
        session.case.id !== "implicit-gentle-start"
      ) {
        current.set(session.case.id + "/" + session.route, session);
        currentChecks.set(session.case.id + "/" + session.route, checked);
      }
    }
  }
  for (const { record, value: probe } of archives.filter(
    (a) => a.record.kind === "probe",
  )) {
    const fail = (message: string) => issues.push(record.file + ": " + message);
    if (
      probe.skillSha256 !== hash(probe.skillManifest) ||
      probe.skillManifest !== releasedSkill
    )
      fail("probe Skill snapshot changed");
    if (
      probe.hostPolicy !== behaviorProbeHostPolicy ||
      probe.route !== "skill-web" ||
      probe.shellProfile !== "installed-Skill-read-only" ||
      probe.invocation !== "implicit-natural"
    )
      fail("probe capability profile changed");
    if (probe.turns.length !== 1) fail("probe unexpected turn count");
    for (const turn of probe.turns) {
      if (
        !matchesBehaviorTargetCommand(
          turn.command,
          "skill-web",
          0,
          turn.threadId,
          behaviorProbeHostPolicy,
          true,
        )
      )
        fail("probe exact command profile differs");
      if (turn.exitCode !== 0 || turn.requestSha256 !== hash(turn.request))
        fail("probe incomplete/request changed");
      if (
        turn.events.filter(
          (e: any) => e.type === "turn.completed" && e.usage?.output_tokens > 0,
        ).length !== 1
      )
        fail("probe completion missing");
      const reads = turn.events.filter(
        (e: any) =>
          e.type === "item.completed" && e.item?.type === "command_execution",
      );
      const installedPath = reads[0]?.item.command?.match(
        /^\/bin\/zsh -lc 'cat (\/[A-Za-z0-9_./-]+\/talksprout-realistic-skill-probe-[a-z0-9]+\/\.agents\/skills\/talksprout\/SKILL\.md)'$/,
      )?.[1];
      if (reads.length !== 1 || !installedPath)
        fail("probe did not exclusively read installed Skill");
      let actualReads = 0;
      for (const native of turn.nativeTrace.filter((r: any) =>
        ["custom_tool_call", "function_call"].includes(r.type),
      )) {
        const inspected = inspectBehaviorWrapper(
          native.input ?? "",
          "skill-web",
          installedPath,
        );
        if (
          native.type !== "custom_tool_call" ||
          native.name !== "exec" ||
          !inspected.valid
        )
          fail("probe used unrecognized native tool wrapper");
        actualReads += inspected.calls.filter(
          (c) => c.name === "exec_command",
        ).length;
      }
      if (actualReads !== 1) fail("probe native installed read count differs");
      if (
        turn.events.some(
          (e: any) =>
            e.type === "item.completed" &&
            ![
              "agent_message",
              "reasoning",
              "web_search",
              "command_execution",
            ].includes(e.item?.type),
        )
      )
        fail("probe used unexpected visible capability");
      if (
        turn.events.some(
          (e: any) =>
            e.type === "item.completed" &&
            e.item?.type === "web_search" &&
            e.item.action?.url &&
            !isBehaviorWebUrl(e.item.action.url),
        )
      )
        fail("probe used foreign web source");
      if (
        !reads.some(
          (r: any) =>
            r.item.aggregated_output === probe.skillManifest &&
            r.item.exit_code === 0,
        )
      )
        fail("probe actual Skill read bytes missing");
      const web = turn.events.filter(
        (e: any) =>
          e.type === "item.completed" && e.item?.type === "web_search",
      );
      if (
        !web.some((e: any) =>
          e.item.action?.url?.endsWith("/prompts/gentle-start.md"),
        )
      )
        fail("probe practice leaf not opened");
      if (
        turn.events.some(
          (e: any) =>
            e.type === "item.completed" && e.item?.type === "mcp_tool_call",
        )
      )
        fail("standalone probe used MCP");
    }
  }
  let judgeTurns = 0;
  const judgments: any[] = [];
  for (const { record, value } of archives.filter(
    (a) => a.record.kind === "judgments",
  )) {
    const expectedSuite =
      record.file === "behavior-judgments-20261125T175344Z-2c6c1bd3.json"
        ? original
        : record.file === "behavior-judgments-20261125T182455Z-5cfdd316.json"
          ? current
          : record.file === "behavior-judgments-20261125T184117Z-f2962f7b.json"
            ? replication
            : null;
    if (!expectedSuite) {
      issues.push("unknown judgment suite");
      continue;
    }
    const seen = new Set<string>();
    const comparisonSeen = new Set<string>();
    for (const j of value.judgments) {
      judgeTurns++;
      const fail = (s: string) => issues.push(record.file + ": " + s);
      if (!matchesBehaviorJudgeCommand(j.command, true))
        fail("judge exact command profile differs");
      if (hash(j.policy) !== behaviorComparisonPolicySha256)
        fail("judge rubric changed");
      if (
        j.exitCode !== 0 ||
        hash(j.request) !== j.requestSha256 ||
        !j.request.startsWith(j.policy)
      )
        fail("judge request/exit differs");
      const threads = j.events.filter((e: any) => e.type === "thread.started");
      const completions = j.events.filter(
        (e: any) => e.type === "turn.completed",
      );
      if (
        threads.length !== 1 ||
        completions.length !== 1 ||
        !(completions[0]?.usage?.output_tokens > 0)
      )
        fail("judge completion/usage missing");
      if (
        j.command[0] !== "codex" ||
        j.command[1] !== "exec" ||
        !j.command.includes("--ephemeral") ||
        !j.command.includes("shell_tool") ||
        !j.command.includes('web_search="disabled"') ||
        !j.command.includes("gpt-6.1-sol")
      )
        fail("judge capabilities differ");
      if (
        j.events.some(
          (e: any) =>
            e.type === "item.completed" &&
            !["agent_message", "reasoning"].includes(e.item?.type),
        )
      )
        fail("judge used tool");
      const last = j.events
        .filter(
          (e: any) =>
            e.type === "item.completed" && e.item?.type === "agent_message",
        )
        .at(-1)?.item.text;
      try {
        if (digest(JSON.parse(last)) !== digest(j.output))
          fail("judge output changed");
      } catch {
        fail("judge JSON absent");
      }
      let input: any;
      try {
        input = JSON.parse(j.request.slice(j.policy.length));
      } catch {
        fail("judge input absent");
        continue;
      }
      const expectedInputIds = [
        ...new Set(j.sessionReferences.map((r: any) => r.caseId)),
      ].sort();
      const actualInputIds = Array.isArray(input.cases)
        ? input.cases.map((c: any) => c.case?.id).sort()
        : [];
      if (
        digest(actualInputIds) !== digest(expectedInputIds) ||
        Object.keys(input).some((k) => k !== "cases")
      )
        fail("judge input contains extra/duplicate/missing cases");
      for (const c of input.cases ?? []) {
        const expectedRoutes = j.sessionReferences
          .filter((r: any) => r.caseId === c.case?.id)
          .map((r: any) => r.route)
          .sort();
        const actualRoutes = Array.isArray(c.observations)
          ? c.observations.map((o: any) => o.route).sort()
          : [];
        if (
          digest(expectedRoutes) !== digest(actualRoutes) ||
          Object.keys(c).some((k) => !["case", "observations"].includes(k))
        )
          fail("judge input contains extra/duplicate/missing observations");
      }
      for (const ref of j.sessionReferences) {
        const session = sessions.get(ref.sessionSha256);
        const expectedSession = expectedSuite.get(ref.caseId + "/" + ref.route);
        if (!expectedSession || digest(expectedSession) !== ref.sessionSha256)
          fail("judgment does not bind expected frozen/current session");
        if (
          !session ||
          session.case.id !== ref.caseId ||
          session.route !== ref.route
        ) {
          fail("judge target hash not in archive");
          continue;
        }
        if (
          session.turns.some((t: any) => t.threadId === threads[0]?.thread_id)
        )
          fail("judge reused target thread");
        const c = input.cases.find((c: any) => c.case.id === ref.caseId);
        const actual = c?.observations.find((o: any) => o.route === ref.route);
        const trusted = {
          route: session.route,
          rawSessionJudge: session.judge?.output ?? null,
          turns: session.turns.map((t: any) => ({
            request: t.request,
            reply: t.reply,
            visibleMessages: t.events
              .filter(
                (e: any) =>
                  e.type === "item.completed" &&
                  e.item?.type === "agent_message",
              )
              .map((e: any) => e.item.text),
            retrievalCalls: t.events
              .filter(
                (e: any) =>
                  e.type === "item.completed" &&
                  ["mcp_tool_call", "web_search"].includes(e.item?.type),
              )
              .map((e: any) => e.item),
          })),
        };
        if (
          digest(c?.case) !== digest(session.case) ||
          digest(actual) !== digest(trusted)
        )
          fail("judge actual trajectory binding differs");
        const key = ref.caseId + "/" + ref.route;
        if (seen.has(key)) fail("duplicate judge assessment");
        seen.add(key);
        const a = j.output.assessments.filter(
          (a: any) => a.caseId === ref.caseId && a.route === ref.route,
        );
        if (
          a.length !== 1 ||
          !["pass", "fail", "uncertain"].includes(a[0]?.coreCoaching)
        )
          fail("incomplete/nonpass assessment mislabeled");
      }
      const comparisonIds = j.output.comparisons
        .map((c: any) => c.caseId)
        .sort();
      const referenceIds = [
        ...new Set(j.sessionReferences.map((r: any) => r.caseId)),
      ].sort();
      if (
        digest(comparisonIds) !== digest(referenceIds) ||
        digest([...j.caseIds].sort()) !== digest(referenceIds)
      )
        fail("duplicate/unrelated/missing comparison case IDs");
      for (const id of comparisonIds) {
        if (comparisonSeen.has(id)) fail("duplicate cross-batch comparison");
        comparisonSeen.add(id);
      }
      if (
        j.output.assessments.length !== j.sessionReferences.length ||
        j.output.comparisons.length !== j.caseIds.length
      )
        fail("incomplete judge case coverage");
    }
    if (digest([...seen].sort()) !== digest([...expectedSuite.keys()].sort()))
      issues.push(record.file + ": incomplete exact session judgment coverage");
    if (
      digest([...comparisonSeen].sort()) !==
      digest(
        [...new Set([...expectedSuite.values()].map((s) => s.case.id))].sort(),
      )
    )
      issues.push(
        record.file + ": incomplete exact family comparison coverage",
      );
    judgments.push({
      file: record.file,
      corePass: value.judgments
        .flatMap((j: any) => j.output.assessments)
        .filter((a: any) => a.coreCoaching === "pass").length,
      assessments: value.judgments.flatMap((j: any) => j.output.assessments)
        .length,
      parityPass: value.judgments
        .flatMap((j: any) => j.output.comparisons)
        .filter((c: any) => c.coreManualParity === "pass").length,
      cases: value.judgments.flatMap((j: any) => j.output.comparisons).length,
    });
  }
  const primary = [
    ...createBehaviorPilotCases(),
    ...createBehaviorExpansionCases(),
  ];
  for (const c of primary)
    for (const route of ["manual", "skill-web", "mcp"])
      if (!current.has(c.id + "/" + route))
        issues.push("missing current case " + c.id + "/" + route);
  const currentRetrieval = [...currentChecks.values()].flatMap(
    (c) => c.retrieval,
  );
  const currentOpeningMismatches = [...currentChecks.entries()]
    .filter(
      ([, c]) =>
        c.opening.expected && c.opening.allVisibleMessagesMatch === false,
    )
    .map(([key]) => key);
  for (const [key, check] of currentChecks)
    if (check.observations?.length)
      issues.push(
        "current integration retrieval/activation unaccepted: " + key,
      );
  return {
    releaseScope:
      "Historical ai-v0.1.2 learning matrix; frozen Skill, current unchanged canonical bodies; does not evaluate newer selection guidance",
    currentCompleteRetrievalPhases: currentRetrieval.filter(
      (r) => r.completeObserved,
    ).length,
    currentRetrievalPhases: currentRetrieval.length,
    currentOpeningMismatches,
    issues,
    observations,
    primaryFamilies: primary.length,
    primarySessions: current.size,
    nativeTargetTurns,
    judgeTurns,
    judgments,
  };
}
