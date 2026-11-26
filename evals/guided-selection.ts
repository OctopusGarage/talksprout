import { hasForwardedMcpDocument } from "./behavior-validate";
import { splitBehaviorViewerDocuments } from "./behavior-tools";
import wrapperInspections from "./fixtures/guided-wrapper-inspections.json";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { inspectBehaviorWrapper, isBehaviorWebUrl } from "./behavior-tools";
import {
  behaviorProbeHostPolicy,
  behaviorModel,
  matchesBehaviorJudgeCommand,
} from "./behavior-policy";
import guidance from "./fixtures/behavior-sources/guidance-ai-v0.1.3.json";
import config from "../distribution/config.json";
import numberedCases from "./fixtures/guided-numbered-cases.json";
import cases from "./fixtures/guided-selection-cases.json";
const directory = "evals/results/guided-selection-0.1.3/";
function historicalDocument(path: string): string {
  return readFileSync(
    ["en/start.md", "zh/start.md"].includes(path)
      ? `evals/fixtures/behavior-sources/entry-ai-v0.1.3-${path.slice(0, 2)}.md`
      : "content/" + path,
    "utf8",
  );
}
const sha = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
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
const equal = (a: unknown, b: unknown) =>
  JSON.stringify(stable(a)) === JSON.stringify(stable(b));
const mcpHost =
  "This is a controlled host-capability probe for the learner-requested TalkSprout integration. Use only TalkSprout public GitHub learning documents or its configured MCP. Do not use unrelated services, edit files or read local learning content. Do not use shell commands.";
