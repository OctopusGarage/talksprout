import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { companions } from "../src/content/companions.ts";
import { interaction } from "../src/content/interaction.ts";
import { materials } from "../src/content/materials.ts";
import { coachingRules } from "../src/content/coaching-rules.ts";

// Frozen from HEAD before extraction. Full-record hashes also protect metadata and order.
const beforeExtraction = [
  {
    "id": "daily-check-in",
    "promptSha256": "356f95f62ce181a45b93958bef9d5169f2e47e83f9ba9268afac41d67ad7f7e0",
    "spokenPromptSha256": "d3ece54a702036adad917704a57132dbfc0f9d7978089f184804dfc35d88a68b",
    "recordSha256": "686810f879c39006e6647dfa46a0454bedac1b6e96bdea9ff26ceff9fa621a1a"
  },
  {
    "id": "gentle-start",
    "promptSha256": "8a81edfb259d52983c951d1bc689820674b4acd15352108c5d66d78716865aea",
    "spokenPromptSha256": "6c36d395d0755d924f6a6ae3c4b5d7bdc5d3eaee19cbd24465d6248eb0e77563",
    "recordSha256": "44ada04585a47ede2fc50f53b38eadc8eefb7aee0c9b51b3e80bda0766f37d10"
  },
  {
    "id": "focused-correction",
    "promptSha256": "0e8fe21b4e917afcc0fb05204ca0bf2efccc04ee138b2d512008476195a3ec15",
    "spokenPromptSha256": "88f3c4de77c5ba45f21dff84e61a5713f7a3daa09fffb7e4fad6d87401536624",
    "recordSha256": "9a73fd88693175b531fc1b7ad1247b2fa0e2438f19ec0a5243b01737e6507e4b"
  },
  {
    "id": "expression-upgrade",
    "promptSha256": "b7ac01bc3f4e7ffd4527edebc067745c7da024dc2c1de0861f562e616bd05745",
    "spokenPromptSha256": "3bfc1981bfd2eca8a31861be91610783a6ece763315716a90ede2b0f3635d3e2",
    "recordSha256": "bfde606a9e647df8ad6a52623ca27f01a631fa1107426317762b17f7162a3389"
  },
  {
    "id": "roleplay-coach",
    "promptSha256": "db1dda5f40d1c15468a0771473764845f47f1bb4c901afa58a0194add549dbd9",
    "spokenPromptSha256": "edf717364a6e65763f0552d0f8ac69b64c4e5eb5aa9f7c0ab990a0309fef61c7",
    "recordSha256": "6083056d6724a65ce697fb003ed94974493a4f95af823167d7d9630f72b8e8d9"
  },
  {
    "id": "friendly-debate",
    "promptSha256": "bfe153ed38eb2d67980b773602b33a0dea3744b3bd6f5623b53904d50faf06be",
    "spokenPromptSha256": "0e9261fbef74ddd9461a60b0105a8e11c47c01b98dfca6112c7b0d2f503f3262",
    "recordSha256": "288f46f17b3f841900e672f14bee5902acce21a4b1b289171a53eae9627171e0"
  },
  {
    "id": "word-riddle",
    "promptSha256": "36e7dd01d20b0bd6690ff981de1f8a0cc2c78d4c252d4dfb33f85930c80d7934",
    "spokenPromptSha256": "d72dc8acdbfe052912d943a34ea1756966d56279ffc0382b6a7ad85e298b336d",
    "recordSha256": "5d32153188e69c56fb96135734bf262180c52fa753546738a2a4b572a8215d5c"
  },
  {
    "id": "visual-vocabulary",
    "promptSha256": "1d47ffdb6feaf04f9762c72c898b78cc82dcc569c60620902afa63355d1861df",
    "spokenPromptSha256": "9af1d7753622f5156ca8f1ce688b60d81e1c702f5b4a8a314a0973e358b6d71f",
    "recordSha256": "57a8ab306689e2b32f0f59e5a5d88094f33775a8348a16c783199bc6e6063222"
  },
  {
    "id": "story-summary",
    "promptSha256": "21b6eafdb1f5a38c29ee3716e1d406fec133ec6198ec0f3fe9d17378bea83bb2",
    "spokenPromptSha256": "5c8e30e0281b668b475273a2f46859297755b7918c16bf052ddbb37e143a87dd",
    "recordSha256": "a1cd50f7b14855ee3e7656b37c4760bdcedc6716f57b4eb48ba5c76956ef008f"
  }
] as const;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

test("shared coach-rule extraction preserves bytes apart from the separately evaluated roleplay guard", () => {
  const coaches = [...companions, ...interaction, ...materials];
  assert.deepEqual(coaches.map((original) => {
    const coach = original.id === "roleplay-coach" ? { ...original, version: 7, prompt: original.prompt.replace("\nAfter practice begins, use this reply order: one in-character STATEMENT, an optional correction STATEMENT, then ONE focused in-character question. Neither statement may contain a question or a separate request for an answer. Before sending, count question marks across the entire reply and remove all but one.", "") } : original;
    return ({
    id: coach.id,
    promptSha256: sha256(coach.prompt),
    spokenPromptSha256: sha256(coach.spokenPrompt),
    recordSha256: sha256(JSON.stringify(coach)),
  }); }), beforeExtraction);
});

test("every coach includes the complete shared contract exactly once", () => {
  for (const coach of [...companions, ...interaction, ...materials]) {
    assert.equal(coach.prompt.split(coachingRules).length, 2, coach.id);
  }
});
