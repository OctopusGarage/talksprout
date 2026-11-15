import type { HandbookArticle } from "./guide-types";
import { guideTitles } from "./guide-titles";

export const foundationArticles: HandbookArticle[] = [
{
  "id": "four-strands-of-language-learning",
  "shelf": "reading",
  "group": "methods",
  "topic": "methods",
  "title": guideTitles["four-strands-of-language-learning"],
  "summary": {
    "zh": "从输入、输出、语言研究和流利度四条主线，建立一套能实施、能检查、能调整的英语学习安排。",
    "en": "Build a practical learning programme around input, output, deliberate language study and fluency, with examples for planning and adjustment."
  },
  "tags": [
    {
      "zh": "学习框架 输入 输出 流利度 计划",
      "en": "learning framework input output fluency planning"
    }
  ],
  "sections": [
    {
      "id": "problem",
      "title": {
        "zh": "为什么学了很多，使用时还是困难",
        "en": "Why study does not always become usable English"
      },
      "paragraphs": [
        {
          "zh": "一种常见的学习经历是：课程看了不少，笔记记得很整齐，看到例句也觉得懂了，但轮到自己解释一件事，仍然只能说出零散的词。这不一定说明之前的努力无效，而是“理解别人说什么”和“自己在当下组织语言”需要不同的活动。只增加同一种学习，未必能解决另一种任务里的困难。",
          "en": "You may finish lessons, organise notes and understand model sentences, yet struggle to explain an ordinary event. That does not make the earlier work worthless. Understanding another person and organising your own message place different demands on you. More of one activity may not address a difficulty in another."
        },
        {
          "zh": "先不要问“最有效的方法是什么”，而要写出近期真正需要完成的事。例如：在会议中说明一个风险，听懂同事解释操作步骤，向朋友讲一次旅行，或写一封请求延期的邮件。再尝试做一次，记录具体卡点：没听清、没有背景知识、想不起表达，还是不知道怎样组织信息。后面的安排要围绕这些卡点，而不是围绕工具清单。",
          "en": "Begin with something you need to do: explain a risk in a meeting, follow spoken instructions, describe a trip or request an extension. Try the task before building a plan. Note whether you struggle with the sound, background knowledge, retrieving language or organising information. Plan around that obstacle rather than a list of tools."
        }
      ]
    },
    {
      "id": "input",
      "title": {
        "zh": "第一条主线：通过听读理解有意思的内容",
        "en": "Strand 1: understand meaningful messages"
      },
      "paragraphs": [
        {
          "zh": "输入的主要任务是理解内容。听一段访谈时，你关心对方为什么换工作；读一篇文章时，你想知道一个问题如何解决。材料应当让你能跟住大意，同时仍有值得接触的新内容。为了持续阅读或收听，允许少量不明白的地方存在，不必把每一句都拆成语法题。",
          "en": "Meaning-focused input is listening or reading to understand a message. You might follow why someone changed jobs or how an article solves a problem. Choose material you can broadly follow that still offers something new. Leave some uncertainty unresolved when the purpose is continued reading or listening rather than detailed analysis."
        },
        {
          "zh": "输入遇到困难，要先判断是哪一种。看文本就懂、听声音却认不出，可能需要针对声音形式练习；每个词都认识、整段却不明白，可能缺少背景或没理清指代。可以重听、查一个关键词、看一段说明，再回到内容。若始终需要逐句翻译，换更容易的材料通常比硬撑整篇更适合当前的泛听泛读。",
          "en": "Diagnose the difficulty. If the transcript is easy but the recording is not, work on recognising the spoken form. If familiar words still make an unclear passage, investigate background, references or organisation. Use a replay or a targeted explanation, then return to the message. Choose easier material when continuous understanding requires translation of every sentence."
        }
      ]
    },
    {
      "id": "output",
      "title": {
        "zh": "第二条主线：自己组织意思，而不是只认答案",
        "en": "Strand 2: produce a message of your own"
      },
      "paragraphs": [
        {
          "zh": "输出包括说话和写作，重点是把自己想表达的意思交给对方。可以是两句总结、一段语音、一封短邮件，也可以是一次真正的讨论。先确定对象和目的：向经理说明延期，与朋友吐槽一天，向客服解释问题，语气和信息顺序都不一样。不要把所有输出都做成脱离对象的“高级句子练习”。",
          "en": "Output means conveying your own meaning through speech or writing. A short summary, voice message, email or conversation can all count. Decide who you are addressing and why. A manager, friend and support agent need different information and tone. Practice should include communicating something, not only producing impressive sentences without an audience."
        },
        {
          "zh": "在看范文前先试一次，哪怕只会说简单句。说不出来的地方可以绕着解释、请求一个词，或者暂时用中文记下原意。之后比较自己的表达和反馈：对方是否能理解，哪些地方改变了意思，哪里只是另一种风格。再做一次有针对性的表达，而不是把 AI 的整段答案抄进收藏夹就结束。",
          "en": "Attempt the task before seeing a model, even with simple sentences. Explain around a missing word, ask for a cue or briefly record the intended meaning in Chinese. Compare your attempt with feedback: what was unclear, what changed meaning and what was merely another style? Try again using a specific improvement rather than only saving the model answer."
        }
      ]
    },
    {
      "id": "study",
      "title": {
        "zh": "第三条主线：有意识地研究语言",
        "en": "Strand 3: study language deliberately"
      },
      "paragraphs": [
        {
          "zh": "有意识的学习是把注意力集中到语言本身：一个词的用法、动词搭配、句子结构、重音，或某种表达的语气。这部分不需要被排斥，关键是让研究服务于你遇到的具体问题。比如总把 discuss 后面加 about，就研究 discuss something；邮件请求太生硬，就比较直接命令、普通请求和委婉请求的差别。",
          "en": "Deliberate study focuses on language itself: a word, verb pattern, sentence structure, stress or tone. It is useful when connected to an actual difficulty. If you keep adding about after discuss, study discuss something. If an email sounds abrupt, compare a command with a neutral request and a more tentative one."
        },
        {
          "zh": "一次挑少量真正值得解决的问题，查清意思、看例句，再为自己的场景造句。不要要求自己把材料里的所有生词都记住，也不必在理解每个语法术语后才重新开口。研究的终点不是得到一段漂亮解释，而是下次遇到相近情境时能看懂、听懂或用得更合适。",
          "en": "Choose a few worthwhile questions, examine meaning and examples, then make a sentence for your own situation. You do not need to memorise every unfamiliar word or master every grammatical label before speaking again. A useful explanation should help you understand or express something more appropriately on a later occasion."
        }
      ]
    },
    {
      "id": "fluency",
      "title": {
        "zh": "第四条主线：把已经会的语言用得更顺",
        "en": "Strand 4: use familiar language more fluently"
      },
      "paragraphs": [
        {
          "zh": "流利度练习不等于一直加快语速。它是在内容和语言大体熟悉的情况下，让理解和表达少一点费力。可以重听一段已经理解的录音，用简单英语重新讲一件熟悉的事，或把刚写过的邮件改成口头说明。内容过难、每句都有新词时，主要负担仍是学习新东西，很难同时要求自己说得顺。",
          "en": "Fluency is not simply speaking faster. Work with mostly familiar content and language so that understanding or expression becomes less effortful. Revisit a recording you understand, retell a familiar event in simple English or explain an email aloud. A task full of unfamiliar language leaves less attention for making familiar language flow."
        },
        {
          "zh": "重复时保留信息目标，但逐渐减少对脚本的依赖。先看关键词讲，再只看任务讲，最后换一个相近情境。卡住可以停顿或改说法，不需要为了速度牺牲准确意思。重复原段适合练熟，改变情境适合检查迁移；两种活动都有用，但不能把背熟一段当成所有场合都能自由交流。",
          "en": "Repeat with the same communication goal while reducing the script: use keywords, then the task alone, then a related situation. Pause or rephrase when needed instead of sacrificing meaning for speed. Repetition develops familiarity; changing the situation checks transfer. Memorising one passage does not establish flexible communication in every setting."
        }
      ]
    },
    {
      "id": "worked-example",
      "title": {
        "zh": "一个完整例子：练习解释项目延期",
        "en": "A complete example: explain a project delay"
      },
      "paragraphs": [
        {
          "zh": "假设你能看懂工作消息，却总在说明延期时说得含糊。先找一则简短项目更新，读清它如何交代现状、原因、影响和下一步。随后不看范文，说出自己的情况：原计划什么时候完成，遇到了什么，新的安排是什么。给自己录一段，或写成几句能直接发给同事的消息。",
          "en": "Suppose you understand work messages but explain delays vaguely. Read a short project update and identify its status, cause, impact and next step. Then explain your own situation without copying: the original plan, the obstacle and the revised arrangement. Record it or write a message you could send to a colleague."
        },
        {
          "zh": "回看后只处理最影响理解的问题。例如你把“可能周五完成”说成了“周五一定完成”，就先修正确定程度；想表达“遇到问题”却逐词翻译，就学一个有用搭配。然后不看全文再讲一次。下一次把情境换成客户反馈晚到或依赖尚未完成，看看还能不能组织清楚。这样一次任务就连接了四条主线，不需要四套互不相干的课程。",
          "en": "Address the issue that matters most. Perhaps you promised Friday when you meant it was possible, or lacked a phrase for encountering a problem. Study that point, explain the situation again without reading the full draft, then try a different delay later. One meaningful task can connect the four strands without requiring four unrelated courses."
        }
      ],
      "example": "Situation: explain a delay to a colleague.\nCurrent status: The integration is taking longer than expected.\nReason: We ran into an authentication issue.\nNext step: I am checking it with the platform team.\nUncertainty: I expect to have an update tomorrow."
    },
    {
      "id": "planning",
      "title": {
        "zh": "怎样安排一周，而不是把每次都切成四份",
        "en": "Plan across a week rather than dividing every session"
      },
      "paragraphs": [
        {
          "zh": "四条主线用来检查一段时间内的整体安排，不是要求每次学习平均分配。忙的一天可以只听一段熟悉内容，另一天专门改一封邮件。回顾一周时再问：有没有理解新信息？有没有自己组织表达？有没有解决具体语言问题？有没有机会把熟悉内容用得更顺？某一项长期缺席，再增加对应活动。",
          "en": "Use the framework to review a period of learning rather than divide every session equally. One busy day may contain familiar listening; another may focus on an email. Review whether you encountered new messages, produced your own meaning, examined language questions and practised familiar language. Add an activity when one strand has been consistently absent."
        },
        {
          "zh": "先选一个主要场景、一小份材料和一个输出任务，做完再增加。可以用“读或听一段—自己表达—查一个问题—稍后再用”作为起点，而不是先买齐课程、搭好笔记系统。时长按现实生活决定；一套能恢复、能持续、能调整的安排，比看上去完美但总做不完的日程更有价值。",
          "en": "Begin with one main situation, a small source and one output task. A workable starting sequence is understand something, express your own meaning, investigate one question and reuse it later. Expand after trying it. Choose a duration that fits your life and a routine you can resume, rather than building an elaborate system before doing the task."
        }
      ]
    },
    {
      "id": "adjustment",
      "title": {
        "zh": "如何判断进步，并修正失衡",
        "en": "Notice progress and correct an imbalance"
      },
      "paragraphs": [
        {
          "zh": "保存少量可比较的表现：过去需要照稿才能解释的事，现在能否只看关键词？以前必须读字幕的短音频，现在是否能听出新的相似表达？一封请求邮件是否更清楚地区分事实、请求和时间？记录还需要什么帮助，比只计算连续打卡天数更能指导下一步。比较时任务难度要相近，不要用一次特别容易或特别困难的表现给自己下结论。",
          "en": "Keep a few comparable samples. Can you explain something from keywords instead of a script, recognise related expressions in a new recording, or make an email request clearer? Record the help you still need. Compare tasks of similar difficulty instead of judging progress from one unusually easy or hard performance."
        },
        {
          "zh": "如果一直看得懂却说不出，增加小型输出和回忆；如果总重复有限的句子，补充相关输入和表达研究；如果一开口就纠错导致不敢继续，分开流畅交流和准确性练习。调整一个变量，实际试几次再判断。方法论的作用是帮你发现缺少什么，不是给自己增加一套必须全部遵守的规矩。",
          "en": "If comprehension outpaces expression, add small output and retrieval tasks. If you repeat a narrow range of language, add relevant input and study. If correction prevents you from continuing, separate conversational flow from focused accuracy work. Change one part and observe several attempts. The framework should help diagnose gaps rather than impose another set of obligations."
        }
      ]
    }
  ]
},
{
  "id": "choose-learning-materials",
  "shelf": "reading",
  "group": "methods",
  "topic": "methods",
  "title": guideTitles["choose-learning-materials"],
  "summary": {
    "zh": "从目标和实际难度出发，完整说明如何选材料、泛读泛听、精读精听，以及怎样使用词典、字幕、翻译和 AI。",
    "en": "A complete approach to selecting material, combining extensive and intensive work, and using dictionaries, captions, translation and AI."
  },
  "tags": [
    {
      "zh": "选材 泛读 泛听 精读 精听 词典 字幕",
      "en": "materials extensive reading listening intensive study dictionary captions"
    }
  ],
  "sections": [
    {
      "id": "purpose",
      "title": {
        "zh": "选材料之前，先决定用它做什么",
        "en": "Decide what the material is for"
      },
      "paragraphs": [
        {
          "zh": "同一份材料可以有不同用途。看一段访谈，可以只是了解一个人的经历，也可以集中听其中一句话，还可以模仿对方怎样说明原因。用途不同，合适的长度、难度和辅助方式就不同。不要笼统地问“这本书适不适合学英语”，先问“我想用它完成哪一种活动”。",
          "en": "The same interview can provide an interesting story, a difficult listening segment or a model for explaining a reason. Each purpose calls for a different length, difficulty and kind of support. Ask what you will do with the material rather than whether a book or video is universally good for learning English."
        },
        {
          "zh": "如果目标是持续阅读，内容应当让你大致跟得上；如果目标是解决听不清的问题，可以选更短、更集中的片段；如果目标是写工作邮件，真实而简短的沟通样例往往比一篇无关的长文章更直接。先有任务，再找材料，会减少收藏很多却不知道从哪开始的情况。",
          "en": "For continued reading, choose something you can broadly follow. For a listening difficulty, choose a short segment worth examining closely. For workplace writing, a relevant concise message may be more useful than an unrelated long article. Finding material for a task can reduce collecting without knowing where to start."
        }
      ]
    },
    {
      "id": "trial",
      "title": {
        "zh": "用一次小试读判断难度",
        "en": "Judge difficulty with a small trial"
      },
      "paragraphs": [
        {
          "zh": "打开材料，先不查词，读一小段或听一小段，然后用自己的话说出它在讲什么。如果大意连得起来，只有部分细节不清楚，可以继续；如果几乎每句都依赖解释，先缩短或降难度；如果内容太容易但你想练速度、自然理解或复述，也仍然有用。等级标签只能帮你初筛，不能替代这次尝试。",
          "en": "Try a small portion without looking everything up, then explain what it says. Continue when the main message connects despite some missing details. Shorten or simplify when nearly every sentence needs explanation. Easy material can still support fluency or retelling. A level label helps you shortlist; your actual attempt tells you more."
        },
        {
          "zh": "难度不只来自生词。题材陌生、多人插话、背景噪声、信息密度高、缺少上下文，都会让材料变难。可以一次只改一个条件：同一主题换更清楚的录音，或同一段先看背景介绍。这样才能知道真正阻碍理解的是什么，而不是笼统认定“我的英语太差”。",
          "en": "Vocabulary is only one source of difficulty. An unfamiliar subject, overlapping speakers, noise, dense information or missing context can all matter. Change one condition: use clearer audio on the same topic or read a brief introduction first. This helps identify the obstacle instead of treating every difficulty as a verdict on your English."
        }
      ]
    },
    {
      "id": "extensive",
      "title": {
        "zh": "泛读泛听：把理解内容放在前面",
        "en": "Extensive work: follow the message"
      },
      "paragraphs": [
        {
          "zh": "泛读泛听的重点是持续接触和理解内容，不是尽可能快地完成数量。选择你愿意继续看下去、基本能跟住的文章、故事或节目。读的时候允许跳过不影响主要意思的词；听的时候先跟住人物、事情和观点。遇到影响整个理解的关键词再停下来查，不用因为漏了一句话就从头重来。",
          "en": "Extensive work prioritises sustained engagement with a message rather than racing through a quota. Choose stories, articles or programmes you want to continue and can broadly follow. Let nonessential unfamiliar words pass. Follow people, events and opinions in listening, and pause for a key word when it blocks the message rather than restarting after every missed sentence."
        },
        {
          "zh": "结束后可以不做笔记，也可以留一句最有意思的内容。如果想检查理解，就回答一个真正和内容有关的问题，例如“作者为什么反对这个方案”，而不是只摘抄漂亮句子。娱乐和学习可以有交集，但不必给每次观看都安排听写、背词和复述，否则原本愿意接触的内容也可能变成负担。",
          "en": "You can finish without notes or keep one interesting point. To check understanding, answer a content question such as why the writer opposes a proposal. That may reveal more than collecting elegant sentences. Enjoyment and learning can overlap without requiring dictation, vocabulary study and retelling for every programme."
        }
      ]
    },
    {
      "id": "intensive",
      "title": {
        "zh": "精读精听：只解决一个清楚的问题",
        "en": "Intensive work: solve a defined problem"
      },
      "paragraphs": [
        {
          "zh": "精读时，先读整段，再定位真正阻碍理解的句子。找主干、连接词、指代和逻辑关系，最后回到整段解释意思。精听时，先听并判断漏掉的是词、声音边界还是背景信息，再对照文本定位。不要一开始就把整篇材料变成所有语言点的清单；一次处理一小段，才能给核对和重新理解留空间。",
          "en": "For intensive reading, understand the passage broadly before locating the sentence that blocks you. Examine its main structure, connections and references, then return to the paragraph. For listening, identify whether the gap concerns a word, sound boundary or background knowledge and compare with a transcript. Keep the segment small enough to check and understand again."
        },
        {
          "zh": "一个完整精听循环可以是：先听，记下自己理解的意思；对照文本，找出一个关键差异；必要时查词和听读音；回到原声，再不看文本听一次；最后用自己的话说出信息。若最后只是能跟着字幕念，却仍不知道讲了什么，需要回到理解；若文本明白但声音仍陌生，就继续处理那段声音，不必急着增加新词。",
          "en": "A useful loop is listen, record what you understood, compare with the text, examine one important mismatch, check a word or its sound if needed, and listen again without the text. Finish by conveying the information yourself. Following captions aloud is not enough if meaning remains unclear; an understood transcript also does not automatically make the recording easy."
        }
      ]
    },
    {
      "id": "dictionary",
      "title": {
        "zh": "词典怎么查：从原句到自己的句子",
        "en": "Use a dictionary from context to your own sentence"
      },
      "paragraphs": [
        {
          "zh": "遇到生词，先保留原句。确认它在这里是什么词性、表达哪一个意思，再看对应解释，不要把所有中文释义全部记一遍。随后看搭配和语法：后面接名词还是动词，常与哪个介词出现，名词是否可数。对常用词，这些信息往往比再背一个宽泛的中文译词更能帮助使用。",
          "en": "Keep the original sentence. Identify the part of speech and relevant sense before reading the matching definition, rather than memorising every translation. Examine the pattern: a noun or verb after it, a common preposition, or countability. For frequent words, that usage information can be more actionable than another broad translation."
        },
        {
          "zh": "看完例句，换成自己的真实情况说一句，再检查有没有保留相同结构。例如看到 discuss the problem，可以说 We discussed the deployment plan，而不是随手加上 about。想核对读音时听可靠词典的音频，再回到原材料；中文谐音最多是临时记号，不适合作为准确发音的依据。收藏时记录原句、适用情境和自己的例句即可，不必复制整页解释。",
          "en": "Make a sentence about your own situation while preserving the pattern. From discuss the problem, try We discussed the deployment plan, without inserting about. Check pronunciation with dictionary audio and return to the source recording. Keep the original context, a useful situation and your example rather than copying the entire dictionary entry."
        }
      ],
      "example": "Original: We discussed the problem.\nPattern: discuss something.\nMy situation: We discussed the deployment plan yesterday.\nLater cue: Tell a colleague what yesterday’s meeting covered."
    },
    {
      "id": "support",
      "title": {
        "zh": "字幕、翻译和 AI：先理解，再撤掉部分帮助",
        "en": "Use support, then try with less of it"
      },
      "paragraphs": [
        {
          "zh": "字幕和翻译不需要被一概禁止。听不懂时看文本，可以帮你区分词不认识还是声音没识别；复杂内容先看中文背景，也可能减少概念负担。关键是明确用了什么帮助，然后安排一次少一点帮助的尝试。例如看完字幕后只听原声，读完解释后关掉解释自己概括，而不是一直停留在对照答案的状态。",
          "en": "Captions and translation need not be banned. A transcript can distinguish unfamiliar vocabulary from an unrecognised spoken form, and background in Chinese can reduce conceptual difficulty. Notice what support you used and try once with less: listen after closing captions or explain the passage after closing an explanation, rather than only comparing your view with an answer."
        },
        {
          "zh": "自动字幕、机器翻译和 AI 解释都可能出错。核对时回到上下文，尤其注意否定、时间、条件、人物关系和技术事实。问 AI 可以指定一句话，先提供自己的理解，再请它指出差异和依据；不要只把一整篇扔过去，读完流畅总结就以为自己读懂了原文。让它能看到材料，也不等于它一定正确理解材料。",
          "en": "Automatic captions, translations and AI explanations can be wrong. Check negation, time, conditions, relationships and technical facts against context. Ask about a specific passage and give your interpretation before requesting a comparison. Reading a fluent summary of an entire article does not establish that you understood the original, even when the AI has access to it."
        }
      ]
    },
    {
      "id": "selection",
      "title": {
        "zh": "不同类型材料，承担不同任务",
        "en": "Give different kinds of material different jobs"
      },
      "paragraphs": [
        {
          "zh": "分级故事、结构清楚的学习短文，适合建立持续阅读的起点；有对应文本的短录音，适合定位听力问题；感兴趣的访谈和播客，适合逐步扩大接触；正在使用的技术文档，适合把术语和真实任务连起来。没有哪一类材料必须成为唯一主食，也不需要从第一天就只看最难的原生内容。",
          "en": "Graded stories and clearly structured short texts can establish regular reading. Short recordings with matching transcripts help locate listening problems. Interesting interviews can broaden exposure, and relevant documentation connects technical language with real tasks. No category needs to be your only material, and authentic content need not mean the hardest available content."
        },
        {
          "zh": "保留一个当前主要材料和少量辅助即可。主要材料负责让你持续推进，词典、解释和背景资料负责解决具体疑问。每次开始时知道下一小段在哪里，比收藏一百个入口更重要。遇到不合适的材料可以换，不必把换材料当失败；但如果一直换、从来不实际尝试，就先暂停搜集，完成一次小任务。",
          "en": "Keep one main source and a few supporting references. The main source provides continuity; references answer particular questions. Knowing your next small step matters more than collecting many entry points. Change unsuitable material without guilt, but if collecting repeatedly replaces practice, pause the search and complete one task."
        }
      ]
    },
    {
      "id": "complete-session",
      "title": {
        "zh": "把一份材料真正用完一次",
        "en": "Work through one piece from start to finish"
      },
      "paragraphs": [
        {
          "zh": "例如你想练解释产品故障，选一段短问题说明。先读或听，概括现象和影响；再找一个关键表达，例如 reproduce the issue；查清它在句子里的用法；用自己的情况说一个例子；关掉原文，向假想同事说明问题。第二天只看任务，再解释一次。若说不清，判断是忘了事实、缺表达还是组织混乱，再决定回看哪里。",
          "en": "For explaining a product fault, choose a short problem description. Identify the symptom and impact, examine one useful expression such as reproduce the issue, and use it in your own situation. Close the source and explain the problem to an imagined colleague. Later, try from the task alone and diagnose whether a gap concerns facts, language or organisation."
        },
        {
          "zh": "不需要每份材料都这样深挖。你可以有时泛读，有时只查一个词，有时集中做完整循环。重要的是知道当前在做哪一种活动，并且偶尔离开材料检查自己能做什么。材料的价值体现在它帮助你理解和表达了什么，而不是它看起来有多权威、篇幅有多长，或者收藏夹里有多少份。",
          "en": "Not every source needs this much analysis. Sometimes read broadly, sometimes look up one word, and sometimes complete the full loop. Know which activity you are doing and occasionally step away from the source to see what you can do. Judge a source by the understanding or expression it supports rather than its apparent prestige or length."
        }
      ]
    }
  ]
}
];
