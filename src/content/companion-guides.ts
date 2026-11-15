import type { HandbookArticle, GuideSection } from "./guide-types";
import { guideTitles } from "./guide-titles";
import { skillArticles } from "./handbook-skills";
import { practiceLinks } from "./guide-practice";

const startingGuides: HandbookArticle[] = [
  {
    id: "build-a-learning-routine", shelf: "practice", group: "prepare", topic: "methods", title: guideTitles["build-a-learning-routine"],
    summary: { zh: "从本站选一种合适的练习，完成一次尝试，再留下下次能用的表达。", en: "Choose a suitable practice tool, make an attempt and keep something useful for next time." },
    tags: [{ zh: "开始练习 日常安排", en: "start practice routine" }],
    sections: [
      { id: "choose", title: { zh: "先选今天的一件事", en: "Choose one task for today" }, paragraphs: [
        { zh: "想开口交流，从「自然聊天纠正」开始；需要容易的问题和示范，选「温柔引导纠正」。带着文章、音频或草稿时，到「听读写辅助」选择对应工具。一次选一种，不需要把目录全部做完。", en: "Start with Natural Conversation Coach for conversation or Gentle Conversation Coach for easier questions and models. For a passage, recording or draft, choose the relevant listening, reading or writing helper. One tool is enough for a session." },
      ] },
      { id: "use", title: { zh: "复制后，到自己的 AI 中练", en: "Send the prompt to your own AI" }, steps: [
        { zh: "打开练习详情，按需选场景，复制完整提示词；不方便粘贴时用简短语音开场白。", en: "Open the tool, choose a scenario if useful and copy the full prompt, or read its short spoken opening when pasting is inconvenient." },
        { zh: "在外部 AI 中开始，先自己回答，再处理反馈。需要帮助可以要提示或一句示范。", en: "Start in your external AI, answer yourself and then work with the feedback. Ask for a hint or a sample phrase when needed." },
        { zh: "结束后回到「结束与复习」选一种整理方式，再把提示词发回刚才的 AI 对话。", en: "After practice, choose one Wrap-up & Review tool and send its prompt back in the conversation where you practised." },
      ] },
      { id: "continue", title: { zh: "下次从一个重点继续", en: "Continue with one priority next time" }, paragraphs: [
        { zh: "记录一个想继续练的问题，下次先尝试用出来。本站保存的常用组合用于重新打开练习设置，不会替你保存外部聊天内容，也不会自动安排复习日程。", en: "Keep one target and try using it next time. A saved practice combination reopens your setup; it does not save the external conversation or schedule reviews." },
      ] },
    ],
    practice: practiceLinks(["daily-check-in", "gentle-start", "complete-study-notes"]),
  },
  {
    id: "use-ai-and-check-feedback", shelf: "practice", group: "prepare", topic: "ai", title: guideTitles["use-ai-and-check-feedback"],
    summary: { zh: "分清提示词形式、材料准备和帮助命令，把练习顺利带到外部 AI。", en: "Choose a prompt format, prepare usable material and ask for the right help in your AI chat." },
    tags: [{ zh: "完整提示词 语音开场白 帮助", en: "full prompt spoken opening help finish" }],
    sections: [
      { id: "format", title: { zh: "完整提示词与语音开场白", en: "Full prompt or spoken opening" }, paragraphs: [
        { zh: "方便粘贴时用「完整提示词」，规则较详细；不方便粘贴时照着「语音开场白」念，再等 AI 提问。简短版本保留主要练法，不能保证与完整版本处理所有情况完全一样。", en: "Use Full prompt for detailed instructions when pasting is convenient. Otherwise read the Spoken opening and wait for the AI. The shorter form keeps the core method, without guaranteeing identical handling of every situation." },
        { zh: "本站的选择不会直接改变外部 AI。切换教练或任务时，要把新的提示词重新发送；开始另一种练习时，新开对话通常更容易避免旧任务混入。", en: "Selections here do not directly change the external AI. Send the new prompt when changing the tool or task; a new conversation can help separate unrelated exercises." },
      ] },
      { id: "commands", title: { zh: "卡住、复盘和结束时", en: "When you need help, review or an ending" }, paragraphs: [
        { zh: "对话教练中，help / 帮我一下用于当前任务的帮助；review / 复盘用于简短回顾；finish / 结束练习会停止提问。可以自然表达相同意思，不必逐字输入命令。", en: "With conversation coaches, help supports the current task, review asks for a brief recap, and finish stops further questions. Natural requests with the same intent also work." },
        { zh: "理解自测通常先给线索，猜词先给提示，对话可以给可用示范。想直接看答案时明确说；完整笔记和卡片则使用「结束与复习」中的对应工具。", en: "Comprehension checks usually offer a cue, word games a clue, and conversations may offer a sample. Explicitly ask when you want the answer; use Wrap-up & Review for fuller written notes or cards." },
      ], example: "Give me a hint first.\nI'd like to skip this retry.\nLet's review what we practised.\nLet's finish for today." },
      { id: "material", title: { zh: "材料与反馈要核对", en: "Check the material and feedback" }, paragraphs: [
        { zh: "材料直接提供给外部 AI，不上传到本站。打不开链接时给相关摘录或转写；只有文本时不让 AI 诊断具体发音。对改写先检查意思、时间和语气，不能只看是否更流畅。", en: "Provide material to your external AI, not this site. Supply an excerpt or transcript if a link is inaccessible. Do not request acoustic diagnoses from text alone, and check meaning, time and tone in a revision before judging its fluency." },
      ] },
    ],
    practice: practiceLinks(["writing-feedback", "listening-guide"]),
  },
  {
    id: "choose-feedback-style", shelf: "practice", group: "prepare", topic: "ai", title: guideTitles["choose-feedback-style"],
    summary: { zh: "按今天的目标选择自然聊天、温柔示范、重练或表达改写。", en: "Choose natural conversation, gentle models, focused retries or wording feedback for today's goal." },
    tags: [{ zh: "纠错 重说 评分", en: "feedback retry correction score" }],
    sections: [
      { id: "choose", title: { zh: "四种模式各适合什么", en: "What the four modes are for" }, paragraphs: [
        { zh: "「自然聊天纠正」每轮最多处理一处有用问题，适合来回交流。「温柔引导纠正」接纳短答案，用自然示范带你继续，不要求每句重说。", en: "Natural Conversation Coach handles at most one useful issue per turn. Gentle Conversation Coach accepts short answers and models wording without requiring every sentence to be repeated." },
        { zh: "「严格纠错重练」改一处后等你重说或明确跳过。「表达评分与改写」关注清晰度和自然度，需要时给改写并等你再试；数字评分按需提供，只是非正式反馈。", en: "Focused Correction Coach waits for a retry or explicit skip after a correction. Score and Rewrite Coach addresses clarity and naturalness and waits for a useful revision attempt. Numerical scores are optional informal feedback." },
      ] },
      { id: "retry", title: { zh: "重说时只处理当前重点", en: "Keep a retry focused" }, steps: [
        { zh: "先确认修改有没有保留原意，再试说修正后的表达。", en: "Check that the revision preserves your meaning, then try it." },
        { zh: "不理解时求助或提问；帮助不是已经完成重说。想继续聊天时可明确跳过。", en: "Ask for help or clarification if needed; that is not the retry itself. Explicitly skip when you want to continue." },
        { zh: "原句已经自然就直接继续，不需要制造错误或每句换成高级表达。", en: "Continue when the original works rather than inventing an error or upgrading every sentence." },
      ], example: "Original: I work on it yesterday.\nCorrection: I worked on it yesterday.\n\nAlready natural: I finished the task.\nOptional alternative: I completed the task." },
      { id: "adjust", title: { zh: "根据练习效果调整", en: "Adjust using your experience" }, paragraphs: [
        { zh: "如果纠错让你无法组织内容，换成较温和方式；如果总跳过同一个错误，下次留一个短时段专练。不要把分数当正式等级，也不要根据文字评分推断口音或说话速度。", en: "If feedback prevents you from developing an idea, choose gentler support. If you keep skipping the same issue, practise it briefly later. Do not treat scores as formal proficiency or infer accent and speed from text." },
      ] },
    ],
    practice: practiceLinks(["daily-check-in", "gentle-start", "focused-correction", "expression-upgrade"]),
  },
];

