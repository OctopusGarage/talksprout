import type { HandbookArticle } from "./guide-types";
import { guideTitles } from "./guide-titles";

export const skillArticles: HandbookArticle[] = [
  {
    id: "listen-check-listen", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["listen-check-listen"],
    summary: { zh: "先理解意思，再处理听不清的片段，最后回到原声检验，而不是只追求重复次数。", en: "Understand the message, work on a difficult segment, then check against the recording rather than counting repetitions." },
    tags: [{ zh: "听力 精听 泛听 跟读 听写", en: "listening audio dictation shadowing" }],
    sections: [
      { id: "different-tasks", title: { zh: "把泛听、精听和跟读分开", en: "Distinguish listening, close analysis and imitation" }, paragraphs: [
        { zh: "泛听主要跟随内容，允许部分细节没听清；精听选一小段查明困难；跟读是在理解之后模仿声音和节奏。它们可以配合，但不是同一件事，也不需要每个材料都做一整套。", en: "General listening follows the message while allowing some missed details. Close listening investigates a small segment. Shadowing imitates sound and rhythm after understanding. Combine them when useful without requiring the whole sequence for every recording." },
        { zh: "跟读可以作为一种训练手段，不能据此保证自由对话或发音全面改善。熟悉一段音频之后，还应换新材料听，或用自己的话讲出意思。", en: "Shadowing is one practice technique, not a guarantee of broad gains in pronunciation or spontaneous conversation. After becoming familiar with a clip, try another recording or retell its message yourself." },
      ] },
      { id: "workflow", title: { zh: "处理一个没听懂的片段", en: "Work through a difficult segment" }, steps: [
        { zh: "先不看文本听一遍，说出大意；再次听时只标记不确定的地方。", en: "Listen without the text and state the main idea. Listen again and mark uncertain moments." },
        { zh: "选一个短片段核对原文，区分不认识词、句式不熟和文字认识但声音没对应上。", en: "Check a short segment against the transcript. Distinguish unknown words, unfamiliar structures and difficulty matching known words to speech." },
        { zh: "弄懂意思后，先听一句暂停模仿，再按意群说，最后尝试跟随原声。困难时缩短或降速。", en: "Once you understand, pause and repeat, then speak in phrase groups and try following the original. Shorten or slow the segment if needed." },
        { zh: "隐藏文本再听，并用自己的话复述。明天换一句相近内容检查，不机械要求固定遍数。", en: "Listen again without text and retell the meaning. Later, try comparable material rather than aiming for a fixed repetition count." },
      ], example: "I heard: We need ship it Friday.\nReference: We need to ship it by Friday.\nQuestions to investigate: Did I miss a short function word? Did I understand what by Friday means?" },
      { id: "ai-help", title: { zh: "让 AI 帮你分析，不替你听", en: "Use AI for analysis while doing the listening yourself" }, paragraphs: [
        { zh: "把自己的听写和对应文本一起给 AI，请它指出少量重要差异、解释影响意思的词，并保留不确定处。只有文本时，它不能确认具体声音为什么被漏听，也不能判断你实际发音。", en: "Give the AI your attempt and the matching text. Ask for a few important differences and explanations of meaning, retaining uncertainty. With text alone, it cannot establish an acoustic cause or assess how you pronounced something." },
        { zh: "若想练理解，先自行播放，让 AI 等你准备好再逐题提问。若想练听记，先写自己的要点，再核对遗漏、结论和行动项，不先看完整总结。", en: "For comprehension, listen yourself and ask the AI to wait until you are ready before questioning you. For note-taking, write your own points before checking omissions, decisions and actions." },
      ] },
    ],
  },
  {
    id: "ten-minute-ai-conversation", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["ten-minute-ai-conversation"],
    summary: { zh: "围绕真实情境练回应、澄清和继续交流，按目标调整纠错强度。", en: "Practise responding, clarifying and continuing a real situation, with feedback suited to your goal." },
    tags: [{ zh: "口语 自言自语 情境对话 纠错 辩论", en: "speaking conversation self-talk role-play feedback" }],
    sections: [
      { id: "situation", title: { zh: "给交流一个具体目的", en: "Give the exchange a concrete purpose" }, paragraphs: [
        { zh: "从今天的经历或近期要面对的情境出发：说明延期、处理预订问题、表达不同意见。明确双方角色和希望达成的结果，比空泛地要求“教我英语”更容易形成真实回应。", en: "Use an experience or upcoming situation: explain a delay, handle a booking problem or disagree politely. Define the roles and desired outcome rather than simply asking to be taught English." },
        { zh: "独自练习时，先用几句话讲一件小事，再给自己加一个追问。找词困难时先解释用途，允许停顿和澄清；不必把完全不用中文思考当作达标条件。", en: "On your own, describe an event in a few sentences and add a follow-up. Explain a missing word by its purpose, and allow pauses and clarification. Never thinking in your first language is not a useful pass/fail criterion." },
      ], example: "I need to explain a project delay to my manager.\nMy goal is to agree on the next step.\nAsk me one question at a time, and let me answer before giving an example." },
      { id: "feedback", title: { zh: "流畅表达与准确重练可以分开", en: "Separate conversational flow from focused retries" }, paragraphs: [
        { zh: "想练保持交流时，每轮只处理一个重要问题，或讲完一小段再反馈；想修正反复出现的错误时，停下来重说、再换句子用。同一场练习不必同时追求不停顿和逐处纠错。", en: "For flow, work on one important issue per turn or receive feedback after a short section. For a recurring error, pause, retry and use it in another sentence. You need not maximise uninterrupted speech and detailed correction simultaneously." },
        { zh: "原句已经自然时可以继续，不必每次都升级词汇。卡住可要提示或开头一句；拿到示范后，再尝试自己的版本。模拟面试可先连续回答，再集中复盘。", en: "Continue when your wording works instead of upgrading it every time. Ask for a hint or opening phrase when stuck, then try your own version. A mock interview can defer feedback until after several answers." },
      ] },
      { id: "variety", title: { zh: "用不同任务练不同能力", en: "Use different tasks for different skills" }, paragraphs: [
        { zh: "看图或描述物品适合找具体词；复述适合组织一小段内容；辩论适合给理由和回应，观点不同不是语言错误；猜词后造句适合把词从认识变成会用。按当前需要选，不把这些方式当作必须逐级通关。", en: "Describing objects practises concrete language; retelling practises organisation; debate practises reasons and responses, where disagreement is not an English error. Guessing a word and using it practises retrieval. Choose for your need rather than treating them as levels to complete." },
      ] },
      { id: "finish", title: { zh: "留下少量能再次使用的表达", en: "Keep a few expressions you can use again" }, paragraphs: [
        { zh: "结束时挑一到三个对自己有用的说法，合上参考再造句，选一个下次继续练的问题。时间和数量都可调整，需要自己安排，不应假设 AI 会自动计时、保存或提醒。", en: "Keep one to three useful expressions, hide the examples and make a new sentence. Choose a target for next time. Adjust the time and quantity yourself rather than assuming the AI times, saves or schedules practice." },
        { zh: "AI 对话之外，也需要在可能时接触不同真人说话者、轮流发言和处理真实误解。练习中答得顺，不等于所有现实情境都已经掌握。", en: "Where possible, also interact with different people and handle real turn-taking and misunderstandings. A smooth practice exchange does not establish mastery of every real situation." },
      ] },
    ],
  },
  {
    id: "read-and-check-understanding", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["read-and-check-understanding"],
    summary: { zh: "把独立阅读、局部解释和理解自测结合起来，保留回到原文的能力。", en: "Combine independent reading, focused explanation and comprehension checks while keeping the original text central." },
    tags: [{ zh: "阅读 长难句 技术英语 理解自测", en: "reading complex sentences technical English comprehension" }],
    sections: [
      { id: "read-first", title: { zh: "先形成自己的理解", en: "Form your own interpretation first" }, paragraphs: [
        { zh: "先读一遍，用一句话说大意，标出真正影响理解的地方。持续阅读适合自己的内容有价值，不必把每篇文章都拆成语法题；遇到关键难点时再集中处理。", en: "Read once, state the main idea and mark what actually blocks understanding. Sustained reading at a manageable level has value; every article need not become a grammar worksheet. Investigate important difficulties when they arise." },
        { zh: "邮件与通知关注谁需要做什么、何时做、有什么条件；技术文档关注前提、步骤、限制与版本。不要在读英文时顺手把不确定的业务或技术事实补成确定结论。", en: "In messages, identify who should do what, when and under which conditions. In documentation, track prerequisites, steps, limitations and versions. Do not turn uncertain practical or technical details into facts while interpreting the English." },
      ] },
      { id: "unpack", title: { zh: "让解释对准一个问题", en: "Aim the explanation at one problem" }, steps: [
        { zh: "把原句和自己的理解一起给 AI，请它指出具体分歧。", en: "Give the AI the original and your interpretation, and ask where they differ." },
        { zh: "长句先找主干，再看从句、指代和连接词；保留否定、条件、可能性与时间。", en: "Find the main clause, then trace subordinate clauses, references and connectors. Preserve negation, conditions, possibility and time." },
        { zh: "熟词新义或搭配问题，要求结合原句解释，再看一个新例子；不要一次生成整篇词汇表。", en: "For a contextual meaning or collocation, request an explanation tied to the sentence and one new example rather than a glossary of the whole text." },
      ], example: "Text: The change may reduce latency if the cache is warm.\nMy interpretation: The change always makes requests faster.\nWhat to check: may expresses possibility, and if introduces a condition." },
      { id: "self-test", title: { zh: "自测时不要先看到答案", en: "Keep answers out of view during a self-check" }, paragraphs: [
        { zh: "让 AI 等你读完后一次问一个问题，先主旨再细节。用中文回答也可以帮助区分“没读懂”和“英文写不出”。卡住先要线索；需要答案时明确说，再回原文找依据。", en: "Ask the AI to wait until you have read, then ask one question at a time, starting with the main idea. Answering in your first language can separate comprehension from writing difficulty. Try a cue before requesting the answer, then locate evidence in the text." },
        { zh: "如果已经看了完整解释，再答对同一段问题，说明的是理解了讲解。换一段相近难度的内容，才能更好地观察独立阅读是否进步。", en: "Correct answers after a full explanation show understanding with support. Try a fresh passage of similar difficulty to observe independent progress." },
      ] },
    ],
  },
  {
    id: "write-revise-and-reuse", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["write-revise-and-reuse"],
    summary: { zh: "明确目的、自己起草、理解反馈、再次修改，把成品变成可迁移的写作能力。", en: "Set your purpose, draft, understand feedback and revise so a finished text leads to transferable writing practice." },
    tags: [{ zh: "写作 邮件 工作消息 摘要 改述", en: "writing email messages summary paraphrase revision" }],
    sections: [
      { id: "intent", title: { zh: "先确定读者、目的和事实", en: "Set the audience, purpose and facts" }, paragraphs: [
        { zh: "写给谁，希望对方知道什么或做什么？哪些已经确定，哪些只是估计或建议？先写一个简短初稿；写不出来时可先用中文说清原意，再得到一点开头帮助。", en: "Who is the reader, and what should they know or do? What is confirmed, estimated or proposed? Try a short draft. If you cannot start, explain the intent in your first language and ask for a small opening." },
        { zh: "急需完成工作时，直接让 AI 起草也有用；想练独立写作时，先自己写，再接受帮助。这是不同目标，不必把每次工作消息都变成训练。", en: "An AI draft can help finish urgent work. For independent writing practice, attempt your own draft before getting help. These are different goals; every work message need not become an exercise." },
      ] },
      { id: "revise", title: { zh: "理解改动，再自己修改", en: "Understand changes before revising" }, steps: [
        { zh: "请 AI 先指出一到三个重要问题，区分语法错误、意思不清和可选风格，不先覆盖整篇原文。", en: "Ask for one to three priorities, separating errors, unclear meaning and optional style before replacing the draft." },
        { zh: "检查是否改变时间、责任、情绪、确定程度或礼貌；保留原本就自然的表达。", en: "Check changes to time, responsibility, emotion, certainty and politeness, keeping wording that already works." },
        { zh: "自己改一版，再请它检查原来的问题是否解决。需要范文时明确要求，并和自己的版本比较。", en: "Revise yourself and ask whether the original problem is resolved. Request a model when useful and compare it with your version." },
      ], example: "Intent: ask for help without promising a deadline.\nDraft: I'm blocked by the missing specification. Could we clarify the response format?\nCheck: a revision must not invent an agreement to finish tomorrow." },
      { id: "tasks", title: { zh: "不同写作任务保留不同重点", en: "Keep the priorities of the writing task" }, paragraphs: [
        { zh: "工作消息优先重点与下一步；邮件兼顾收件人关系、请求力度与必要上下文；摘要先保证忠实，区分遗漏、误解和新增观点。提供原文时注明哪部分是材料、哪部分是自己的草稿。", en: "A workplace message needs a main point and next step. An email also needs appropriate tone and context. A summary needs fidelity before polish, separating omissions, misunderstandings and added claims. Clearly label the source and your own draft." },
        { zh: "最后隐藏范文，换一个收件人或情况，自己再写一条。若只能复制修改结果，还需要更多独立尝试；不必把所有表达背成固定模板。", en: "Hide the model, change the recipient or situation, and write again. If you can only copy the revision, keep practising independently rather than memorising every message as a fixed template." },
      ] },
    ],
  },
  {
    id: "review-and-reuse-expressions", shelf: "practice", group: "practise", topic: "methods", title: guideTitles["review-and-reuse-expressions"],
    summary: { zh: "少量选取、隔时回忆、变化使用，把看着熟悉变成需要时能表达。", en: "Select a little, recall it later and vary its use so familiarity becomes available expression." },
    tags: [{ zh: "主动回忆 间隔 重复 词块 笔记", en: "retrieval spacing repetition chunks vocabulary notes" }],
    sections: [
      { id: "select", title: { zh: "记录真正值得再次使用的内容", en: "Keep what is worth using again" }, paragraphs: [
        { zh: "优先保留自己想说却没说出来、反复出错或近期会用到的表达。记录当时的情境、说法和一个改进点，区分自己的原话与 AI 的建议，不必保存每一轮对话。", en: "Prioritise expressions you struggled to produce, repeatedly misused or expect to need soon. Keep the situation, wording and one improvement, distinguishing your words from AI suggestions without recording every turn." },
        { zh: "学词时保留词块、搭配和例句，不只留中英文对照。音标可以帮助查读音，但不代表自己当时发错，更不代表 AI 已经听到并分析过录音。", en: "Keep chunks, collocations and examples as well as meanings. IPA can support checking a reference pronunciation; it does not show how you pronounced the word or establish that an AI analysed your recording." },
      ] },
      { id: "retrieve", title: { zh: "先尝试想起，再看答案", en: "Try to retrieve before checking" }, steps: [
        { zh: "遮住原句，只看情境或问题，试着说或写出回应。", en: "Hide the original and respond using only the situation or question." },
        { zh: "核对意思和用法。措辞不同也可能正确，不要求逐字背出 AI 的版本。", en: "Check meaning and usage. Different wording can be correct; you need not recite the AI's sentence." },
        { zh: "隔一段时间再试，容易忘的提前重访，熟悉的拉开间隔。把人物、对象或目的换掉。", en: "Try again later, returning sooner to difficult items and spacing familiar ones further apart. Vary the person, object or purpose." },
      ], example: "Cue: You need a colleague to explain an unclear term.\nPossible answer: Could you clarify what you mean by that?\nNew situation: ask a customer to explain an unexpected result." },
      { id: "transfer", title: { zh: "次数之外，还要检查实际使用", en: "Check use, not just repetition counts" }, paragraphs: [
        { zh: "间隔和回忆有研究支持，变化情境也有助于检查是否只记住了原例，但不存在人人相同的复习日历。固定重复一百遍、每天背满某个数字，都不该取代理解和使用目标。", en: "Spacing and retrieval have research support, while varied situations help check dependence on one example. There is no universal review calendar, and a repetition or daily word count should not replace understanding and use." },
        { zh: "回忆卡片不能自动训练所有对话能力。下次说写时主动用一次，再看是否合适。需要跨聊天继续学习时，自己保存一份简短摘要；不要假设任何 AI 都完整记得以前的错误。", en: "Recall cards do not train every conversational skill. Use an expression in later speaking or writing and check whether it fits. Save a short summary for continuity across chats rather than assuming any AI remembers every earlier error." },
      ] },
    ],
  },
];
