import { splitBehaviorViewerDocuments } from "./behavior-tools";
import { readFileSync } from "node:fs";
import { inspectBehaviorWrapper, isBehaviorWebUrl } from "./behavior-tools";
import { evidenceDigest } from "./validate";
import {
  behaviorModel,
  matchesBehaviorTargetCommand,
  matchesBehaviorJudgeCommand,
  behaviorHostPolicy,
  behaviorJudgeHeader,
  expectedBehaviorEndpoint,
  expectedBehaviorSkill,
  skillDigest,
  expectedBehaviorSourceTemplate,
  expectedBehaviorDocumentPath,
} from "./behavior-policy";
import { createHash } from "node:crypto";
import type { BehaviorCase, BehaviorRoute } from "./behavior-cases";
import { canonicalBehaviorPrompt, behaviorDigest } from "./behavior-cases";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
interface Execution {
  command: string[];
  request: string;
  requestSha256: string;
  reply: string;
  exitCode: number;
  events: Record<string, any>[];
  nativeTrace: Record<string, any>[];
  threadId: string;
  nativeHistoryMatches: boolean;
  elapsedSeconds: number;
}
interface Session {
  case: BehaviorCase & { turns: any[] };
  route: BehaviorRoute;
  turns: Execution[];
  judge?: any;
  executionFailure?: boolean;
  hostPolicy: string;
  skillSha256?: string;
  endpoint?: string;
}
/** Normalize viewer line labels/whitespace without changing words or dropping instruction sections. */
export function normalizeRetrievedText(text: string): string {
  return text
    .replace(/^L\d+:\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
function strings(value: unknown): string[] {
  if (typeof value === "string") {
    let parsed: unknown;
    try {
      if (/^[\[{]/.test(value.trim())) parsed = JSON.parse(value);
    } catch {}
    return [value, ...(parsed ? strings(parsed) : [])];
  }
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object")
    return Object.values(value).flatMap(strings);
  return [];
}
export function hasForwardedMcpDocument(
  t: Execution,
  documentPath: string | undefined,
  document: string,
): boolean {
  const expectedDocument = normalizeRetrievedText(document);
  const calls = new Map(
    t.nativeTrace
      .filter(
        (r) => r.type === "custom_tool_call" || r.type === "function_call",
      )
      .map((r) => [r.call_id, r]),
  );
  return t.nativeTrace
    .filter((r) => r.type === "custom_tool_call_output")
    .some((result) => {
      const origin = calls.get(result.call_id);
      if (
        !origin ||
        origin.type !== "custom_tool_call" ||
        origin.name !== "exec" ||
        origin.status !== "completed"
      )
        return false;
      const inspected = inspectBehaviorWrapper(origin.input ?? "", "mcp");
      if (!inspected.valid) return false;
      const blocks = Array.isArray(result.output) ? [...result.output] : [];
      if (
        blocks[0]?.type === "input_text" &&
        /^Script completed\nWall time [^\n]+\nOutput:\n/.test(blocks[0].text)
      )
        blocks.shift();
      const emissions = inspected.emissions ?? [];
      if (blocks.length !== emissions.length) return false;
      return emissions.some(
        (emission, i) =>
          emission.kind === "forwarded" &&
          emission.calls.some(
            (call) =>
              call.name === "mcp__talksprout__read_document" &&
              (!documentPath || call.arguments.path === documentPath),
          ) &&
          strings(blocks[i]).some(
            (text) => normalizeRetrievedText(text) === expectedDocument,
          ),
      );
    });
}
export function hasCompleteRetrievedTemplate(
  executions: Execution[],
  template: string,
  documentPath?: string,
): boolean {
  const expected = normalizeRetrievedText(template);
  let completeDocument = template;
  if (documentPath) {
    try {
      completeDocument = readFileSync("content/" + documentPath, "utf8");
    } catch {
      return false;
    }
    if (!normalizeRetrievedText(completeDocument).includes(expected))
      return false;
  }
  const expectedDocument = normalizeRetrievedText(completeDocument);
  return executions.some((t) => {
    const calls = new Map(
      t.nativeTrace
        .filter(
          (r) => r.type === "custom_tool_call" || r.type === "function_call",
        )
        .map((r) => [r.call_id, r]),
    );
    const nativeResults = t.nativeTrace
      .filter(
        (r) =>
          r.type === "custom_tool_call_output" ||
          r.type === "function_call_output",
      )
      .flatMap((r) => {
        const call = calls.get(r.call_id);
        if (
          !call ||
          call.status !== "completed" ||
          call.type !== "custom_tool_call" ||
          call.name !== "exec"
        )
          return [];
        const inspected = inspectBehaviorWrapper(call.input ?? "", "skill-web");
        if (!inspected.valid || inspected.metadataOutput) return [];
        const urls = inspected.calls
          .flatMap((c) =>
            c.name === "web__run" && Array.isArray(c.arguments.open)
              ? c.arguments.open.flatMap((entry: any) =>
                  typeof entry.ref_id === "string" ? [entry.ref_id] : [],
                )
              : [],
          )
          .filter(
            (url: string) =>
              allowedWebUrl(url) &&
              (!documentPath || url.endsWith("/content/" + documentPath)),
          );
        // One viewer document per native text block. Never compare aggregate serialization.
        const blocks = Array.isArray(r.output) ? r.output : [];
        return blocks.flatMap((block: any) => {
          if (block.type !== "input_text" || typeof block.text !== "string")
            return [];
          return splitBehaviorViewerDocuments(block.text)
            .filter((document) => urls.includes(document.url))
            .map((document) => document.body);
        });
      });
    const forwardedMcp = hasForwardedMcpDocument(
      t,
      documentPath,
      completeDocument,
    );
    const mcpResults = t.events
      .filter(
        (e) =>
          e.type === "item.completed" &&
          e.item?.type === "mcp_tool_call" &&
          forwardedMcp &&
          e.item.server === "talksprout" &&
          e.item.tool === "read_document" &&
          (!documentPath || e.item.arguments?.path === documentPath) &&
          e.item.status === "completed" &&
          !e.item.error &&
          e.item.result?.isError !== true &&
          e.item.result?.is_error !== true &&
          Array.isArray(e.item.result?.content) &&
          e.item.result.content.length === 1 &&
          e.item.result.content[0].type === "text" &&
          (!documentPath ||
            e.item.result?.structured_content?.path === documentPath),
      )
      .flatMap((e) =>
        (Array.isArray(e.item.result?.content) ? e.item.result.content : [])
          .filter((c: any) => c.type === "text" && typeof c.text === "string")
          .map((c: any) => c.text),
      );
    return [...nativeResults, ...mcpResults].some(
      (s) => normalizeRetrievedText(s) === expectedDocument,
    );
  });
}
export function strictVisibleOpening(session: Session): {
  expected?: string;
  finalReplyMatches?: boolean;
  allVisibleMessagesMatch?: boolean;
  extraVisibleMessages: number;
} {
  const first = session.case.turns[0];
  const body = first?.canonicalPrompt as string | undefined;
  const expected = body
    ?.match(
      /Start with exactly this one question and nothing else:\s*([^\n]+)/,
    )?.[1]
    ?.trim();
  const visible =
    session.turns[0]?.events
      .filter(
        (e) => e.type === "item.completed" && e.item?.type === "agent_message",
      )
      .map((e) => e.item.text) ?? [];
  return {
    expected,
    finalReplyMatches: expected
      ? session.turns[0]?.reply.trim() === expected
      : undefined,
    allVisibleMessagesMatch: expected
      ? visible.join("\n").trim() === expected
      : undefined,
    extraVisibleMessages: Math.max(0, visible.length - 1),
  };
}
const allowedWebUrl = isBehaviorWebUrl;

export function validateBehaviorSession(
  value: unknown,
  expected: BehaviorCase,
  context: { skillBody?: string } = {},
) {
  const session = value as Session;
  const issues: string[] = [];
  const observations: string[] = [];
  const skillBody = context.skillBody ?? expectedBehaviorSkill();
  const prefix = expected.id + " / " + session?.route;
  const fail = (s: string) => issues.push(prefix + ": " + s);
  if (
    !session ||
    !["manual", "skill-web", "mcp"].includes(session.route) ||
    !Array.isArray(session.turns)
  ) {
    return {
      issues: [prefix + ": invalid session"],
      retrieval: [],
      opening: {
        extraVisibleMessages: 0,
        expected: undefined,
        allVisibleMessagesMatch: undefined,
      },
    };
  }
  if (session.turns.length !== expected.turns.length)
    fail("missing/extra actual turn");
  if (
    session.case.id !== expected.id ||
    session.case.purpose !== expected.purpose ||
    session.hostPolicy !== behaviorHostPolicy
  )
    fail("case/host policy differs from frozen expectation");
  if (session.route === "mcp" && session.endpoint !== expectedBehaviorEndpoint)
    fail("MCP endpoint mismatch");
  if (
    session.route === "skill-web" &&
    session.skillSha256 !== skillDigest(skillBody)
  )
    fail("installed Skill digest mismatch");
  const thread = session.turns[0]?.threadId;
  const retrieval: {
    turn: number;
    promptId: string;
    completeObserved: boolean;
  }[] = [];
  for (let i = 0; i < expected.turns.length; i++) {
    const turn = session.turns[i],
      spec = expected.turns[i],
      record = session.case?.turns[i];
    if (!turn || !record) {
      fail(`turn ${i + 1} missing execution`);
      continue;
    }
    if (
      record.criterion !== spec.criterion ||
      record.intent !== spec.intent ||
      record.learner !== spec.learner ||
      evidenceDigest(record.phase ?? {}) !==
        evidenceDigest((spec.phase ?? {}) as unknown as Record<string, unknown>)
    )
      fail(`turn ${i + 1} frozen learner/criterion/phase differs`);
    let manual = spec.learner!;
    if (spec.phase) {
      manual = canonicalBehaviorPrompt(spec.phase);
      if (
        record.canonicalPrompt !== manual ||
        record.canonicalSha256 !== behaviorDigest(manual)
      )
        fail(`turn ${i + 1} stale canonical phase/body`);
    }
    if (
      record.manualInput !== manual ||
      record.directInput !== (spec.intent ?? spec.learner!)
    )
      fail(`turn ${i + 1} exported inputs differ`);
    if (!matchesBehaviorTargetCommand(turn.command, session.route, i, thread))
      fail(`turn ${i + 1} exact frozen command profile differs`);
    const configs = turn.command.flatMap((arg, index) =>
      arg === "-c" ? [turn.command[index + 1]] : [],
    );
    const config = (key: string) =>
      configs
        .filter((s) => s.startsWith(key + "="))
        .map((s) => {
          try {
            return JSON.parse(s.slice(key.length + 1));
          } catch {
            return null;
          }
        });
    const webConfig = config("web_search");
    const mcpConfig = config("mcp_servers.talksprout.url");
    if (
      turn.command[0] !== "codex" ||
      turn.command[1] !== "exec" ||
      !turn.command.includes("--ignore-user-config") ||
      !turn.command.includes("--ignore-rules") ||
      turn.command[turn.command.indexOf("--disable") + 1] !== "shell_tool" ||
      turn.command[turn.command.indexOf("-m") + 1] !== behaviorModel ||
      !turn.command.includes("--json") ||
      turn.command.some((arg) => arg.startsWith("--dangerously")) ||
      config("developer_instructions").length !== 1 ||
      config("developer_instructions")[0] !== behaviorHostPolicy ||
      webConfig.length !== 1 ||
      webConfig[0] !== (session.route === "skill-web" ? "live" : "disabled") ||
      configs.some(
        (s) =>
          ![
            "developer_instructions",
            "web_search",
            "mcp_servers.talksprout.url",
          ].some((key) => s.startsWith(key + "=")),
      )
    )
      fail(`turn ${i + 1} route capability command differs`);
    if (
      session.route === "mcp"
        ? mcpConfig.length !== 1 || mcpConfig[0] !== expectedBehaviorEndpoint
        : mcpConfig.length !== 0
    )
      fail(`turn ${i + 1} MCP capability configuration differs`);
    if (
      i === 0
        ? turn.command.includes("resume") ||
          turn.command[turn.command.indexOf("--sandbox") + 1] !== "read-only"
        : turn.command[2] !== "resume" || turn.command[3] !== thread
    )
      fail(`turn ${i + 1} native initial/resume command differs`);
    const request =
      session.route === "manual"
        ? manual
        : (session.route === "skill-web" &&
          spec.phase &&
          expected.skillInvocation !== "implicit"
            ? "$talksprout\n"
            : "") + (spec.intent ?? spec.learner!);
    if (turn.request !== request || turn.requestSha256 !== sha(request))
      fail(`turn ${i + 1} request changed`);
    if (
      turn.exitCode !== 0 ||
      !turn.reply ||
      !turn.nativeHistoryMatches ||
      !thread ||
      turn.threadId !== thread
    )
      fail(`turn ${i + 1} incomplete/non-native history`);
    const threadEvents = turn.events.filter((e) => e.type === "thread.started");
    if (threadEvents.length !== 1 || threadEvents[0].thread_id !== thread)
      fail(`turn ${i + 1} native thread mismatch`);
    const complete = turn.events.filter((e) => e.type === "turn.completed");
    const usage = complete[0]?.usage;
    if (
      complete.length !== 1 ||
      !Number.isInteger(usage?.input_tokens) ||
      !Number.isInteger(usage?.output_tokens) ||
      usage.output_tokens <= 0
    )
      fail(`turn ${i + 1} missing completion/usage`);
    const final = turn.events
      .filter(
        (e) => e.type === "item.completed" && e.item?.type === "agent_message",
      )
      .at(-1)?.item.text;
    if (final?.trim() !== turn.reply.trim())
      fail(`turn ${i + 1} reply differs from actual event`);
    const nativeAllowed = [
      "host_agents_context",
      "user_message",
      "custom_tool_call",
      "custom_tool_call_output",
      "function_call",
      "function_call_output",
    ];
    if (turn.nativeTrace.some((r) => !nativeAllowed.includes(r.type)))
      fail(`turn ${i + 1} unrecognized native context record`);
    const nativeCalls = turn.nativeTrace.filter((r) =>
      ["custom_tool_call", "function_call"].includes(r.type),
    );
    if (new Set(nativeCalls.map((r) => r.call_id)).size !== nativeCalls.length)
      fail(`turn ${i + 1} duplicate native call identity`);
    for (const output of turn.nativeTrace.filter((r) =>
      ["custom_tool_call_output", "function_call_output"].includes(r.type),
    )) {
      const origin = nativeCalls.find((r) => r.call_id === output.call_id);
      if (
        !origin ||
        turn.nativeTrace.indexOf(origin) > turn.nativeTrace.indexOf(output) ||
        turn.nativeTrace.filter(
          (r) =>
            ["custom_tool_call_output", "function_call_output"].includes(
              r.type,
            ) && r.call_id === output.call_id,
        ).length !== 1
      )
        fail(`turn ${i + 1} orphan/duplicate/reordered native tool output`);
    }
    const contexts = turn.nativeTrace.filter(
      (r) => r.type === "user_message" || r.type === "host_agents_context",
    );
    const host = contexts.filter((r) => r.type === "host_agents_context");
    if (
      host.length !== (i === 0 ? 1 : 0) ||
      (i === 0 &&
        (contexts[0]?.type !== "host_agents_context" ||
          !/^[0-9a-f]{64}$/.test(host[0]?.sha256 ?? "") ||
          !Number.isInteger(host[0]?.bytes) ||
          host[0].bytes <= 0 ||
          Object.keys(host[0]).some(
            (k) => !["type", "sha256", "bytes"].includes(k),
          )))
    )
      fail(`turn ${i + 1} unexpected native host context sequence`);
    const users = contexts.filter((r) => r.type === "user_message");
    const expansionExpected =
      session.route === "skill-web" &&
      !!spec.phase &&
      expected.skillInvocation !== "implicit";
    if (
      users.length !== (expansionExpected ? 2 : 1) ||
      users[0]?.text !== turn.request
    )
      fail(`turn ${i + 1} extra/missing/reordered native user input`);
    if (expansionExpected) {
      const expansion = users[1]?.text?.match(
        /^<skill>\n<name>talksprout<\/name>\n<path>([^\n]+)<\/path>\n([\s\S]*)\n<\/skill>$/,
      );
      if (
        !expansion ||
        !expansion[1].endsWith(
          `/${expected.id}--skill-web/.agents/skills/talksprout/SKILL.md`,
        ) ||
        expansion[2] !== skillBody
      )
        fail(`turn ${i + 1} incorrect native Skill expansion`);
    }
    const tools = turn.events.filter(
      (e) => e.type === "item.completed" && e.item?.type === "mcp_tool_call",
    );
    const web = turn.events.filter(
      (e) => e.type === "item.completed" && e.item?.type === "web_search",
    );
    if (session.route !== "mcp" && tools.length)
      fail(`turn ${i + 1} used MCP outside MCP route`);
    if (
      tools.some(
        (e) =>
          e.item.server !== "talksprout" ||
          e.item.status !== "completed" ||
          ![
            "get_guide",
            "list_documents",
            "search_documents",
            "read_document",
          ].includes(e.item.tool),
      )
    )
      fail(`turn ${i + 1} foreign/failed MCP call`);
    if (session.route !== "skill-web" && web.length)
      fail(`turn ${i + 1} used web outside standalone route`);
    if (
      web.some((e) => e.item.action?.url && !allowedWebUrl(e.item.action.url))
    )
      fail(`turn ${i + 1} used non-TalkSprout web source`);
    for (const call of turn.nativeTrace.filter((r) =>
      ["custom_tool_call", "function_call"].includes(r.type),
    )) {
      if (call.type !== "custom_tool_call" || call.name !== "exec") {
        fail(`turn ${i + 1} foreign native tool call`);
        continue;
      }
      if (!inspectBehaviorWrapper(call.input ?? "", session.route).valid)
        fail(`turn ${i + 1} unrecognized/foreign native capability wrapper`);
    }
    const visibleTools = turn.events.filter(
      (e) =>
        e.type === "item.completed" &&
        !["agent_message", "reasoning"].includes(e.item?.type),
    );
    if (
      visibleTools.some(
        (e) => !["web_search", "mcp_tool_call"].includes(e.item?.type),
      )
    )
      fail(`turn ${i + 1} used command/unrelated visible tool`);
    if (spec.phase && session.route !== "manual") {
      const template = expectedBehaviorSourceTemplate(spec.phase);
      if (record.sourceTemplate !== template)
        fail(`turn ${i + 1} untrusted/changed source template`);
      const completeObserved =
        typeof template === "string" &&
        hasCompleteRetrievedTemplate(
          session.turns.slice(0, i + 1),
          template,
          expectedBehaviorDocumentPath(spec.phase),
        );
      retrieval.push({
        turn: i + 1,
        promptId: spec.phase.promptId,
        completeObserved,
      });
      if (!completeObserved)
        observations.push(
          `turn ${i + 1} complete selected source not observed`,
        );
    }
  }
  if (
    session.route === "skill-web" &&
    !session.turns
      .flatMap((t) => t.nativeTrace)
      .some(
        (r) =>
          r.type === "user_message" &&
          (() => {
            const match = r.text?.match(
              /^<skill>\n<name>talksprout<\/name>\n<path>[^\n]+<\/path>\n([\s\S]*)\n<\/skill>$/,
            );
            return !!match && match[1] === skillBody;
          })(),
      )
  )
    observations.push("no genuine Skill expansion observed");
  if (session.judge) {
    const j = session.judge;
    if (!matchesBehaviorJudgeCommand(j.command, false))
      fail("judge exact command profile differs");
    const ids =
      j.events
        ?.filter((e: any) => e.type === "thread.started")
        .map((e: any) => e.thread_id) ?? [];
    if (
      j.exitCode !== 0 ||
      ids.length !== 1 ||
      ids[0] === thread ||
      !j.events.some((e: any) => e.type === "turn.completed" && e.usage)
    )
      fail("judge not independently executed");
    const raw = j.events
      .filter(
        (e: any) =>
          e.type === "item.completed" && e.item?.type === "agent_message",
      )
      .at(-1)?.item.text;
    try {
      if (JSON.stringify(JSON.parse(raw)) !== JSON.stringify(j.output))
        fail("judge output differs from event");
    } catch {
      fail("judge JSON missing");
    }
    try {
      const input = JSON.parse(j.request.slice(behaviorJudgeHeader.length));
      const trusted = {
        case: session.case,
        route: session.route,
        turns: session.turns.map((t) => ({
          request: t.request,
          reply: t.reply,
          visibleMessages: t.events
            .filter(
              (e) =>
                e.type === "item.completed" && e.item?.type === "agent_message",
            )
            .map((e) => e.item.text),
          nativeTrace: t.nativeTrace,
        })),
      };
      if (
        !j.request.startsWith(behaviorJudgeHeader) ||
        evidenceDigest(input) !== evidenceDigest(trusted)
      )
        fail("judge input is not the exact actual trajectory");
    } catch {
      fail("judge input binding missing");
    }
    if (
      j.events.some(
        (e: any) =>
          e.type === "item.completed" &&
          e.item?.type !== "agent_message" &&
          e.item?.type !== "reasoning",
      )
    )
      fail("judge used tools");
    if (j.requestSha256 !== sha(j.request))
      fail("judge request digest mismatch");
  }
  return {
    issues,
    observations,
    retrieval,
    opening: strictVisibleOpening(session),
  };
}

/** A selected partial suite is allowed; every declared selected case/route must actually execute exactly once. */
export function validateBehaviorRunCoverage(
  value: unknown,
  trustedCases: BehaviorCase[],
): string[] {
  const raw = value as {
    method?: string;
    schemaVersion?: number;
    cases?: any[];
    routes?: string[];
    sessions?: any[];
  };
  const issues: string[] = [];
  if (
    !raw ||
    raw.method !== "codex-cli-native-history-learning-behavior" ||
    raw.schemaVersion !== 1 ||
    !Array.isArray(raw.cases) ||
    !raw.cases.length ||
    !Array.isArray(raw.routes) ||
    !raw.routes.length ||
    !Array.isArray(raw.sessions) ||
    !raw.sessions.length
  )
    return ["run has missing/empty declared cases, routes or actual sessions"];
  if (
    new Set(raw.routes).size !== raw.routes.length ||
    raw.routes.some((r) => !["manual", "skill-web", "mcp"].includes(r))
  )
    issues.push("run has invalid/duplicate declared routes");
  const trusted = new Map(trustedCases.map((c) => [c.id, c]));
  const declared = new Map<string, any>();
  const expectedKeys = new Set<string>();
  for (const c of raw.cases) {
    const expected = trusted.get(c.id);
    if (!expected || declared.has(c.id)) {
      issues.push("run has unknown/duplicate declared case");
      continue;
    }
    declared.set(c.id, c);
    for (const route of raw.routes)
      if (!expected.routes || expected.routes.includes(route as BehaviorRoute))
        expectedKeys.add(c.id + "/" + route);
  }
  const seen = new Set<string>();
  for (const session of raw.sessions) {
    const key = session.case?.id + "/" + session.route;
    if (seen.has(key) || !expectedKeys.has(key))
      issues.push("run has duplicate/unselected actual session: " + key);
    seen.add(key);
    if (
      !declared.has(session.case?.id) ||
      evidenceDigest(declared.get(session.case.id)) !==
        evidenceDigest(session.case)
    )
      issues.push("run declared case differs from executed case: " + key);
  }
  for (const key of expectedKeys)
    if (!seen.has(key))
      issues.push("run missing declared selected execution: " + key);
  if (!expectedKeys.size)
    issues.push("run declares no compatible selected case/route");
  return issues;
}
