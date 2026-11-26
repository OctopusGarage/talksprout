import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import plan from "./fixtures/contextual-0.1.5/cases.json";
import profiles from "./fixtures/contextual-0.1.5/profiles.json";
import { matchesBehaviorJudgeCommand } from "./behavior-policy";
const directory = "evals/results/contextual-0.1.5/",
  fixtures = "evals/fixtures/contextual-0.1.5/";
const sha = (v: string | Buffer) =>
  createHash("sha256").update(v).digest("hex");
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
const equal = (a: any, b: any) =>
  JSON.stringify(stable(a)) === JSON.stringify(stable(b));
export function contextualRequests(id: string, route: string): string[] {
  const spec = plan.cases.find((c) => c.id === id);
  if (!spec) throw Error("Unknown contextual case");
  return spec.turns.map((text, i) =>
    route === "mcp"
      ? text.replaceAll("$talksprout", "TalkSprout")
      : i === 0 && !text.startsWith("$talksprout")
        ? "$talksprout\n" + text
        : text,
  );
}
function summaries(run: any) {
  return run.turns.map((t: any) => ({
    request: t.request,
    reply: t.reply,
    visibleMessages: t.events
      .filter(
        (e: any) =>
          e.type === "item.completed" && e.item?.type === "agent_message",
      )
      .map((e: any) => e.item.text),
    calls: t.events
      .filter(
        (e: any) =>
          e.type === "item.completed" &&
          ["web_search", "mcp_tool_call"].includes(e.item?.type),
      )
      .map((e: any) =>
        Object.fromEntries(
          Object.entries(e.item).filter(([key]) => key !== "result"),
        ),
      ),
  }));
}
export function validateContextualTarget(
  run: any,
  id: string,
  route: "skill-web" | "mcp",
) {
  const issues: string[] = [];
  const fail = (s: string) => issues.push(id + "/" + route + ": " + s);
  const requests = contextualRequests(id, route);
  const skill = readFileSync(fixtures + "SKILL.md", "utf8");
  if (
    run?.route !== route ||
    run?.method !== "codex-cli-host-capability-probe" ||
    run.turns?.length !== requests.length
  )
    return [id + "/" + route + ": incomplete actual history"];
  if (run.hostPolicy !== profiles[route]) fail("host profile changed");
  if (
    route === "skill-web" &&
    (run.skillManifest !== skill || run.skillSha256 !== sha(skill))
  )
    fail("frozen Skill differs");
  if (
    route === "mcp" &&
    (run.source !== "http://localhost:8791/mcp" || run.skillManifest !== null)
  )
    fail("local HTTP route differs");
  const thread = run.turns[0].threadId;
  for (let i = 0; i < requests.length; i++) {
    const t = run.turns[i];
    if (
      t.request !== requests[i] ||
      t.requestSha256 !== sha(requests[i]) ||
      t.exitCode !== 0 ||
      t.threadId !== thread
    )
      fail(`turn${i + 1} request/history differs`);
    const started = t.events.filter((e: any) => e.type === "thread.started"),
      completed = t.events.filter((e: any) => e.type === "turn.completed");
    if (
      started.length !== 1 ||
      started[0].thread_id !== thread ||
      completed.length !== 1 ||
      !Number.isInteger(completed[0].usage?.input_tokens) ||
      !(completed[0].usage?.output_tokens > 0)
    )
      fail(`turn${i + 1} missing actual thread/completion/usage`);
    if (
      t.nativeTrace.some(
        (r: any) =>
          ![
            "user_message",
            "host_agents_context",
            "custom_tool_call",
            "custom_tool_call_output",
            "function_call",
            "function_call_output",
          ].includes(r.type),
      )
    )
      fail(`turn${i + 1} unexpected native context type`);
    const users = t.nativeTrace.filter((r: any) => r.type === "user_message");
    const expansion =
      route === "skill-web" && requests[i].includes("$talksprout");
    const expanded = users[1]?.text?.match(
      /^<skill>\n<name>talksprout<\/name>\n<path>[^\n]+\/\.agents\/skills\/talksprout\/SKILL\.md<\/path>\n([\s\S]*)\n<\/skill>$/,
    );
    if (
      users.length !== (expansion ? 2 : 1) ||
      users[0].text !== requests[i] ||
      (expansion && expanded?.[1] !== skill)
    )
      fail(`turn${i + 1} native user/Skill expansion differs`);
    const final = t.events
      .filter(
        (e: any) =>
          e.type === "item.completed" && e.item?.type === "agent_message",
      )
      .at(-1)?.item.text;
    if (final?.trim() !== t.reply.trim())
      fail(`turn${i + 1} reply differs from event`);
    if (i > 0 && (t.command[2] !== "resume" || t.command[3] !== thread))
      fail(`turn${i + 1} not actual native resume`);
    const output = t.command.at(-2);
    const command = [
      "codex",
      "exec",
      ...(i === 0
        ? ["--strict-config", "--sandbox", "read-only"]
        : ["resume", thread]),
      "--ignore-user-config",
      "--ignore-rules",
      "--skip-git-repo-check",
      "-m",
      "gpt-6.1-sol",
      "--json",
      "-c",
      "developer_instructions=" + JSON.stringify(profiles[route]),
      "-c",
      "web_search=" +
        JSON.stringify(route === "skill-web" ? "live" : "disabled"),
      ...(route === "mcp"
        ? [
            "--disable",
            "shell_tool",
            "-c",
            'mcp_servers.talksprout.url="http://localhost:8791/mcp"',
          ]
        : []),
      "--output-last-message",
      output,
      "-",
    ];
    if (
      !output?.startsWith("/") ||
      !output.endsWith(`/turn-${i + 1}.txt`) ||
      !equal(t.command, command)
    )
      fail(`turn${i + 1} exact execution profile differs`);
  }
  return issues;
}
export function validateContextualArchive() {
  const index = JSON.parse(readFileSync(directory + "index.json", "utf8"));
  const issues: string[] = [];
  if (
    sha(readFileSync(directory + "index.json")) !==
    "1a1bef9c98aa7d4f2fffd12ed5e2911e9ed244f9526a21a9d30c0916d07faabd"
  )
    issues.push("contextual index changed");
  const files = new Map<string, any>();
  const outcomes: any[] = [];
  const targetIds = new Set<string>();
  for (const row of index.files) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(row.file)) {
      issues.push("invalid contextual filename");
      continue;
    }
    const bytes = readFileSync(directory + row.file);
    if (sha(bytes) !== row.sha256 || bytes.length !== row.bytes)
      issues.push("contextual artifact changed: " + row.file);
    files.set(
      row.file,
      row.file.endsWith(".json")
        ? JSON.parse(bytes.toString())
        : bytes.toString(),
    );
  }
  const allTargetIds = new Set(
    plan.cases.flatMap((c) =>
      ["skill-web", "mcp"].map(
        (route) => files.get(c.id + "--" + route + ".json").turns[0].threadId,
      ),
    ),
  );
  const judgeIds = new Set<string>();
  for (const route of ["skill-web", "mcp"] as const) {
    const sessions = plan.cases.map((c) => {
      const raw = files.get(c.id + "--" + route + ".json");
      issues.push(...validateContextualTarget(raw, c.id, route));
      if (targetIds.has(raw.turns[0].threadId))
        issues.push("contextual target thread reused");
      targetIds.add(raw.turns[0].threadId);
      return { caseId: c.id, checks: c.checks, turns: summaries(raw) };
    });
    const judge = files.get(route + "-judge.json"),
      policy = readFileSync(fixtures + "judge-policy.txt", "utf8");
    const expected = {
      route,
      runtime: readFileSync(fixtures + "runtime-en.md", "utf8"),
      sessions,
    };
    try {
      if (
        judge.policy !== policy ||
        !judge.request.startsWith(policy) ||
        !equal(JSON.parse(judge.request.slice(policy.length)), expected) ||
        judge.requestSha256 !== sha(judge.request)
      )
        issues.push(route + ": judge input differs");
    } catch {
      issues.push(route + ": invalid judge input");
    }
    const refs = judge.sessionReferences;
    if (
      refs.length !== plan.cases.length ||
      new Set(refs.map((r: any) => r.caseId)).size !== plan.cases.length
    )
      issues.push(route + ": incomplete judge references");
    for (const c of plan.cases) {
      const file = c.id + "--" + route + ".json",
        ref = refs.find((r: any) => r.caseId === c.id);
      if (
        ref?.file !== file ||
        ref.sha256 !== sha(readFileSync(directory + file))
      )
        issues.push(route + ": judge target reference differs");
    }
    const started = judge.events.filter(
        (e: any) => e.type === "thread.started",
      ),
      completed = judge.events.filter((e: any) => e.type === "turn.completed");
    if (
      judge.exitCode !== 0 ||
      started.length !== 1 ||
      allTargetIds.has(started[0]?.thread_id) ||
      judgeIds.has(started[0]?.thread_id) ||
      completed.length !== 1 ||
      !(completed[0].usage?.output_tokens > 0) ||
      !matchesBehaviorJudgeCommand(judge.command, true)
    )
      issues.push(route + ": judge execution/isolation differs");
    judgeIds.add(started[0]?.thread_id);
    if (
      judge.events.some(
        (e: any) =>
          e.type === "item.completed" &&
          !["agent_message", "reasoning"].includes(e.item?.type),
      )
    )
      issues.push(route + ": judge used tools");
    try {
      const text = judge.events
        .filter(
          (e: any) =>
            e.type === "item.completed" && e.item?.type === "agent_message",
        )
        .at(-1)?.item.text;
      if (!equal(JSON.parse(text), judge.output))
        issues.push(route + ": judge output differs");
    } catch {
      issues.push(route + ": judge output absent");
    }
    if (
      judge.output.assessments.length !== plan.cases.length ||
      new Set(judge.output.assessments.map((a: any) => a.caseId)).size !==
        plan.cases.length
    )
      issues.push(route + ": assessment coverage differs");
    for (const c of plan.cases) {
      const a = judge.output.assessments.find((a: any) => a.caseId === c.id);
      if (a?.verdict !== "pass")
        issues.push(route + "/" + c.id + ": contextual behavior not accepted");
    }
    outcomes.push({
      route,
      assessments: judge.output.assessments,
      presentationObservations: judge.output.presentationObservations,
      scope: judge.output.scope,
    });
  }
  return {
    judgeInputScope:
      "Locally recorded CLI stdin/digest and dataset binding; ephemeral judge native input is unavailable and is NOT native-input-verified or provider-attested.",
    issues,
    version: "ai-v0.1.5",
    scope: index.scope,
    sessions: 12,
    targetTurns: 40,
    outcomes,
  };
}
