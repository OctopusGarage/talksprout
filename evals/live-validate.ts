import { createLiveCases } from "./live-cases";
import { recordedSceneIds } from "./live-coverage";
import { evidenceDigest } from "./validate";
import policy from "./live-policy.json";
import { prompts } from "../src/prompts";
import { scenes, compatibleScenes, composeScene } from "../src/scenes";

type Row = Record<string, unknown>;
const object = (value: unknown): value is Row =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
const singleQuestionPurposes = new Set([
  "scene-opening",
  "mock-opening",
  "base-opening",
  "technical-coaching",
  "adapted-topic",
  "mock-follow-up",
]);
export function validateLiveArchive(value: unknown) {
  const issues: string[] = [];
  const recorded = new Set(recordedSceneIds);
  const known = new Set(scenes.map((scene) => scene.id));
  for (const id of recorded)
    if (!known.has(id)) issues.push(`live: recorded scene missing from catalog: ${id}`);
  const pendingSceneIds = scenes
    .filter((scene) => !recorded.has(scene.id))
    .map((scene) => scene.id);
  const coverage = {
    recordedScenes: recorded.size,
    pendingScenes: pendingSceneIds.length,
    pendingSceneIds,
  };
  if (!object(value) || !Array.isArray(value.cases))
    return { issues: [...issues, "live: missing cases"], cases: 0, adjudications: 0, ...coverage };
  if (
    value.method !== "live-openai-chat-completions" ||
    !text(value.completedAt) ||
    !text(value.requestedModel)
  )
    issues.push("live: missing execution provenance");
  if (value.endpoint !== "https://api.openai.com/v1/chat/completions")
    issues.push("live: unexpected provider endpoint");
  const policyHash = evidenceDigest({
    model: text(value.requestedModel) ? value.requestedModel : "",
    ...policy,
  });
  if (value.judgePolicySha256 !== policyHash)
    issues.push("live: stale judge policy");
  const expected = new Map(
    createLiveCases()
      .filter((c) => !c.selection || recorded.has(c.selection.sceneId))
      .map((c) => [c.id, c]),
  );
  const seen = new Set<string>();
  const judgeResponseIds = new Set<string>();
  let adjudications = 0;
  const rawCounts: Record<string, number> = { pass: 0, fail: 0, uncertain: 0 };
  for (const item of value.cases) {
    if (!object(item) || !object(item.case)) {
      issues.push("live: malformed case");
      continue;
    }
    const id = String(item.case.id);
    const fail = (reason: string) => issues.push(`${id}: ${reason}`);
    if (seen.has(id)) fail("duplicate live case");
    seen.add(id);
    const current = expected.get(id);
    if (
      !current ||
      evidenceDigest(item.case) !== evidenceDigest(current as unknown as Row)
    )
      fail("stale or unexpected live input");
    try {
      if (item.evidenceSha256 !== evidenceDigest(item))
        fail("stale live evidence");
    } catch {
      fail("invalid live evidence");
    }
    const target = item.target;
    if (
      !object(target) ||
      !text(target.responseId) ||
      !text(target.model) ||
      !text(target.content) ||
      target.finishReason !== "stop" ||
      !object(target.usage)
    ) {
      fail("missing or incomplete real target execution");
      continue;
    }
    const checks = item.contractChecks;
    const questionMarks = target.content.split("?").length - 1;
    const oneQuestion =
      !singleQuestionPurposes.has(String(item.case.purpose)) ||
      questionMarks <= 1;
    if (
      !object(checks) ||
      checks.questionMarks !== questionMarks ||
      checks.oneQuestionOpening !== oneQuestion
    )
      fail("incorrect mechanical checks");
    const judge = item.judge;
    if (
      !object(judge) ||
      judge.id !== id ||
      !["pass", "fail", "uncertain"].includes(String(judge.judgment)) ||
      !text(judge.reason)
    )
      fail("missing semantic judgment");
    const execution = item.judgeExecution;
    if (
      !object(execution) ||
      !text(execution.responseId) ||
      !text(execution.model) ||
      !object(execution.usage) ||
      execution.finishReason !== "stop"
    )
      fail("missing live judge execution");
    else if (policy.batch_size === 1) {
      const responseId = String(execution.responseId);
      if (judgeResponseIds.has(responseId))
        fail("judge execution must be isolated to one case");
      judgeResponseIds.add(responseId);
    }
    if (
      object(judge) &&
      typeof judge.judgment === "string" &&
      judge.judgment in rawCounts
    )
      rawCounts[judge.judgment]++;
    let effective = object(judge) ? judge.judgment : "fail";
    if (!oneQuestion) effective = "fail";
    if (item.adjudication !== undefined) {
      const review = item.adjudication;
      if (
        !object(review) ||
        review.reviewer !== "codex-semantic-review" ||
        !["pass", "fail"].includes(String(review.judgment)) ||
        !text(review.reason) ||
        review.reason.length < 40
      )
        fail("invalid semantic adjudication");
      else {
        const raw = { ...item };
        delete raw.adjudication;
        raw.gateJudgment = effective;
        if (
          review.id !== id ||
          review.payloadSha256 !== item.case.payloadSha256 ||
          review.observedReply !== target.content ||
          review.releaseBlocking !== false ||
          review.rawEvidenceSha256 !== evidenceDigest(raw) ||
          !object(review.rawJudge) ||
          !object(judge) ||
          evidenceDigest(review.rawJudge) !== evidenceDigest(judge)
        )
          fail("adjudication does not match original evidence");
        effective = review.judgment;
        adjudications++;
      }
    }
    if (item.gateJudgment !== effective)
      fail("gate differs from recorded evidence and review");
    if (effective !== "pass") fail("unresolved live finding");
  }
  if (value.adjudications !== adjudications)
    issues.push("live: inconsistent adjudication count");
  if (
    !object(value.rawJudgeSummary) ||
    Object.entries(rawCounts).some(
      ([key, count]) =>
        value.rawJudgeSummary && (value.rawJudgeSummary as Row)[key] !== count,
    )
  )
    issues.push("live: inconsistent raw judge summary");
  for (const id of expected.keys())
    if (!seen.has(id)) issues.push(`live: missing ${id}`);
  if (
    !object(value.summary) ||
    value.summary.pass !== value.cases.length ||
    value.summary.fail !== 0 ||
    value.summary.uncertain !== 0
  )
    issues.push("live: inconsistent release summary");
  return { issues, cases: value.cases.length, adjudications, ...coverage };
}
export function validateCompositionMatrix() {
  const issues: string[] = [];
  let combinations = 0;
  let payloads = 0;
  for (const p of prompts)
    for (const scene of compatibleScenes(p)) {
      const paces =
        scene.category === "interview" && p.id === "roleplay-coach"
          ? (["coached", "mock"] as const)
          : (["coached"] as const);
      for (const pace of paces) {
        combinations++;
        const composed = composeScene(p, {
          sceneId: scene.id,
          background: "",
          pace,
        });
        if (
          !composed.prompt.includes(scene.context) ||
          !composed.prompt.includes(scene.goal)
        )
          issues.push(`${p.id}/${scene.id}/${pace}: missing context`);
        if (
          composed.spokenPrompt.trim().split(/\s+/).length > 85 ||
          /[\u3400-\u9fff]/.test(composed.spokenPrompt)
        )
          issues.push(`${p.id}/${scene.id}/${pace}: invalid spoken format`);
        if (/\bundefined\b/.test(composed.prompt + composed.spokenPrompt))
          issues.push(`${p.id}/${scene.id}/${pace}: undefined text`);
        if (pace === "mock" && !composed.prompt.includes("Save feedback until"))
          issues.push(`${scene.id}: immediate mock feedback`);
        payloads += 2;
      }
    }
  return { scenes: scenes.length, combinations, payloads, issues };
}
