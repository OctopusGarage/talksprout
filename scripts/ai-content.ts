import guidance from "../distribution/guidance.json";
import { buildStudyNoteArchiveGuide } from "../src/content/study-note-archive";
import { allPrompts } from "../src/prompts";
import { learningPrompts } from "../src/content/learning";
import { companionArticles } from "../src/content/companion-guides";
import { expandedArticles } from "../src/content/expanded-reading";
import { compatibleScenes, composeScene } from "../src/scenes";
import { promptText, learningPromptText } from "../src/prompt-text";

export function buildDocuments(
  entryGuidance: { instructions: string } = guidance,
): Record<string, string> {
  const files: Record<string, string> = {
    "en/notes.md": buildStudyNoteArchiveGuide(),
    "en/start.md": `# TalkSprout session guide\n\n${entryGuidance.instructions}\n\n## Catalogs\n\n- [Coaches, reviews and learning tools](prompts/index.md)\n- [Compatible scenarios and interview pacing](scenarios/index.md)\n- [Learning methods and configurations](guides/index.md)\n- [Practice workflow](guides/complete-workflow.md)\n- [Study note archiving](notes.md)\n`,
    "en/index.md":
      "# TalkSprout English practice library\n\nInstructions are maintained in English. Explain choices and feedback in the learner’s preferred language; keep English practice in English. Read the selected task before starting.\n\n- [Session guide](start.md)\n- [Coaches, reviews and learning tools](prompts/index.md)\n- [Scenarios](scenarios/index.md)\n- [Learning guides](guides/index.md)\n- [Study note archiving](notes.md)\n",
  };
  const catalogs: Record<string, string[]> = {};
  const add = (path: string, title: string, body: string) => {
    files[path] = `# ${title}\n\n${body.trimEnd()}\n`;
    const directory = path.slice(0, path.lastIndexOf("/"));
    (catalogs[directory] ??= []).push(
      `- [${title}](${path.slice(directory.length + 1)})`,
    );
  };
  for (const prompt of allPrompts) {
    add(
      `en/prompts/${prompt.id}.md`,
      prompt.english,
      `${prompt.guideEn}\n\n## Full prompt\n\n${promptText(prompt, "full", "current", "en")}\n\n## Spoken opening\n\n${promptText(prompt, "spoken", "current", "en")}${prompt.kind === "review" ? `\n\n## Another transcript\n\n${promptText(prompt, "full", "transcript", "en")}` : ""}`,
    );
    for (const scene of compatibleScenes(prompt)) {
      const paces =
        prompt.id === "roleplay-coach" && scene.category === "interview"
          ? (["coached", "mock"] as const)
          : (["coached"] as const);
      for (const pace of paces) {
        const composed = composeScene(prompt, {
          sceneId: scene.id,
          background: "",
          pace,
        });
        add(
          `en/scenarios/${prompt.id}/${scene.id}${pace === "mock" ? "-mock" : ""}.md`,
          `${scene.title.en} — ${prompt.english} (${pace})`,
          `${promptText(composed, "full", "current", "en")}\n\n## Spoken opening\n\n${promptText(composed, "spoken", "current", "en")}`,
        );
      }
    }
  }
  for (const prompt of learningPrompts) {
    add(
      `en/prompts/${prompt.id}.md`,
      prompt.title.en,
      `${prompt.preparation.en}\n\n${prompt.guide.en}\n\n${learningPromptText(prompt, "en")}`,
    );
  }
  for (const article of [...companionArticles, ...expandedArticles]) {
    const sections = article.sections.map((section) =>
      [
        `## ${section.title.en}`,
        ...(section.paragraphs ?? []).map((text) => text.en),
        (section.steps ?? [])
          .map((text, index) => `${index + 1}. ${text.en}`)
          .join("\n"),
        section.example,
        section.prompt?.body,
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
    add(
      `en/guides/${article.id}.md`,
      article.title.en,
      [
        article.summary.en,
        ...sections,
        article.practice?.length
          ? "## Related tasks\n\n" +
            article.practice
              .map(
                (task) =>
                  `- [${task.label.en}](../prompts/${task.promptId}.md)`,
              )
              .join("\n")
          : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  }
  for (const [directory, links] of Object.entries(catalogs)) {
    files[`${directory}/index.md`] =
      `# TalkSprout — ${directory.split("/").slice(1).join(" / ")}\n\n${links.join("\n")}\n`;
  }
  files["en/scenarios/index.md"] =
    "# Choose a coach, then a scenario\n\n" +
    allPrompts
      .filter((prompt) => compatibleScenes(prompt).length)
      .map((prompt) => `- [${prompt.english}](${prompt.id}/index.md)`)
      .join("\n") +
    "\n";
  return files;
}
