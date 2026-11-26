import type { Locale } from "../types";

export const studyMaterialNames = [
  { id: "complete-study-notes", zh: "学习笔记", en: "Study Notes" },
  { id: "sentence-correction-review", zh: "句子纠错", en: "Corrections" },
  { id: "vocabulary-ipa-review", zh: "词汇短语", en: "Vocabulary" },
  { id: "review-cards", zh: "复习卡片", en: "Review Cards" },
] as const;

export const studyNoteArchiveExample: Record<Locale, string> = {
  zh: "2026-11-26 - 远程办公 - 学习笔记",
  en: "2026-11-26 - Remote Work - Study Notes",
};

export function studyMaterialArchiveExample(
  locale: Locale,
  materialId: string,
): string {
  const type =
    studyMaterialNames.find((item) => item.id === materialId) ??
    studyMaterialNames[0];
  return `2026-11-26 - ${locale === "zh" ? "远程办公" : "Remote Work"} - ${type[locale]}`;
}

const policy = `## Scope and authority

Apply this convention only to written study materials, proposed archival metadata and explicit organization/saving requests. Ordinary conversation, help and a short oral recap need no filenames. Preserve the selected learning task and its source-grounding rules. If the material already exists and the request is only to save, rename, organize or handle an export receipt, reuse that artifact without running another review, rewriting its body or generating new examples. A storage-only action is not a new learning-content generation task. Produce the requested material without making folder setup a prerequisite. A request for notes or review is not permission to save, upload, synchronize, schedule or share them. A later explicit saving instruction is a separate action; use only already available, authorized host tools. TalkSprout MCP provides public content, not cloud-write capabilities.

## Titles and dates

Use YYYY-MM-DD - Topic - Material Type as the document title and first-level heading. Keep the title and proposed filename consistent. The default date is the material's first creation date in the learner's local timezone, based on reliable supplied or available context. Honor an explicitly requested practice date. Preserve the title date when updating an existing artifact. A known creation/export date does not establish when practice occurred. The title already carries the archival date; do not repeat date metadata in the body by default. Use Practice date only when the conversation or learner separately establishes the actual practice date; never copy it from the title or current date. Omit an unknown practice date. Record an earlier practice date separately in the body only when known. Do not guess a date, timezone or session timestamp. If the date cannot be established, produce the learning content with an undated descriptive heading and clearly mark the archival title as provisional. Resolve the date only when needed for an actual requested save; do not delay the study content with a setup questionnaire.

Choose a short, specific topic grounded in the conversation, such as Remote Work or Hotel Check-in. Use the learner's preferred note language consistently for topic and material type; keep learning examples in English. Use the material labels below for the four reviews. Other requested artifacts may use a clear, consistent type such as Writing Practice. Generate only the requested materials, not four files by default.

Use ordinary spaces and the ASCII separator " - ". Replace filename-unsafe characters (backslash, slash, colon, asterisk, question mark, double quote, angle brackets and vertical bar), control characters and line breaks with spaces or hyphens; collapse repeated whitespace and trim surrounding whitespace. Do not add a platform/model name, long timestamp, random identifier or repeated TalkSprout prefix. Add .md only to an actual Markdown file; native documents and page titles have no extension.

## Destination mapping

Honor the user's specified location and existing organization before the default TalkSprout container. Reuse a known container or resolve its actual ID when tools permit; never create a duplicate root on every save. Do not bind destinations to AI brands. Google Drive and folder-capable cloud drives use a TalkSprout folder. Notion uses a TalkSprout parent page or an already selected database, with one page per artifact. NotebookLM uses a TalkSprout notebook and consistently titled sources or notes, not an invented filesystem path or a new notebook per session. Prefer adding the existing canonical document as a source when supported rather than creating another divergent copy. Do not promise automatic synchronization between services. Start with one container; add year/month organization only if requested or already used.

## Updates and collisions

For another rendering of the same session and material type, prefer updating the known artifact, retaining its title date and resource ID. Do not overwrite a document merely because its name matches. If it is a distinct session with the same date, topic and material type, use the first available suffix: " - 02", " - 03", and so on. Verify available names when tools support it; if you cannot inspect storage, make a recommendation based on the supplied information and do not claim a uniqueness or duplicate check. Avoid names such as Final, Final-v2 or Latest. Different requested material types share the date/topic stem and remain separate artifacts.

## Material header and saving results

Keep metadata brief. Besides the title, include the practice mode when known and useful; include the original conversation link or source platform only if actually available. Do not add date fields by default. If the learner explicitly requests date metadata, distinguish Created on (the known original creation date), Updated on (a known actual update date, or clearly proposed update metadata), and Practice date (the separately established practice date). The current date does not establish the original creation date of an older artifact. Omit unknown fields rather than substituting today. Do not fabricate a link or fill every field with guesses. Distinguish learner statements from partner examples in the learning content.

When asked to save, use the intended title and actual destination in the supported tool. Respect already established authorization and destination preferences; ask only to resolve a necessary ambiguity. If the host can export a document but cannot choose its parent, report the real returned title/location and offer the intended move as a manual next step. If no write tool exists, provide the proposed title, destination and usable content; explicitly distinguish these from a completed save. Never report a suggested path as an actual saved path. Claim success only from an actual successful tool result, verifying the title and destination when possible. Return a concise receipt with the real title, known location and returned link. If a link/location is not returned or verifiable, say so rather than inventing it. Do not change sharing permissions as part of saving.`;

export function buildStudyNoteArchiveGuide(): string {
  const labels = studyMaterialNames
    .map((item) => `- ${item.id}: ${item.en}`)
    .join("\n");
  const examples = studyMaterialNames
    .map((item) => `2026-11-26 - Remote Work - ${item.en}`)
    .join("\n");
  return `# Study note archiving\n\n${policy}\n\n## Material labels\n\nTranslate these labels into the learner's preferred note language.\n\n${labels}\n\n## Naming examples (illustrative dates, not the current date)\n\n\`\`\`text\n${examples}\n\`\`\`\n`;
}
