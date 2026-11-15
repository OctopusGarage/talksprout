import type { HandbookArticle } from "./guide-types";
import { guideTitles } from "./guide-titles";

export const independentMethods: HandbookArticle[] = [
{
  "id": "english-in-everyday-life",
  "shelf": "reading",
  "group": "methods",
  "topic": "methods",
  "title": guideTitles["english-in-everyday-life"],
  "summary": {
    "zh": "把兴趣、工作与日常表达连接起来：找到可持续的入口，安排真实输出，处理中断和挫败，而不是把生活全部变成作业。",
    "en": "Connect English with interests, work and everyday expression, with a sustainable routine, meaningful output and ways to recover after interruptions."
  },
  "tags": [
    {
      "zh": "生活 兴趣 习惯 自言自语 沉浸",
      "en": "everyday life interests habits self-talk immersion"
    }
  ],
  "sections": [
    {
      "id": "starting-point",
      "title": {
        "zh": "从你本来就想做的事情开始",
        "en": "Begin with something you already want to do"
      },
      "paragraphs": [
        {
          "zh": "“每天学英语”是一个很大的要求：你得先决定学什么、去哪里找、用什么工具，然后才真正开始。把英语放进已经存在的活动，可以少做一些决定。你本来就看篮球，可以看球员的一段采访；你正准备做一道菜，可以读英文步骤；你需要解决开发问题，可以先阅读相关英文文档。英语在这里既是学习对象，也是获取信息的工具。",
          "en": "A daily promise to study English leaves many decisions unresolved: what to do, where to find it and which tool to use. Existing activities reduce those decisions. Read a recipe you intend to cook, watch a player you follow or consult documentation for a real development problem. English becomes a way to access something you want."
        },
        {
          "zh": "兴趣不是保证进步的魔法，也不意味着只接触最舒服的内容。它的作用是让你更愿意回来，并给表达提供真实话题。如果你根本不关心某类新闻，就不必仅仅因为它“适合学英语”而强迫自己每天读。先找一个愿意持续了解的主题，再为需要提升的技能安排小任务。",
          "en": "Interest does not guarantee progress or remove the need for challenging work. It gives you a reason to return and something to express. You need not read a category of news you dislike simply because it seems educational. Choose an engaging theme, then add small tasks for the skills you need."
        }
      ]
    },
    {
      "id": "minimum",
      "title": {
        "zh": "设计一个忙的时候也能开始的版本",
        "en": "Create a version you can begin on a busy day"
      },
      "paragraphs": [
        {
          "zh": "把活动写得具体一些：“晚饭后看收藏的那段采访，听懂一个回答”，比“晚上提高听力”更容易开始。为同一个活动保留普通版和缩短版：普通版听一段并讲出观点，缩短版只听一个已经熟悉的回答。缩短版不是为了制造打卡成绩，而是降低恢复成本，避免因为一次没时间就把整个安排放弃。",
          "en": "Make the action concrete: after dinner, listen to one answer in a saved interview rather than improve listening tonight. Keep a normal version and a shorter version. The normal version might include your response; the short version might revisit a familiar answer. The purpose is easier resumption, not manufacturing a streak."
        },
        {
          "zh": "开始前把材料和下一步留好，结束时也留一个入口：下次从哪段开始，哪个问题还没弄懂，想试着表达什么。工具越多，进入活动前的准备可能越多。先用能直接打开的材料和一个简单记录方式，实际坚持一阵子后，再判断是否需要更复杂的管理系统。",
          "en": "Leave the material and next step ready. At the end, note where to continue, what remains unclear or what you want to express. More tools can introduce more preparation. Start with accessible material and a simple note, then decide from experience whether a more elaborate system solves a real problem."
        }
      ]
    },
    {
      "id": "input-to-output",
      "title": {
        "zh": "让内容自然地变成自己的表达",
        "en": "Turn content into something you want to say"
      },
      "paragraphs": [
        {
          "zh": "看完一段内容后，不必马上做整套练习。先问一个与你有关的问题：“我同意吗？”“我的情况有什么不同？”“我会怎么向朋友解释？”这会把复述原文变成组织自己的意思。初期可以只说几句，允许简单词和停顿；重要的是表达确实来自你，而不是照读一段更漂亮的答案。",
          "en": "After a piece of content, ask a personal question: do I agree, how is my situation different or how would I explain this to a friend? That changes reproducing a source into organising your own meaning. A few simple sentences and pauses are enough to begin. The message should be yours rather than a polished answer you read aloud."
        },
        {
          "zh": "例如看了球员解释失误，你可以讲自己工作中一次判断错误；看了做菜视频，可以说明自己会替换什么食材；读了技术文档，可以向假想同事说明为什么选这个方案。输入提供内容和表达资源，输出暴露你缺什么，再带着具体问题回去查。这个循环比无限寻找“最好的一套材料”更容易形成行动。",
          "en": "An athlete explaining a mistake can prompt your account of a work decision. A recipe can lead to explaining an ingredient substitution. Documentation can prompt a recommendation to a colleague. Input supplies ideas and language, output reveals a gap, and the gap gives your next lookup a purpose. This can make action easier than an endless search for perfect material."
        }
      ],
      "example": "I watched a short interview about handling mistakes.\nMy connection: I once shipped a change without checking the migration.\nMy message: I rushed the release. Next time, I will check the migration first.\nNext question: How can I explain the impact without sounding defensive?"
    },
    {
      "id": "self-talk",
      "title": {
        "zh": "自言自语怎么用，怎样走向真实交流",
        "en": "Use self-talk as a bridge to interaction"
      },
      "paragraphs": [
        {
          "zh": "自言自语适合练习把脑中的想法组织成英语。例如走路时描述计划，做完任务后解释刚才的决定，或者为一次会议提前说出开场。不要要求自己把脑内每一句中文都翻译成英语，也不必禁止中文思考。选择一个确实想讲的意思，先用已有语言说，再找一个最影响表达的缺口。",
          "en": "Self-talk can help organise an idea in English: describe a plan, explain a decision or rehearse a meeting opening. You do not need to translate every thought or ban Chinese thinking. Choose one message, use the language available to you and identify a gap that noticeably limits the explanation."
        },
        {
          "zh": "但独白不会自动练到听懂别人和临场回应。准备好一段表达后，可以让 AI 或朋友追问原因、细节和反例，自己不要提前写好全部答案。真实交流还需要确认理解、解释误会、请求重复和调整说法。把独白当准备，把问答当检验，两者连接起来，比只背熟一段“自我表达”更完整。",
          "en": "Monologues do not automatically practise understanding another person or responding unexpectedly. After preparing an explanation, invite questions about reasons, details and alternatives without scripting every answer. Interaction also requires clarification, repairing misunderstandings and rephrasing. Use self-talk for preparation and an exchange to test what happens when the conversation changes."
        }
      ]
    },
    {
      "id": "environment",
      "title": {
        "zh": "调整环境，但不要把所有生活都改成英语",
        "en": "Change the environment selectively"
      },
      "paragraphs": [
        {
          "zh": "可以把经常使用、风险低的部分改成英语：常看的主题、简单搜索、熟悉软件的帮助文档，或普通 AI 问答。逐步增加接触，比一口气把所有设备、娱乐和工作都改成英语更容易判断是否适合。如果界面语言影响重要操作，或者关键任务需要准确中文表达，就先完成真实任务，不必为了“沉浸感”制造额外障碍。",
          "en": "Try English in familiar, low-risk activities: a topic you follow, simple searches, help pages or ordinary AI questions. Add exposure gradually so you can judge its effect. If a language change interferes with an important task or you need precise Chinese, complete the real task rather than creating obstacles for the sake of immersion."
        },
        {
          "zh": "接触时间和有效学习不能完全画等号。背景里播放英语，不一定意味着你理解了信息；把 AI 设置成只说英语，也不意味着你已经练了输出。可以偶尔检查：刚才听到了什么？我能回应哪个问题？如果回答不上来，就减少背景播放，选一小段真正参与的内容，而不是只让环境看起来很英语。",
          "en": "Exposure time is not identical to learning. Background audio may go largely unprocessed, and English-only AI replies do not by themselves make you produce English. Occasionally check what you understood or can respond to. If little comes to mind, choose a short passage you can engage with instead of only making the environment appear English-rich."
        }
      ]
    },
    {
      "id": "feedback",
      "title": {
        "zh": "把纠错放在合适的位置",
        "en": "Put correction where it helps"
      },
      "paragraphs": [
        {
          "zh": "为了保持愿意表达，可以把“先讲完”和“再改一个问题”分开。交流时先关注意思，结束后挑一处值得改的表达，再在新情境里用一次。若当前就是为了研究准确性，可以暂停并重说；若只是想讨论一件有趣的事，不需要每句话都被改写成范文。允许自己选择本次交流的重点。",
          "en": "Separate finishing your message from improving one point when that helps you keep speaking. After an exchange, choose a useful revision and try it in another situation. Pause and retry when accuracy is the purpose. A conversation about something interesting need not turn every sentence into a polished model. Choose the focus for the occasion."
        },
        {
          "zh": "反馈要保留你的原意和语气。能懂的普通说法不必强行换成更正式、更长的句子；对方给的版本如果改变了承诺程度或态度，要指出来。AI 的鼓励可以帮助继续练，但不能单独证明进步。更有用的是自己下次是否能清楚表达、是否少依赖提示，以及是否能处理对方一个新的追问。",
          "en": "Feedback should preserve meaning and tone. A clear ordinary sentence need not become longer or more formal, and a revision that changes a commitment or attitude deserves questioning. Encouragement can support practice without establishing progress. Look for clearer expression, less dependence on cues and an ability to handle a new follow-up."
        }
      ]
    },
    {
      "id": "restart",
      "title": {
        "zh": "中断、厌烦和挫败时怎么调整",
        "en": "Respond to interruptions and frustration"
      },
      "paragraphs": [
        {
          "zh": "中断之后先恢复一次小活动，不用偿还所有漏掉的时间。若每次开始都觉得负担很大，检查任务是不是太长、材料是不是过难、记录是不是太繁琐。不要把每种困难都解释为缺乏自律。把任务缩小、换更相关的内容，或者暂时只做理解，再逐渐补回表达，都是可以观察效果的调整。",
          "en": "After a break, resume one small activity instead of repaying every missed session. If starting consistently feels burdensome, examine length, difficulty and record-keeping before blaming discipline. Shorten the task, choose more relevant material or temporarily simplify it. Observe whether the adjustment helps you return and participate."
        },
        {
          "zh": "也要区分“需要换内容”和“总在逃避一个必要任务”。如果听读一直顺利，却总跳过自己开口，那就把输出缩成一个问题的回答；如果每次都被词汇卡住，就选更容易的内容并处理少量高频表达。调整应针对观察到的困难，而不是遇到不顺就重新安装一个工具、换一套体系。",
          "en": "Distinguish unsuitable material from repeatedly avoiding a needed activity. If input is comfortable but you always skip speaking, reduce output to one answer. If vocabulary blocks every attempt, choose easier material and a few useful expressions. Adjust the observed difficulty rather than rebuilding the entire tool setup whenever practice becomes uncomfortable."
        }
      ]
    },
    {
      "id": "weekly-example",
      "title": {
        "zh": "一段可以照着试的生活安排",
        "en": "An everyday sequence you can adapt"
      },
      "paragraphs": [
        {
          "zh": "以“最近想学会做一种早餐”为例。第一次读懂做法，允许查关键词；第二次边做边用英语说明步骤；之后向朋友或 AI 解释做得如何，并回应一个追问；再过几天不看原文说明步骤或替换食材。每次活动都围绕你本来就在做的事，阅读、词汇、独白和问答自然接起来，不必每次完整走一遍所有环节。",
          "en": "Suppose you want to make a new breakfast. First understand the recipe with any necessary lookups. Explain the steps while cooking another time. Tell a friend or AI how it went and answer a follow-up. Later explain the process or a substitution without the source. The activities connect through a real interest without requiring every stage on every occasion."
        },
        {
          "zh": "回顾时只需要几个问题：我是否还愿意继续这个主题？有没有表达过自己的意思？哪些帮助现在可以减少？下次最小一步是什么？如果生活发生变化，活动也可以跟着换。能长期服务于真实生活的方法，会随着兴趣、工作和能力变化；不必为了忠于一个计划而停止调整。",
          "en": "Review a few questions: do I still want this topic, did I express my own meaning, what support can I reduce, and what is the next small step? Change the activity when your life changes. A useful routine can evolve with your interests, work and ability rather than demanding loyalty to a plan that no longer fits."
        }
      ]
    }
  ]
},
{
  "id": "spacing-retrieval-and-repetition",
  "shelf": "reading",
  "group": "methods",
  "topic": "methods",
  "title": guideTitles["spacing-retrieval-and-repetition"],
  "summary": {
    "zh": "把“看过很多遍”变成“需要时想得起”：完整说明主动回忆、反馈、间隔复习和变化使用怎样配合。",
    "en": "Move from repeated exposure to usable recall by combining retrieval, feedback, spaced revisits and varied use."
  },
  "tags": [
    {
      "zh": "主动回忆 间隔 记忆 重复 复习 迁移",
      "en": "retrieval spacing memory repetition review transfer"
    }
  ],
  "sections": [
    {
      "id": "recognition",
      "title": {
        "zh": "为什么看着熟悉，开口却想不起来",
        "en": "Why recognition can outpace recall"
      },
      "paragraphs": [
        {
          "zh": "看着句子觉得“这我会”，和不看句子自己说出来，是不同的任务。原文提供了词、顺序和上下文，你只需要识别；交流时则需要先确定意思，再从记忆里找到合适语言。反复看答案可以增加熟悉感，却不一定给你足够的提取机会。所以复习不能永远停在把笔记从上到下读一遍。",
          "en": "Recognising a sentence and producing it without seeing it are different tasks. The visible sentence supplies words, order and context; conversation requires choosing a meaning and retrieving suitable language. Rereading can increase familiarity without giving enough retrieval practice. Review needs occasional attempts that begin without the complete answer."
        },
        {
          "zh": "这不意味着重读、重听没有价值。它们帮助理解、核对和接触声音形式。需要改变的是顺序和组合：有时先尝试，再看；看懂后过一阵再尝试；能复述后换一个情境。让“接触答案”和“自己想起”相互配合，比把两者当成只能选一个更实用。",
          "en": "Rereading and listening again still support understanding, checking and recognising sound. Change their relationship with your own attempt: sometimes try before looking, revisit after a delay, and change the situation after a familiar retelling. Combine exposure and retrieval rather than treating them as competing methods."
        }
      ]
    },
    {
      "id": "first-learning",
      "title": {
        "zh": "先理解，再选择值得记住的内容",
        "en": "Understand first and choose what deserves review"
      },
      "paragraphs": [
        {
          "zh": "一个没弄懂的表达，不会因为放进卡片就自动变得清楚。先确认它在原句里的意思、语气和结构，必要时查一个可靠例句，再用自己的情况造句。只选真正可能再用到的内容：你想说却不会说的意思，工作或生活里常遇到的模式，或者反复影响理解的问题。不必把一篇文章所有陌生词都送进复习队列。",
          "en": "A flashcard does not make an unclear expression clear. Check its meaning, tone and pattern in context, examine an example if necessary and make a sentence of your own. Prioritise ideas you wanted to express, patterns you encounter and recurring comprehension gaps. Every unfamiliar word does not need a place in the review queue."
        },
        {
          "zh": "记录时留足够的情境，而不是只留一个中英对照词。例如 clarify 不只是“澄清”，还可以和“没听懂需求，请对方解释”的沟通目的连接。知道何时用、对谁用、后面怎么接，才能设计有用的回忆提示。内容很陌生时，可以先保留完整例句；熟悉后逐渐减少提示，不需要一开始就逼自己凭空想起。",
          "en": "Keep a usable context rather than only a bilingual word pair. Connect clarify with asking someone to explain an unclear requirement, including the audience and sentence pattern. This makes a better retrieval cue. Retain a full example initially if needed, then reduce support as it becomes familiar."
        }
      ]
    },
    {
      "id": "retrieval",
      "title": {
        "zh": "怎样做一次主动回忆",
        "en": "Make a genuine retrieval attempt"
      },
      "paragraphs": [
        {
          "zh": "先把答案藏起来，只看能指向任务的线索。例如“请同事把需求解释得更具体”，尝试自己说一句。可以先在脑中组织，再出声或写下；如果一直卡住，给自己一个开头或关键词，再尝试。重点不是让自己受苦，而是留出一次真实的找回过程。看着原句朗读可以练声音和熟练度，但不属于同样的提取任务。",
          "en": "Hide the answer and use a cue such as asking a colleague to make a requirement more specific. Say or write a response. If you remain stuck, use an opening or keyword and try again. Leave room for genuine retrieval without turning the task into prolonged struggle. Reading the visible sentence aloud practises something different."
        },
        {
          "zh": "然后核对意思、结构和场合，不要求所有答案逐字一致。Could you clarify what you mean? 和 Could you explain that a bit more? 在某些情境都可以完成任务。若卡片只接受一条标准句，就可能把合理表达判成错误。只有在你明确练习某个固定搭配或特定形式时，才需要把形式本身作为检查重点。",
          "en": "Check meaning, pattern and appropriateness rather than demanding an exact match. Could you clarify what you mean? and Could you explain that a bit more? may both do the job. An exact-answer card can reject a suitable alternative. Focus on a particular form when that form is the explicit target."
        }
      ],
      "example": "Cue: A colleague’s requirement is unclear. Ask for more detail.\nTry before revealing an example.\nPossible answer: Could you clarify what you mean by “ready”?\nCheck: Did I ask for clarification politely and clearly?"
    },
    {
      "id": "feedback",
      "title": {
        "zh": "想不起来或答错以后，怎样处理",
        "en": "Use feedback after a failed attempt"
      },
      "paragraphs": [
        {
          "zh": "答错后先找出差异：忘了目标词，搭配不对，改变了意思，还是只是另一种合理说法？只修正真实问题，再看一个清楚例子。随后关掉答案重新表达一次，确认不是只在看着答案时觉得懂。之后再隔开重试，而不是因为刚改对一次就永久移出复习。",
          "en": "Locate the mismatch: a missing word, a pattern error, changed meaning or merely a valid alternative. Correct the actual issue and examine a clear example. Close the answer and try again, then revisit later. An immediate successful retry does not establish that the language will remain available in another situation."
        },
        {
          "zh": "如果每次都错，可以降低提取难度：从整句改成补一个搭配，先给情境和关键词，或者换成更贴近自己的例子。也可能是最初根本没理解，就先回到解释。反过来，如果每次都是看一眼就答出、完全不用想，可以拉开重访间隔，或把任务换成新情境中的使用。",
          "en": "When attempts repeatedly fail, reduce the demand: supply a keyword, practise a pattern within a sentence or use a more personal example. Return to explanation if understanding is missing. If the answer is always effortless, revisit less often or use it in a fresh situation instead of repeating the same easy cue."
        }
      ]
    },
    {
      "id": "spacing",
      "title": {
        "zh": "间隔复习：让重访分散在不同时间",
        "en": "Space revisits across different occasions"
      },
      "paragraphs": [
        {
          "zh": "把同一个表达分散到后面的学习中，而不是在一次坐下来时重复到精疲力尽。间隔的作用是让你在不再完全依赖刚看过的答案时再试一次。可以在后续几次学习开始时先回忆少量旧内容，再进入新任务。没有一张适合所有人、所有材料的固定时间表，也不必把某个软件默认日程当成不可修改的规律。",
          "en": "Distribute revisits across later occasions instead of exhausting yourself with one long session. Try again when the answer is no longer simply available from having just seen it. A few old cues at the start of later sessions can fit naturally. There is no single schedule for every learner and item; an app schedule is adjustable support."
        },
        {
          "zh": "根据表现调整：完全想不起且需要很多帮助，适当提早并减小任务；能在新例子中自然使用，可以拉开间隔。漏掉一天不用把全部内容从头背起，先处理当前最有用的几个。复习系统应该减少决定负担，不该让积压数量成为新的压力来源。",
          "en": "Adjust from performance. Revisit sooner and simplify if retrieval needs extensive support; allow longer gaps when you can use the expression flexibly. Missing a day does not require restarting everything. Prioritise a useful subset. A review system should reduce decision-making rather than make its backlog your main source of pressure."
        }
      ]
    },
    {
      "id": "variation",
      "title": {
        "zh": "重复之后，还要变化使用",
        "en": "Follow repetition with varied use"
      },
      "paragraphs": [
        {
          "zh": "重复原例能让你更熟悉，但要检查能否离开原例。学会请求解释以后，换成不清楚的交付时间、模糊的产品要求、没听明白的操作说明。相同功能在不同场合需要不同词和语气。也可以从写转为说，或从看见中文提示转为听到对方一句话后回应，让练习更接近实际使用。",
          "en": "Familiarity with one example needs a transfer check. Use a clarification request for an unclear deadline, vague requirement or spoken instruction. The communicative purpose stays related while vocabulary and tone change. Move from writing to speaking or from a Chinese cue to responding to another person, bringing practice closer to the intended use."
        },
        {
          "zh": "变化不需要越大越好。一次先换一个条件，观察是否还能完成目标。把技术会议请求突然换成复杂辩论，失败原因就很难判断。先在相近场合用顺，再逐渐扩大范围；不要因为一个新情境卡住，就否定原来已经掌握的部分。",
          "en": "Change one condition at a time so you can interpret the result. Moving from a work clarification to a complex debate changes too many demands. Begin with related situations and expand gradually. Difficulty in a new context does not erase what you can already do in a familiar one."
        }
      ]
    },
    {
      "id": "listening-speaking",
      "title": {
        "zh": "听力、口语和写作怎样安排复习",
        "en": "Apply review to listening, speaking and writing"
      },
      "paragraphs": [
        {
          "zh": "听力复习可以先不看文本再听，检查自己是否识别了之前漏掉的声音；仅仅记住内容不等于听清所有词，所以也要用新的相似录音检验。口语复习可以只看情境回答，留意是不是总要先翻译整句。写作复习可以重新完成一个类似请求，检查目标表达是否合适，而不是只把旧句子背出来。",
          "en": "For listening, replay without text and check the previously missed sound, then try related new audio to distinguish recognition from memorised content. For speaking, respond to a situation and notice dependence on translating a complete sentence. For writing, complete a comparable request and judge whether the target language fits, rather than only reproducing an old sentence."
        },
        {
          "zh": "AI 可以提供新情境、提问和反馈，但要求它先等你回答，再展示示例；不要让它每次先给范文。它给的判断也要核对，尤其是把合理说法当错误时。卡片负责制造回忆机会，真实材料和交流负责补充语境；任何一个都不需要独自承担全部学习。",
          "en": "An AI can supply situations, questions and feedback. Ask it to wait for your attempt before showing a model, and question feedback that treats a reasonable alternative as wrong. Cards provide retrieval opportunities; real material and exchanges supply context. No single tool needs to perform every part of learning."
        }
      ]
    },
    {
      "id": "complete-cycle",
      "title": {
        "zh": "一个表达从第一次遇见到再次用出来",
        "en": "Follow one expression through a complete cycle"
      },
      "paragraphs": [
        {
          "zh": "假设你在聊天中想说“这个操作会覆盖现有设置”，却只说出 replace settings。先核对 overwrite 在该技术语境中的意思，写自己的句子：This will overwrite your current settings. 之后记录一个情境提示：“提醒同事导入配置的风险”，隐藏答案，自己说。核对后关掉笔记，再提醒一次，不要求语气和原句完全相同。",
          "en": "Suppose you want to warn that an operation replaces existing settings. Examine overwrite in that technical context and write This will overwrite your current settings. Later use a cue such as warning a colleague about importing a configuration, with the answer hidden. Check your response, close the note and deliver the warning again in suitable wording."
        },
        {
          "zh": "后续学习时再用一次，换成文件、缓存或配置导入的相近场景，并核对技术事实是否真的如此。如果表达已经容易取出，就不必每天机械重做；若仍把意思说反，就回到原句和实际场景处理。完成标准不是“重复了多少遍”，而是在需要的情境里能理解、选择和表达。",
          "en": "Revisit in a related file or configuration situation, checking that the technical claim is actually true. If retrieval is easy, stop mechanically repeating it every day. If the meaning is still wrong, return to context and explanation. The practical goal is understanding and appropriate expression when needed, rather than a predetermined repetition count."
        }
      ]
    }
  ]
}
];
