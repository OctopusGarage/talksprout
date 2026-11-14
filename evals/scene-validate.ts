import { createHash } from "node:crypto";
import { prompts } from "../src/prompts";
import {
  composeScene,
  compatibleScenes,
  type SceneSelection,
} from "../src/scenes";
import { promptText } from "../src/prompt-text";
import { evidenceDigest } from "./validate";
import type { PromptVariant } from "../src/types";

export const representativeSceneIds = [
  "basketball",
  "tennis",
  "travel-plans",
  "cooking",
  "work-03",
  "work-04",
  "work-31",
  "work-08",
  "project-deep-dive",
  "race-conditions",
  "url-shortener",
  "agent-tools",
];
export function scenePayloadDigest(
  promptId: string,
  variant: PromptVariant,
  selection: SceneSelection,
) {
  const prompt = prompts.find((p) => p.id === promptId);
  if (!prompt) throw Error("Unknown coach");
  return createHash("sha256")
    .update(promptText(composeScene(prompt, selection), variant))
    .digest("hex");
}
export function validateSceneArchive(archive: unknown): string[] {
  const issues: string[] = [];
  if (
    !archive ||
    typeof archive !== "object" ||
    !("cases" in archive) ||
    !Array.isArray(archive.cases)
  )
    return ["scenes: missing cases"];
  const ids = new Set<string>();
  const covered = new Set<string>();
  const edges = new Set<string>();
  const purposes = new Set([
    "opening",
    "retry",
    "mock-review",
    "background-isolation",
    "stop",
  ]);
  for (const item of archive.cases) {
    if (!item || typeof item !== "object") {
      issues.push("scenes: invalid case");
      continue;
    }
    const row = item as Record<string, unknown>;
    const label = String(row.id ?? "scenes");
    const error = (message: string) => issues.push(`${label}: ${message}`);
    if (typeof row.id !== "string" || !row.id || ids.has(row.id))
      error("missing or duplicate ID");
    else ids.add(row.id);
    const prompt = prompts.find((p) => p.id === row.promptId);
    const selection = row.selection as SceneSelection | undefined;
    if (
      !prompt ||
      !selection ||
      typeof selection.background !== "string" ||
      !["coached", "mock"].includes(selection.pace) ||
      !compatibleScenes(prompt).some((s) => s.id === selection.sceneId) ||
      !["full", "spoken"].includes(String(row.variant))
    ) {
      error("invalid composition");
      continue;
    }
    const scene = compatibleScenes(prompt).find(
      (s) => s.id === selection.sceneId,
    )!;
    if (
      selection.pace === "mock" &&
      (prompt.id !== "roleplay-coach" || scene.category !== "interview")
    )
      error("invalid mock pacing");
    if (typeof row.purpose !== "string" || !purposes.has(row.purpose))
      error("unknown purpose");
    if (
      row.payloadSha256 !==
      scenePayloadDigest(prompt.id, row.variant as PromptVariant, selection)
    )
      error("stale payload");
    if (row.evidenceSha256 !== evidenceDigest(row)) error("stale evidence");
    if (
      row.method !== "authored-role-simulation" ||
      row.judgment !== "pass" ||
      typeof row.rationale !== "string" ||
      !row.rationale.trim()
    )
      error("missing authored judgment");
    const turns = row.turns;
    if (
      !Array.isArray(turns) ||
      !turns.length ||
      !turns.every(
        (t) =>
          t &&
          ["assistant", "user"].includes(t.role) &&
          typeof t.content === "string" &&
          t.content.trim(),
      ) ||
      turns.at(-1)?.role !== "assistant"
    )
      error("invalid turns");
    if (
      Array.isArray(turns) &&
      turns.some(
        (turn, index) =>
          !turn || turn.role !== (index % 2 === 0 ? "assistant" : "user"),
      )
    )
      error("turns must alternate from assistant");
    if (row.purpose === "opening") {
      if (
        !Array.isArray(turns) ||
        turns.length !== 1 ||
        turns[0]?.role !== "assistant"
      )
        error("opening must be one assistant turn");
      covered.add(`${selection.sceneId}:${row.variant}`);
    } else if (typeof row.purpose === "string") {
      if (
        !Array.isArray(turns) ||
        turns.length < 3 ||
        !turns.some((t) => t.role === "user")
      )
        error("edge case needs learner turns");
      const contract =
        row.purpose === "retry"
          ? ["focused-correction", "expression-upgrade"].includes(prompt.id) &&
            Array.isArray(turns) &&
            turns.length >= 5
          : row.purpose === "mock-review"
            ? prompt.id === "roleplay-coach" &&
              scene.category === "interview" &&
              selection.pace === "mock"
            : row.purpose === "background-isolation"
              ? row.variant === "full" && selection.background.trim().length > 0
              : row.purpose === "stop"
                ? Array.isArray(turns) &&
                  turns.some(
                    (turn) =>
                      turn?.role === "user" &&
                      /\b(finish|stop)\b|结束/i.test(turn.content),
                  )
                : false;
      if (contract) edges.add(row.purpose);
      else error(`${row.purpose} contract is not represented`);
    }
  }
  for (const id of representativeSceneIds)
    for (const variant of ["full", "spoken"])
      if (!covered.has(`${id}:${variant}`))
        issues.push(`scenes: missing ${id}/${variant}`);
  for (const edge of ["retry", "mock-review", "background-isolation", "stop"])
    if (!edges.has(edge)) issues.push(`scenes: missing ${edge}`);
  return issues;
}