const endpoint = "http://localhost:8791/mcp";
/** Match individual viewer documents, never URL from one result and body from another. */
export function completeGuidedWebDocument(
  turns: any[],
  path: string,
  expected: string,
): boolean {
  const normalize = (s: string) =>
    s
      .replace(/^L\d+:\s?/gm, "")
      .replace(/\s+/g, " ")
      .trim();
  for (const turn of turns) {
    const calls = new Map<string, any>(
      turn.nativeTrace
        .filter((r: any) => r.type === "custom_tool_call")
        .map((r: any) => [r.call_id, r]),
    );
    for (const result of turn.nativeTrace.filter(
      (r: any) => r.type === "custom_tool_call_output",
    )) {
      const call = calls.get(result.call_id);
      if (!call || call.name !== "exec" || call.status !== "completed")
        continue;
      const inspected = inspectBehaviorWrapper(call.input, "skill-web");
      if (!inspected.valid) continue;
      const blocks = Array.isArray(result.output) ? [...result.output] : [];
      if (
        blocks[0]?.type === "input_text" &&
        /^Script completed\nWall time [^\n]+\nOutput:\n/.test(blocks[0].text)
      )
        blocks.shift();
      const emissions = inspected.emissions ?? [];
      if (blocks.length !== emissions.length) continue;
      for (let emitted = 0; emitted < emissions.length; emitted++) {
        const emission = emissions[emitted],
          block = blocks[emitted];
        if (
          emission.kind !== "forwarded" ||
          !emission.calls.length ||
          emission.calls.some((c) => c.name !== "web__run")
        )
          continue;
        const urls = emission.calls.flatMap((c) =>
          (c.arguments.open as any[]).map((e) => e.ref_id),
        );
        if (block.type !== "input_text" || typeof block.text !== "string")
          continue;
        for (const document of splitBehaviorViewerDocuments(block.text)) {
          if (
            isBehaviorWebUrl(document.url) &&
            document.url.endsWith("/content/" + path) &&
            urls.includes(document.url) &&
            normalize(document.body) === normalize(expected)
          )
            return true;
        }
      }
    }
  }
  return false;
}
function guidedMcpForwarded(
  turn: any,
  path: string,
  document: string,
): boolean {
  if (hasForwardedMcpDocument(turn, path, document)) return true;
  const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
  return turn.nativeTrace.some((output: any) => {
    if (output.type !== "custom_tool_call_output") return false;
    const call = turn.nativeTrace.find(
      (r: any) =>
        r.type === "custom_tool_call" &&
        r.call_id === output.call_id &&
        r.name === "exec" &&
        r.status === "completed",
    );
    if (
      !call ||
      !wrapperInspections.some(
        (r) => r.sha256 === sha(call.input) && r.source === call.input,
      ) ||
      !call.input.includes(
        "tools.mcp__talksprout__read_document({path:" +
          JSON.stringify(path) +
          "})",
      )
    )
      return false;
    return (
      Array.isArray(output.output) &&
      output.output.some(
        (block: any) =>
          block.type === "input_text" &&
          typeof block.text === "string" &&
          normalize(block.text) === normalize(document),
      )
    );
  });
}
export function validateGuidedTarget(
  run: any,
  route: "skill-web" | "mcp",
  spec: { turns: { id: string; input: string; expected: string }[] } = cases,
) {
  const issues: string[] = [];
  const sourceInspectionNotes: string[] = [];
  const fail = (s: string) => issues.push(route + ": " + s);
  if (
    !run ||
    run.route !== route ||
    run.method !== "codex-cli-host-capability-probe" ||
    run.turns?.length !== spec.turns.length
  )
    return { issues: [route + ": missing/wrong actual trajectory"] };
  const testedSkill = readFileSync(
    "evals/fixtures/guided-bootstrap-tested.md",
    "utf8",
  );
  const skill = testedSkill;
  const releasedBootstrap = readFileSync(
    "evals/fixtures/behavior-sources/skill-ai-v0.1.3.md",
    "utf8",
  );
  if (
    releasedBootstrap !==
    testedSkill.replace(
      "try the same entry through https://github.com/OctopusGarage/talksprout/blob/main/content/ once.",
      "try https://github.com/OctopusGarage/talksprout/blob/main/content/en/start.md or https://github.com/OctopusGarage/talksprout/blob/main/content/zh/start.md once, using the same learner language.",
    )
  )
    fail(
      "archived 0.1.3 bootstrap differs beyond declared unexercised fallback-only correction",
    );
  const thread = run.turns[0].threadId;
  const readEvents = run.turns.flatMap((t: any) =>
    t.events.filter(
      (e: any) =>
        e.type === "item.completed" && e.item?.type === "command_execution",
    ),
  );
  const installed = readEvents[0]?.item.command?.match(
    /^\/bin\/zsh -lc 'cat (\/[A-Za-z0-9_./-]+\/talksprout-realistic-skill-probe-[a-z0-9]+\/\.agents\/skills\/talksprout\/SKILL\.md)'$/,
  )?.[1];
  if (
    route === "skill-web" &&
    (run.skillManifest !== skill ||
      run.skillSha256 !== sha(skill) ||
      readEvents.length !== 1 ||
      !installed ||
      readEvents[0].item.aggregated_output !== skill ||
      readEvents[0].item.exit_code !== 0)
  )
    fail("installed historical Skill/read isolation differs");
  if (
    route === "mcp" &&
    (run.source !== endpoint || readEvents.length || run.skillManifest !== null)
  )
    fail("local MCP route differs");
  const mockDeadline = spec.turns.findIndex((t) => t.id === "mock"),
    methodDeadline = spec.turns.findIndex((t) => t.id === "explain-method");
  let guideObserved = false,
    entryObserved = false,
    methodObserved = false,
    documentObserved = false;
  for (let i = 0; i < spec.turns.length; i++) {
    const t = run.turns[i];
    let request = spec.turns[i].input;
    if (request === "@menu:source-skills") {
      const matches = [
        ...run.turns[i - 1].reply.matchAll(/^\s*\**(\d+)[.、)]\s*([^\n]*)/gm),
      ].filter((m: any) =>
        ["听力", "阅读", "写作"].every((word) => m[2].includes(word)),
      );
      if (matches.length !== 1)
        fail("numbered goal cannot be uniquely derived from actual menu");
      request = matches[0]?.[1] ?? "unresolved";
    }
    const host = route === "skill-web" ? behaviorProbeHostPolicy : mcpHost;
    if (
      t.request !== request ||
      t.requestSha256 !== sha(request) ||
      t.threadId !== thread ||
      t.exitCode !== 0 ||
      run.hostPolicy !== host
    )
      fail(`turn${i + 1} request/native execution differs`);
    const users = t.nativeTrace.filter((r: any) => r.type === "user_message");
    if (users.length !== 1 || users[0].text !== request)
      fail(`turn${i + 1} extra/missing native user input`);
    const hosts = t.nativeTrace.filter(
      (r: any) => r.type === "host_agents_context",
    );
    if (
      hosts.length !== (i === 0 ? 1 : 0) ||
      hosts.some((r: any) => !/^[0-9a-f]{64}$/.test(r.sha256))
    )
      fail(`turn${i + 1} unexpected host context`);
    const output = t.command.at(-2);
    const expectedCommand = [
      "codex",
      "exec",
      ...(i === 0
        ? ["--strict-config", "--sandbox", "read-only"]
        : ["resume", thread]),
      "--ignore-user-config",
      "--ignore-rules",
      "--skip-git-repo-check",
      "-m",
      behaviorModel,
      "--json",
      "-c",
      "developer_instructions=" + JSON.stringify(host),
      "-c",
      "web_search=" +
        JSON.stringify(route === "skill-web" ? "live" : "disabled"),
      ...(route === "mcp"
        ? [
            "--disable",
            "shell_tool",
            "-c",
            "mcp_servers.talksprout.url=" + JSON.stringify(endpoint),
          ]
        : []),
      "--output-last-message",
      output,
      "-",
    ];
    if (
      !output?.startsWith("/") ||
      !output.endsWith(`/turn-${i + 1}.txt`) ||
      !equal(t.command, expectedCommand)
    )
      fail(`turn${i + 1} exact capability command differs`);
    const completed = t.events.filter((e: any) => e.type === "turn.completed");
    const threads = t.events.filter((e: any) => e.type === "thread.started");
    if (
      completed.length !== 1 ||
      !(completed[0].usage?.output_tokens > 0) ||
      threads.length !== 1 ||
      threads[0].thread_id !== thread
    )
      fail(`turn${i + 1} completion/usage/thread missing`);
    const final = t.events
      .filter(
        (e: any) =>
          e.type === "item.completed" && e.item?.type === "agent_message",
      )
      .at(-1)?.item.text;
    if (final?.trim() !== t.reply.trim())
      fail(`turn${i + 1} reply differs from native event`);
    const allowedRecords = [
      "host_agents_context",
      "user_message",
      "custom_tool_call",
      "custom_tool_call_output",
    ];
    if (t.nativeTrace.some((r: any) => !allowedRecords.includes(r.type)))
      fail(`turn${i + 1} foreign native context/tool`);
    const calls = t.nativeTrace.filter(
      (r: any) => r.type === "custom_tool_call",
    );
    if (new Set(calls.map((r: any) => r.call_id)).size !== calls.length)
      fail(`turn${i + 1} duplicate native call`);
    for (const call of calls) {
      if (call.name !== "exec" || call.status !== "completed")
        fail(`turn${i + 1} foreign/unverified wrapper`);
      else if (
        !inspectBehaviorWrapper(
          call.input,
          route,
          route === "skill-web" ? installed : undefined,
        ).valid
      ) {
        const reviewed = wrapperInspections.find(
          (r) => r.sha256 === sha(call.input) && r.source === call.input,
        );
        if (!reviewed) fail(`turn${i + 1} foreign/unverified wrapper`);
        else sourceInspectionNotes.push(`turn${i + 1}: ${reviewed.inspection}`);
      }
    }
    for (const result of t.nativeTrace.filter(
      (r: any) => r.type === "custom_tool_call_output",
    )) {
      const origin = calls.find((r: any) => r.call_id === result.call_id);
      if (
        !origin ||
        t.nativeTrace.indexOf(origin) > t.nativeTrace.indexOf(result) ||
        t.nativeTrace.filter(
          (r: any) =>
            r.type === "custom_tool_call_output" &&
            r.call_id === result.call_id,
        ).length !== 1
      )
        fail(`turn${i + 1} orphan/duplicate output`);
    }
    for (const e of t.events.filter((e: any) => e.type === "item.completed")) {
      const item = e.item;
      if (["agent_message", "reasoning"].includes(item?.type)) continue;
      if (route === "skill-web") {
        if (item?.type === "command_execution") continue;
        if (
          item?.type !== "web_search" ||
          (item.action?.url && !isBehaviorWebUrl(item.action.url))
        )
          fail(`turn${i + 1} non-web foreign capability`);
      } else {
        if (
          item?.type !== "mcp_tool_call" ||
          item.server !== "talksprout" ||
          item.status !== "completed" ||
          item.error ||
          item.result?.isError ||
          ![
            "get_guide",
            "read_document",
            "list_documents",
            "search_documents",
          ].includes(item.tool)
        ) {
          fail(`turn${i + 1} foreign/error MCP result`);
          continue;
        }
        const metadata = item.result?.structured_content;
        if (
          ["get_guide", "read_document"].includes(item.tool) &&
          (metadata?.version !== "0.1.3" ||
            metadata?.sourceRevision !== "local" ||
            metadata?.guidanceVersion !== sha(JSON.stringify(guidance)))
        )
          fail(`turn${i + 1} actual local guidance identity differs`);
        if (
          item.tool === "get_guide" &&
          item.result.content.some(
            (c: any) => c.type === "text" && c.text.includes("zh/start.md"),
          )
        )
          guideObserved = true;
        const path = item.arguments?.path;
        if (
          item.tool === "read_document" &&
          metadata?.path === path &&
          [
            "zh/start.md",
            "zh/scenarios/roleplay-coach/project-deep-dive-mock.md",
            "zh/guides/choose-feedback-style.md",
          ].includes(path) &&
          item.result.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n") === historicalDocument(path) &&
          guidedMcpForwarded(t, path, historicalDocument(path))
        ) {
          if (path === "zh/start.md" && i === 0) entryObserved = true;
          if (
            path === "zh/scenarios/roleplay-coach/project-deep-dive-mock.md" &&
            i <= mockDeadline
          )
            documentObserved = true;
          if (
            path === "zh/guides/choose-feedback-style.md" &&
            i <= methodDeadline
          )
            methodObserved = true;
        }
      }
    }
  }
  if (
    route === "mcp" &&
    (!guideObserved ||
      !entryObserved ||
      (spec.turns.some((t) => t.id === "mock") && !documentObserved) ||
      (spec.turns.some((t) => t.id === "explain-method") && !methodObserved))
  )
    fail("complete historical guidance/full mock source not observed");
  if (route === "skill-web") {
    const required = [
      { path: "zh/start.md", turns: run.turns.slice(0, 1) },
      ...(spec.turns.some((t) => t.id === "mock")
        ? [
            {
              path: "zh/scenarios/roleplay-coach/project-deep-dive-mock.md",
              turns: run.turns.slice(0, mockDeadline + 1),
            },
          ]
        : []),
      ...(spec.turns.some((t) => t.id === "explain-method")
        ? [
            {
              path: "zh/guides/choose-feedback-style.md",
              turns: run.turns.slice(0, methodDeadline + 1),
            },
          ]
        : []),
    ];
    for (const source of required)
      if (
        !completeGuidedWebDocument(
          source.turns,
          source.path,
          historicalDocument(source.path),
        )
      )
        fail("complete selected web source not observed: " + source.path);
  }
  const finishIndex = spec.turns.findIndex((t) => t.id === "finish");
  if (
    finishIndex >= 0 &&
    run.turns[finishIndex].reply.trim() !== "Practice finished."
  )
    fail("stop without practice answers was not exact");
  return { issues, sourceInspectionNotes };
}