const skillSetup: Record<string, { promptIds: string[]; section: GuideSection }> = {
  "ten-minute-ai-conversation": {
    promptIds: ["roleplay-coach", "complete-study-notes"],
    section: { id: "site-use", title: { zh: "在本站怎样开始", en: "Start with the matching tool" }, paragraphs: [
      { zh: "打开「情境扮演教练」，选一个相近场景并复制给外部 AI。十分钟是可调整的预算；计时、表达数量和下次目标要自己选择或主动提出，复制提示词不会自动完成整套流程。", en: "Open Role-play Coach, choose a scenario and send the prompt to your AI. Ten minutes is an adjustable budget. Timing, expression selection and next targets need your own choice or request, rather than happening automatically." },
      { zh: "软件工程面试场景可选择「逐题辅导」或「模拟面试」；后者把反馈延后到复盘或结束，适合连续应答。", en: "Software engineering interview scenarios offer Coached or Mock interview pacing; mock pacing defers feedback until review or finish." },
    ] },
  },
  "listen-check-listen": {
    promptIds: ["listening-dictation", "listening-shadowing", "listening-check"],
    section: { id: "site-use", title: { zh: "选择对应的听力工具", en: "Choose the listening task" }, paragraphs: [
      { zh: "先自行听一小段并写下内容，再用「听写对照与查漏」比较原文；理解后用「短句跟读准备」划分意群，再到自己的播放器练。想检查主旨和细节时，用「听力理解自测」，先听并表示准备好了再答题。", en: "Listen and write first, then use Dictation comparison. After understanding, use Prepare a shadowing segment and practise in your own player. For comprehension, listen and indicate readiness before answering questions in Listening comprehension check." },
    ] },
  },
  "read-and-check-understanding": {
    promptIds: ["reading-guide", "reading-check", "reading-sentences"],
    section: { id: "site-use", title: { zh: "把阅读需求和工具对上", en: "Match the tool to your reading need" }, paragraphs: [
      { zh: "想理解段落时用「文章阅读辅导」并指出卡住的地方；想拆句时用「长难句拆解」；想检验独立理解时用「阅读理解自测」，先自己读，不先索取整段总结。", en: "Use Reading guide for a confusing passage, Unpack a complex sentence for structure, and Reading comprehension check for independent understanding. Read before requesting a full summary when testing yourself." },
    ] },
  },
  "write-revise-and-reuse": {
    promptIds: ["writing-practice", "writing-feedback", "writing-email"],
    section: { id: "site-use", title: { zh: "先区分起草与修改", en: "Distinguish starting from revising" }, paragraphs: [
      { zh: "没有草稿时用「场景写作练习」；已有草稿时用「写作纠错与解释」。邮件、工作消息、中文想法和摘要各有专门工具，按当前任务选择，不需要全部使用。", en: "Use Scenario writing practice when starting and Writing feedback for a draft. Email, workplace messages, expressing a Chinese idea and summarising have their own helpers; choose for the task rather than using everything." },
    ] },
  },
  "review-and-reuse-expressions": {
    promptIds: ["complete-study-notes", "sentence-correction-review", "vocabulary-ipa-review", "review-cards"],
    section: { id: "site-use", title: { zh: "在有练习记录的对话中使用", en: "Review where the practice is available" }, paragraphs: [
      { zh: "复制复习提示词后，回到刚才练习的外部 AI 对话发送。换对话时，在完整提示词中选择「其他聊天记录」，替换末尾占位内容并注明说话人。本站不会自动传递聊天记录。", en: "Send the review prompt in the external conversation where you practised. In another chat, choose Another transcript under Full prompt, replace the placeholder and retain speaker labels. This site does not transfer the conversation." },
      { zh: "「完整学习笔记」适合整体回顾；「句子与纠错整理」关注说法；「单词与短语复习」关注搭配和语境；「复习卡片与自测」用于自己保存后再回忆。生成结果不会自动安排复习。", en: "Complete Study Notes reviews broadly; Sentences and Corrections focuses on wording; Vocabulary and Pronunciation Notes covers contextual use; Review Cards and Self-Test creates material to save and revisit. Generation does not schedule later review." },
    ] },
  },
};

