import type { HandbookArticle } from "./guide-types";
import { practiceLinks } from "./guide-practice";

export const methodArticles: HandbookArticle[] = [
  {
    id: "chunks-in-new-contexts",
    shelf: "reading",
    group: "methods",
    topic: "methods",
    title: {
      zh: "语块怎么练到能用",
      en: "Use chunks in new contexts",
    },
    summary: {
      zh: "把常用搭配放进自己的情境，再换条件练习。",
      en: "Use a useful phrase in your own situation, then change the conditions.",
    },
    tags: [
      {
        zh: "方法 表达 迁移",
        en: "methods expression transfer",
      },
    ],
    sections: [
      {
        id: "purpose",
        title: {
          zh: "什么时候用",
          en: "When to use this",
        },
        paragraphs: [
          {
            zh: "看得懂一句话，却总在说话时重新拼词，可以练一小段常用搭配。语块要连同用途一起学。",
            en: "Try this when you recognise a phrase but still assemble every word when speaking. Learn a short chunk together with its purpose.",
          },
        ],
      },
      {
        id: "steps",
        title: {
          zh: "先理解，再换情境",
          en: "Understand, then vary",
        },
        paragraphs: [
          {
            zh: "从听读中选一个近期用得上的表达，确认意思和搭配。盖住原句，用自己的事情说一句，再换人物或对象说一次。",
            en: "Choose a useful expression from listening or reading and check its meaning and collocations. Hide the source, use it for your own situation, then change the person or object.",
          },
        ],
      },
      {
        id: "example",
        title: {
          zh: "例子：提出一个请求",
          en: "Example: make a request",
        },
        paragraphs: [
          {
            zh: "保留 Would you mind，换成真实请求。和不熟悉的人沟通时，也要考虑关系和语气；礼貌不只靠一个句型。",
            en: "Keep Would you mind and make a real request. Consider your relationship and tone with an unfamiliar person; one structure alone does not make a request polite.",
          },
        ],
        example:
          "Would you mind checking this paragraph?\nWould you mind moving the meeting to Friday?",
      },
      {
        id: "image",
        title: {
          zh: "短语动词：图像只是线索",
          en: "Phrasal verbs: images are clues",
        },
        paragraphs: [
          {
            zh: "pick up a box 的动作图像可能帮助记住 pick up，但不能推出 pick up a skill 的全部用法。每个新义都回到原句和词典核对。",
            en: "The physical image in pick up a box may help memory, but it cannot explain every use of pick up a skill. Check each new sense in context and a dictionary.",
          },
        ],
      },
      {
        id: "next",
        title: {
          zh: "检验能否迁移",
          en: "Check a new situation",
        },
        paragraphs: [
          {
            zh: "隔一阵再看新情境，不看示范先表达。替换得顺不等于能在真实对话中用出；再试一个追问。下方工具可练变式、阅读词汇和听力表达。",
            en: "Later, respond to a fresh situation before viewing an example. Smooth substitutions do not guarantee use in conversation; try a follow-up question too. Use the linked tools for variation, vocabulary and listening expressions.",
          },
        ],
      },
    ],
    practice: practiceLinks([
      "pattern-variation",
      "reading-vocabulary",
      "listening-expressions",
    ]),
  },
  {
    id: "repeat-and-transfer",
    shelf: "reading",
    group: "methods",
    topic: "methods",
    title: {
      zh: "同一件事讲几遍，怎样练得更顺",
      en: "Repeat a story, then try a new situation",
    },
    summary: {
      zh: "从熟悉内容练顺表达，再换听众或任务。",
      en: "Practise familiar content, then adapt it for another listener or task.",
    },
    tags: [
      {
        zh: "方法 表达 迁移",
        en: "methods expression transfer",
      },
    ],
    sections: [
      {
        id: "purpose",
        title: {
          zh: "什么时候用",
          en: "When to use this",
        },
        paragraphs: [
          {
            zh: "已经知道要讲什么，但停顿多、依赖稿子时，用熟悉内容练顺一些。",
            en: "Use familiar content when you know what to say but pause often or rely on a script.",
          },
        ],
      },
      {
        id: "steps",
        title: {
          zh: "讲、调整、再讲",
          en: "Tell, adjust, retell",
        },
        paragraphs: [
          {
            zh: "选一次真实经历，记几个关键词，先讲一遍。只处理一个影响理解的卡点，放下全文再讲；最后换听众或换一件相似的事。",
            en: "Choose a real experience and a few keywords, then tell it once. Address one obstacle to understanding and retell without a full script. Finally, change the audience or tell a similar event.",
          },
        ],
      },
      {
        id: "example",
        title: {
          zh: "例子：解释一次延期",
          en: "Example: explain a delay",
        },
        paragraphs: [
          {
            zh: "先向同事说明原因，再向客户说明影响和下一步。重点随听众改变，不只是加快同一段话。",
            en: "Explain the cause to a colleague, then the impact and next step to a customer. Adapt the message to the listener instead of only speeding up.",
          },
        ],
        example:
          "We found a login issue during testing.\nYour release will be delayed. I will send an updated plan tomorrow.",
      },
      {
        id: "timing",
        title: {
          zh: "计时可以选，不必赶",
          en: "Timing is optional",
        },
        paragraphs: [
          {
            zh: "愿意时可自行计时，用四、三、两分钟重讲。初学者可缩短内容、延长时间或不计时。文字练习可按要点或篇幅重写。",
            en: "Optionally time yourself for four, three and two minutes. Beginners can shorten the content, allow more time or skip timing. In writing, revise for key points or length.",
          },
        ],
      },
      {
        id: "next",
        title: {
          zh: "换任务才看得出",
          en: "Try another task",
        },
        paragraphs: [
          {
            zh: "熟练讲一个故事不能证明整体口语进步。下次不看稿讲另一件事，再回答一个意外问题。下方工具可做故事复述和情境回忆。",
            en: "A polished story does not demonstrate general speaking improvement. Next time, tell another event without a script and answer an unexpected question. Try the story and recall tools below.",
          },
        ],
      },
    ],
    practice: practiceLinks(["story-summary", "expression-recall"]),
  },
  {
    id: "explain-in-simple-english",
    shelf: "reading",
    group: "methods",
    topic: "methods",
    title: {
      zh: "不会那个词，也能把意思说清楚",
      en: "Explain an idea when a word is missing",
    },
    summary: {
      zh: "用类别、用途和例子，接住暂时想不起词的时刻。",
      en: "Keep communicating with categories, purposes and examples.",
    },
    tags: [
      {
        zh: "方法 表达 迁移",
        en: "methods expression transfer",
      },
    ],
    sections: [
      {
        id: "purpose",
        title: {
          zh: "什么时候用",
          en: "When to use this",
        },
        paragraphs: [
          {
            zh: "想不起词时，先说明它是什么、有什么用途或举一个例子，让交流继续。",
            en: "When a word is missing, describe what it is, what it does or give an example to keep communicating.",
          },
        ],
      },
      {
        id: "steps",
        title: {
          zh: "从类别和用途开始",
          en: "Start with category and purpose",
        },
        paragraphs: [
          {
            zh: "先用熟悉词说类别，再补一个特点。对方不明白时换个例子，最后确认理解，而不是一直重复原句。",
            en: "Name a category using familiar words and add one feature. If the listener is unsure, try an example and check understanding instead of repeating the same sentence.",
          },
        ],
      },
      {
        id: "example",
        title: {
          zh: "例子：想不起订书机",
          en: "Example: a missing word",
        },
        paragraphs: [
          {
            zh: "不用等到想起 stapler 才开口。先描述工具和用途，请对方确认。",
            en: "You can speak before remembering stapler. Describe the tool and its purpose, then invite confirmation.",
          },
        ],
        example:
          "It is a small tool that joins sheets of paper with a metal pin. Do you have one?",
      },
      {
        id: "writing",
        title: {
          zh: "写作也先保住意思",
          en: "Keep the meaning in writing too",
        },
        paragraphs: [
          {
            zh: "先写清谁需要做什么，再检查措辞。简单表达仍要保留条件、时间和语气，不能为了短就删掉关键信息。",
            en: "State who needs to do what before refining the wording. Keep conditions, timing and tone; shorter wording should preserve essential information.",
          },
        ],
      },
      {
        id: "next",
        title: {
          zh: "练完再补词",
          en: "Check the word afterwards",
        },
        paragraphs: [
          {
            zh: "交流后核对准确词语并留一个自己的例句。技术、安全等要求精确的场合，需要进一步确认术语。下方工具可练释义和写作意图。",
            en: "Afterwards, check the precise word and save a personal example. Confirm terminology when precision matters, such as technical or safety instructions. Practise with the explanation and writing tools below.",
          },
        ],
      },
    ],
    practice: practiceLinks(["plain-english", "writing-intent"]),
  },
];