export function guidedJudgePayload(route: string, run: any, numbered: any) {
  return {
    route,
    expected: cases,
    numberedExpected: numberedCases,
    bootstrap:
      run.skillManifest ??
      readFileSync("evals/fixtures/guided-bootstrap-tested.md", "utf8"),
    entry: historicalDocument("zh/start.md"),
    guidance,
    catalog: readFileSync("content/zh/prompts/index.md", "utf8"),
    scenes: readFileSync(
      "content/zh/scenarios/roleplay-coach/index.md",
      "utf8",
    ),
    guides: readFileSync("content/zh/guides/index.md", "utf8"),
    selectedGuide: readFileSync(
      "content/zh/guides/choose-feedback-style.md",
      "utf8",
    ),
    selectedScene: readFileSync(
      "content/zh/scenarios/roleplay-coach/project-deep-dive-mock.md",
      "utf8",
    ),
    readingTask: readFileSync("content/zh/prompts/reading-check.md", "utf8"),
    numberedTurns: numbered.turns.map((t: any) => ({
      request: t.request,
      reply: t.reply,
      visibleMessages: t.events
        .filter(
          (e: any) =>
            e.type === "item.completed" && e.item?.type === "agent_message",
        )
        .map((e: any) => e.item.text),
      retrievalCalls: t.events
        .filter(
          (e: any) =>
            e.type === "item.completed" &&
            ["web_search", "mcp_tool_call"].includes(e.item?.type),
        )
        .map((e: any) =>
          Object.fromEntries(
            Object.entries(e.item).filter(([k]) => k !== "result"),
          ),
        ),
    })),
    turns: run.turns.map((t: any) => ({
      request: t.request,
      reply: t.reply,
      visibleMessages: t.events
        .filter(
          (e: any) =>
            e.type === "item.completed" && e.item?.type === "agent_message",
        )
        .map((e: any) => e.item.text),
      retrievalCalls: t.events
        .filter(
          (e: any) =>
            e.type === "item.completed" &&
            ["web_search", "mcp_tool_call"].includes(e.item?.type),
        )
        .map((e: any) =>
          Object.fromEntries(
            Object.entries(e.item).filter(([k]) => k !== "result"),
          ),
        ),
    })),
  };
}
export function validateGuidedSelectionArchive() {
  const index = JSON.parse(readFileSync(directory + "index.json", "utf8"));
  const issues: string[] = [];
  const outcomes: any[] = [];
  if (
    sha(readFileSync(directory + "index.json")) !==
    "90d3852010b1af49561ef7985be79ea68ba7932974afb440bb62cfe9fbeb9a24"
  )
    issues.push("guided index changed");
  if (
    index.schemaVersion !== 1 ||
    index.scope !==
      "pre-release actual local-MCP and standalone-Skill guided selection; not production deployment"
  )
    issues.push("guided archive scope differs");
  const files = new Map<string, any>();
  for (const entry of index.files) {
    if (!/^[A-Za-z0-9_.-]+$/.test(entry.file)) {
      issues.push("invalid guided archive path");
      continue;
    }
    const bytes = readFileSync(directory + entry.file);
    if (sha(bytes) !== entry.sha256 || bytes.length !== entry.bytes)
      issues.push("guided archive bytes changed: " + entry.file);
    files.set(
      entry.file,
      entry.file.endsWith(".json")
        ? JSON.parse(bytes.toString())
        : bytes.toString(),
    );
  }
  for (const route of ["skill-web", "mcp"] as const) {
    const run = files.get(route + ".json");
    const checked = validateGuidedTarget(run, route);
    issues.push(...checked.issues);
    const numbered = files.get("numbered-" + route + ".json");
    const numberChecked = validateGuidedTarget(numbered, route, numberedCases);
    issues.push(...numberChecked.issues);
    const judge = files.get(route + "-judge.json");
    const policy = readFileSync(
      "evals/fixtures/guided-selection-judge-policy.txt",
      "utf8",
    );
    if (
      !judge ||
      judge.exitCode !== 0 ||
      judge.sourceProbeSha256 !==
        sha(readFileSync(directory + route + ".json")) ||
      judge.policy !== policy ||
      judge.requestSha256 !== sha(judge.request) ||
      !judge.request.startsWith(policy)
    ) {
      issues.push(route + ": missing/changed actual judge provenance");
      continue;
    }
    try {
      if (
        !equal(
          JSON.parse(judge.request.slice(policy.length)),
          guidedJudgePayload(route, run, numbered),
        )
      )
        issues.push(route + ": judge trajectory/source input differs");
    } catch {
      issues.push(route + ": judge JSON input missing");
    }
    const threads = judge.events.filter(
        (e: any) => e.type === "thread.started",
      ),
      completed = judge.events.filter((e: any) => e.type === "turn.completed");
    if (
      threads.length !== 1 ||
      [run.turns[0].threadId, numbered.turns[0].threadId].includes(
        threads[0].thread_id,
      ) ||
      completed.length !== 1 ||
      !(completed[0].usage?.output_tokens > 0)
    )
      issues.push(route + ": judge isolation/completion missing");
    if (
      judge.events.some(
        (e: any) =>
          e.type === "item.completed" &&
          !["agent_message", "reasoning"].includes(e.item?.type),
      )
    )
      issues.push(route + ": judge used tools");
    if (!matchesBehaviorJudgeCommand(judge.command, true))
      issues.push(route + ": judge capability command differs");
    try {
      const last = judge.events
        .filter(
          (e: any) =>
            e.type === "item.completed" && e.item?.type === "agent_message",
        )
        .at(-1)?.item.text;
      if (!equal(JSON.parse(last), judge.output))
        issues.push(route + ": judge actual output differs");
    } catch {
      issues.push(route + ": judge output absent");
    }
    if (judge.output?.verdict !== "pass" || judge.output?.findings?.length)
      issues.push(route + ": guided behavior not accepted");
    outcomes.push({
      route,
      sourceInspectionNotes: [
        ...(checked.sourceInspectionNotes ?? []),
        ...(numberChecked.sourceInspectionNotes ?? []),
      ],
      targetTurns: run.turns.length + numbered.turns.length,
      verdict: judge.output?.verdict,
      presentationObservations: judge.output?.presentationObservations,
      scope: judge.output?.scope,
    });
  }
  return {
    issues,
    scope: index.scope,
    bootstrapScope:
      "Historical ai-v0.1.3 runs used frozen 1529-byte primary-route bootstrap, linked to the frozen 1627-byte release by its fallback-only correction. These do not evaluate ai-v0.1.4 or Gemini Web; fallback was not model-tested.",
    outcomes,
  };
}
