import test from "node:test";
import assert from "node:assert/strict";
import config from "../distribution/config.json";
import { skillInstallPrompt, mcpSetupPrompt } from "../src/ai-onboarding";
test("setup instructions contain only the installation task and connection essentials", () => {
  for (const locale of ["zh", "en"] as const) {
    const skill = skillInstallPrompt(config, locale),
      mcp = mcpSetupPrompt(config, locale);
    assert.ok(skill.length < 240);
    assert.ok(mcp.length < 250);
    assert.ok(skill.includes("/skills/talksprout"));
    assert.ok(mcp.includes(config.mcpEndpoint));
    assert.doesNotMatch(
      skill + mcp,
      /interview|practice|learner|learning index|Explain in|练习|面试|读取目录|Chinese/,
    );
  }
});

import { aiExamples } from "../src/ai-onboarding";
test("bare contextual invocation leads both languages without bloating installation commands", () => {
  assert.equal(aiExamples.zh[0], "$talksprout");
  assert.equal(aiExamples.en[0], "$talksprout");
  assert.ok(aiExamples.zh.length > 1 && aiExamples.en.length > 1);
});

test("minimal installation copy also supports the one-time bootstrap migration", () => {
  assert.match(
    skillInstallPrompt(config, "zh"),
    /^请安装或更新 TalkSprout Skill：/,
  );
  assert.match(
    skillInstallPrompt(config, "en"),
    /^Install or update the TalkSprout Skill:/,
  );
});