const skillCompanions = skillArticles.map(article => ({
  ...article,
  group: article.id === "review-and-reuse-expressions" ? "review" as const : "practise" as const,
  topic: article.id === "ten-minute-ai-conversation" ? "ai" as const : "methods" as const,
  sections: [skillSetup[article.id].section, ...article.sections],
  practice: practiceLinks(skillSetup[article.id].promptIds),
}));

const materialCompanions: HandbookArticle[] = [
  {
    id: "self-talk-to-real-conversation", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["self-talk-to-real-conversation"],
    summary: { zh: "先讲一件自己的小事，再用追问或复述练习把话题继续下去。", en: "Describe something from your day, then extend it through follow-up or retelling." },
    tags: [{ zh: "自言自语 看图 复述", en: "self-talk description retelling" }],
    sections: [
      { id: "start", title: { zh: "先说一小段", en: "Start with a short description" }, paragraphs: [{ zh: "选一件今天发生的事，先自己说几句，再用「自然聊天纠正」继续交流。短句和停顿都可以；不知道词时先描述用途，必要时用中文求助。", en: "Describe an event in a few sentences, then continue with Natural Conversation Coach. Short sentences and pauses are fine. Describe a missing word by its purpose or ask for support." }], example: "I cooked noodles because I got home late.\nNext question: What would you cook if a friend came over?" },
      { id: "choose", title: { zh: "按需要换一种练法", en: "Choose a variation for your goal" }, paragraphs: [{ zh: "「复述纠错教练」让你先讲完一小段再反馈；「看图表达教练」可使用图片，也可直接描述身边物品。想练理由和回应可用辩论；想练词汇提取可用猜词后造句。", en: "Retelling Coach waits for a short section before feedback. Visual Description Coach accepts a photo or an object description. Debate supports reasons and responses; guessing followed by sentence-making supports vocabulary retrieval." }] },
      { id: "transfer", title: { zh: "检查能否回应新问题", en: "Check your response to something new" }, paragraphs: [{ zh: "不要只把一段独白背熟。试着回应一个没准备的追问，或在对方不理解时换个说法；这些变化能帮助你判断是否更接近真实交流。", en: "Go beyond memorising a monologue. Answer an unprepared follow-up or rephrase when misunderstood to check how the practice supports an exchange." }] },
    ],
    practice: practiceLinks(["daily-check-in", "story-summary", "visual-vocabulary"]),
  },
  {
    id: "technical-english-in-context", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["technical-english-in-context"],
    summary: { zh: "先读懂一段文档，再练向同事解释原因、行为与影响。", en: "Understand a short passage, then explain the cause, behaviour and impact to a colleague." },
    tags: [{ zh: "技术英语 文档 职场", en: "technical English documentation workplace" }],
    sections: [
      { id: "read", title: { zh: "先理解文本", en: "Understand the passage first" }, paragraphs: [{ zh: "选一小段公开文档，在「读懂技术文档」中指出不懂的句子。区分语言、前提、限制和版本信息；AI 的流畅解释不代表技术事实已经得到验证。", en: "Use Read technical documentation with a short public passage and identify the difficulty. Separate language, prerequisites, limitations and versions; fluent explanation does not establish technical correctness." }] },
      { id: "explain", title: { zh: "用自己的话讲清楚", en: "Explain it in your own words" }, paragraphs: [{ zh: "合上原文，尝试说明它解决什么问题，再到「情境扮演教练」选择职场讨论场景。把真实项目细节换成可分享的示例，不需要向外部 AI 提供敏感代码。", en: "Close the passage and state the problem it addresses. Use a workplace scenario in Role-play Coach to discuss it, replacing confidential details with a shareable example." }], example: "The service retries failed requests.\nWithout a limit, retries can add load during an outage.\nWe use a backoff delay to spread them out." },
      { id: "check", title: { zh: "语言反馈与技术判断分开", en: "Separate language feedback from technical judgment" }, paragraphs: [{ zh: "让对方追问一个条件或限制。表达是否清楚可以练，技术结论仍回原文核对；面试练习也不等于真实招聘表现评分。", en: "Invite a follow-up about a condition or limitation. Practise clarity while checking technical claims against the source; a mock interview is not a real hiring assessment." }] },
    ],
    practice: practiceLinks(["reading-technical", "roleplay-coach"]),
  },
];

export const companionArticles: HandbookArticle[] = [...startingGuides, ...skillCompanions, ...materialCompanions];
