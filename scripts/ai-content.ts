import { allPrompts } from "../src/prompts";
import { learningPrompts } from "../src/content/learning";
import { companionArticles } from "../src/content/companion-guides";
import { expandedArticles } from "../src/content/expanded-reading";
import { compatibleScenes, composeScene } from "../src/scenes";
import { promptText, learningPromptText } from "../src/prompt-text";
export function buildDocuments(): Record<string, string> {
  const files: Record<string, string> = {};
  for (const language of ["zh", "en"] as const) {
    const index = [
      `# TalkSprout — ${language === "en" ? "English practice library" : "英语学习目录"}`,
      "Prompt bodies are English learning instructions. Read the selected document before starting; preserve its coaching loop.",
    ];
    const catalogs: Record<string, string[]> = {};
    const add = (path: string, title: string, body: string) => {
      files[path] = `# ${title}\n\n${body}\n`;
      const directory = path.slice(0, path.lastIndexOf("/"));
      (catalogs[directory] ??= []).push(
        `- [${title}](${path.slice(directory.length + 1)})`,
      );
    };
    for (const p of allPrompts) {
      add(
        `${language}/prompts/${p.id}.md`,
        language === "en" ? p.english : p.title,
        `${language === "en" ? p.guideEn : p.guide}\n\n## Full prompt\n\n${promptText(p, "full", "current", language)}\n\n## Spoken opening\n\n${promptText(p, "spoken", "current", language)}${p.kind === "review" ? `\n\n## Another transcript\n\n${promptText(p, "full", "transcript", language)}` : ""}`,
      );
      for (const scene of compatibleScenes(p)) {
        for (const pace of (p.id === "roleplay-coach" &&
        scene.category === "interview"
          ? ["coached", "mock"]
          : ["coached"]) as ("coached" | "mock")[]) {
          const composed = composeScene(p, {
            sceneId: scene.id,
            background: "",
            pace,
          });
          add(
            `${language}/scenarios/${p.id}/${scene.id}${pace === "mock" ? "-mock" : ""}.md`,
            `${scene.title[language]} — ${p.english} (${pace})`,
            `${promptText(composed, "full", "current", language)}\n\n## Spoken opening\n\n${promptText(composed, "spoken", "current", language)}`,
          );
        }
      }
    }
    for (const p of learningPrompts)
      add(
        `${language}/prompts/${p.id}.md`,
        p.title[language],
        `${p.preparation[language]}\n\n${p.guide[language]}\n\n${learningPromptText(p, language)}`,
      );
    for (const a of [...companionArticles, ...expandedArticles])
      add(
        `${language}/guides/${a.id}.md`,
        a.title[language],
        `${a.summary[language]}\n\n${a.sections.map((s) => `## ${s.title[language]}\n\n${(s.paragraphs ?? []).map((t) => t[language]).join("\n\n")}\n\n${(s.steps ?? []).map((t, i) => `${i + 1}. ${t[language]}`).join("\n")}\n\n${s.example ?? ""}\n\n${s.prompt?.body ?? ""}`).join("\n\n")}`,
      );
    for (const [directory, links] of Object.entries(catalogs)) {
      files[`${directory}/index.md`] =
        `# TalkSprout — ${directory.split("/").slice(1).join(" / ")}\n\n${links.join("\n")}\n`;
    }
    files[`${language}/scenarios/index.md`] =
      `# ${language === "en" ? "Choose a conversation coach, then a scenario" : "先选择教练，再选择场景"}\n\n` +
      allPrompts
        .filter((p) => compatibleScenes(p).length)
        .map(
          (p) =>
            `- [${language === "en" ? p.english : p.title}](${p.id}/index.md)`,
        )
        .join("\n") +
      "\n";
    index.push(
      `- [${language === "en" ? "Coaches, reviews and listening/reading/writing" : "教练、复习与听读写练习"}](prompts/index.md)`,
      `- [${language === "en" ? "Compatible scenarios and interview pacing" : "兼容场景与面试节奏"}](scenarios/index.md)`,
      `- [${language === "en" ? "Learning guides and AI configurations" : "学习指南与 AI 配置"}](guides/index.md)`,
    );
    files[`${language}/index.md`] = index.join("\n\n") + "\n";
  }
  return files;
}
