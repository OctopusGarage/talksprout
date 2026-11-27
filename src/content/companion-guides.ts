import { workflowGuide } from "./workflow-guide";
import type { HandbookArticle } from "./guide-types";
import { guideTitles } from "./guide-titles";
import { practiceLinks } from "./guide-practice";

const practiceCompanions: HandbookArticle[] = [
{
  "id": "build-a-learning-routine",
  "shelf": "practice",
  "group": "prepare",
  "topic": "methods",
  "title": guideTitles["build-a-learning-routine"],
  "summary": {
    "zh": "每天选一件小事，完成一次练习，再留一个下次重点。",
    "en": "Choose a small task, finish a practice and leave one target for next time."
  },
  "tags": [
    {
      "zh": "开始练习 日常安排",
      "en": "start practice routine"
    }
  ],
  "sections": [
    {
      "id": "choose",
      "title": {
        "zh": "选一个具体目标",
        "en": "Choose a concrete goal"
      },
      "paragraphs": [
        {
          "zh": "先决定今天想聊什么、听懂什么或写出什么。轻松交流可选「朋友闲聊」，需要提示可选「温柔引导纠正」；有材料时使用听读写工具。",
          "en": "Decide what you want to discuss, understand or write. Try Friendly Free Chat for conversation, Gentle Conversation Coach for support, or a learning helper for supplied material."
        }
      ]
    },
    {
      "id": "stuck",
      "title": { "zh": "按卡点找练法", "en": "Choose by what feels difficult" },
      "paragraphs": [
        { "zh": "看不懂，先理解材料；看得懂却听不出，练一小段听写或跟读；学过却想不起，试试情境回忆。只是没想好说什么，可以先列一个观点和几个关键词。有明确目标时直接开始。", "en": "If the text is unclear, work on meaning. If you understand the text but miss the speech, try a short dictation or imitation task. If familiar expressions will not come to mind, try contextual recall. To organize an idea, start with one point and a few keywords. With a clear goal, begin directly." },
        { "zh": "过程中随时可以请 AI 重复、换种说法或等你想一想。材料太难时，请它缩短片段或提供简化版；跟原音听写、跟读仍用原文。想回看变化时，提供两次真实练习样本再比较。", "en": "Ask the AI to repeat, rephrase or give you time whenever needed. For difficult material, request a shorter excerpt or adapted version; use the original text with original-audio dictation and shadowing. To compare attempts, provide two actual practice samples." }
      ]
    },
    {
      "id": "use",
      "title": {
        "zh": "做一次能完成的练习",
        "en": "Keep the session manageable"
      },
      "paragraphs": [
        {
          "zh": "从几分钟、一个话题或一小段材料开始。先自己尝试，再看反馈；忙的时候缩小任务，也能继续。",
          "en": "Start with a few minutes, one topic or a short passage. Try first, then use feedback. Reduce the task on busy days."
        }
      ]
    },
    {
      "id": "continue",
      "title": {
        "zh": "留下一个下次重点",
        "en": "Leave one target"
      },
      "paragraphs": [
        {
          "zh": "结束时保留一个有用表达或待解决的问题。下次先试着用一次，不必每次整理整段聊天。",
          "en": "Keep one useful expression or unresolved question. Try it at the start of your next session; a complete transcript is not always needed."
        }
      ]
    }
  ],
  "practice": practiceLinks(["daily-check-in", "gentle-start", "complete-study-notes"])
},
{
  "id": "use-ai-and-check-feedback",
  "shelf": "practice",
  "group": "prepare",
  "topic": "ai",
  "title": guideTitles["use-ai-and-check-feedback"],
  "summary": {
    "zh": "选合适的指令，提供材料，再核对 AI 的修改。",
    "en": "Choose instructions, supply the material and check the feedback."
  },
  "tags": [
    {
      "zh": "完整提示词 语音开场白 帮助",
      "en": "full prompt spoken opening help finish"
    }
  ],
  "sections": [
    {
      "id": "format",
      "title": {
        "zh": "发送练习指令",
        "en": "Send the practice instructions"
      },
      "paragraphs": [
        {
          "zh": "能粘贴时用完整提示词；不方便时用简短语音开场白。已接入 Skill 或 MCP 的用户可直接在 AI 中选任务。",
          "en": "Use the full prompt when pasting is convenient, or the short spoken opening otherwise. With a Skill or MCP connection, choose the task directly in your AI."
        }
      ]
    },
    {
      "id": "commands",
      "title": {
        "zh": "随时请求帮助",
        "en": "Ask for help as needed"
      },
      "paragraphs": [
        {
          "zh": "可以说「给我一个提示」「换个话题」「复盘一下」或「结束练习」。需要完整笔记或卡片时，再选择对应复习工具。",
          "en": "Ask for a hint, another topic, a recap or an end to practice. Choose a review tool when you want full notes or cards."
        }
      ]
    },
    {
      "id": "material",
      "title": {
        "zh": "核对内容和反馈",
        "en": "Check the source and feedback"
      },
      "paragraphs": [
        {
          "zh": "把材料直接提供给 AI。检查修改是否保留原意、时间和语气；有疑问时请它指出依据。仅凭文字不能判断真实发音。",
          "en": "Supply material directly to your AI. Check that revisions preserve meaning, time and tone, and ask for the basis of a correction. Text alone cannot establish actual pronunciation."
        }
      ]
    }
  ],
  "practice": practiceLinks(["writing-feedback", "listening-guide"])
},
{
  "id": "choose-feedback-style",
  "shelf": "practice",
  "group": "prepare",
  "topic": "ai",
  "title": guideTitles["choose-feedback-style"],
  "summary": {
    "zh": "先决定想轻松交流，还是集中改好一个问题。",
    "en": "Decide whether you want conversational flow or focused correction."
  },
  "tags": [
    {
      "zh": "纠错 重说 评分",
      "en": "feedback retry correction score"
    }
  ],
  "sections": [
    {
      "id": "choose",
      "title": {
        "zh": "按目标选择",
        "en": "Choose for your goal"
      },
      "paragraphs": [
        {
          "zh": "想轻松交流，选「朋友闲聊」或「观点交流」；希望有人温和带着说，选「温柔引导纠正」。想改一处后重说，选「严格纠错重练」；关注表达清晰度，可选「表达评分与改写」。",
          "en": "Choose Friendly Free Chat or Exchange Views for discussion, Gentle Conversation Coach for support, Focused Correction Coach for retries, or Score and Rewrite Coach for clearer expression."
        }
      ]
    },
    {
      "id": "retry",
      "title": {
        "zh": "一次处理一个重点",
        "en": "Work on one issue"
      },
      "paragraphs": [
        {
          "zh": "确认修改保留原意，再试着重说。不理解就提问，想继续就明确跳过。原句自然时，不必为了“升级”而改。",
          "en": "Check that the correction preserves your meaning, then retry. Ask when unclear or explicitly skip. Natural wording does not need an upgrade."
        }
      ],
      "example": "I work on it yesterday. → I worked on it yesterday."
    },
    {
      "id": "adjust",
      "title": {
        "zh": "用起来再调整",
        "en": "Adjust after trying it"
      },
      "paragraphs": [
        {
          "zh": "纠错打断思路就换温和方式；总在同一处出错，就留一小段时间专练。评分仅作参考。",
          "en": "Choose gentler feedback if correction breaks your flow. Set aside a short focused practice for a recurring issue. Treat scores as informal feedback."
        }
      ]
    }
  ],
  "practice": practiceLinks(["daily-check-in", "gentle-start", "focused-correction", "expression-upgrade"])
},
{
  "id": "ten-minute-ai-conversation",
  "shelf": "practice",
  "group": "practise",
  "topic": "ai",
  "title": guideTitles["ten-minute-ai-conversation"],
  "summary": {
    "zh": "用一个情境练交流，最后留下少量有用表达。",
    "en": "Practise one situation and keep a few useful expressions."
  },
  "tags": [
    {
      "zh": "口语 自言自语 情境对话 纠错 辩论",
      "en": "speaking conversation self-talk role-play feedback"
    }
  ],
  "sections": [
    {
      "id": "site-use",
      "title": {
        "zh": "选一个情境",
        "en": "Choose a situation"
      },
      "paragraphs": [
        {
          "zh": "从一次工作沟通、旅行经历或日常话题开始。可以直接聊，也可在「情境扮演教练」中选择场景。",
          "en": "Start with a work conversation, travel experience or everyday topic. Chat freely or choose a scenario in Role-play Coach."
        }
      ]
    },
    {
      "id": "situation",
      "title": {
        "zh": "说清这次的目标",
        "en": "Set the goal"
      },
      "paragraphs": [
        {
          "zh": "告诉 AI 你想完成什么，例如说明延期或处理预订问题。十分钟只是参考，按自己的时间调整。",
          "en": "Tell the AI what you want to achieve, such as explaining a delay or resolving a booking problem. Treat ten minutes as a flexible guide."
        }
      ],
      "example": "I need to explain a project delay. Help me make the next step clear."
    },
    {
      "id": "feedback",
      "title": {
        "zh": "选择反馈节奏",
        "en": "Choose the feedback rhythm"
      },
      "paragraphs": [
        {
          "zh": "练流畅度时先讲完再反馈；练准确性时停下来改一个问题。卡住就要提示，再用自己的话继续。",
          "en": "For flow, speak before receiving feedback. For accuracy, pause to fix one issue. Ask for a hint and continue in your own words."
        }
      ]
    },
    {
      "id": "finish",
      "title": {
        "zh": "简短收尾",
        "en": "Finish with a small review"
      },
      "paragraphs": [
        {
          "zh": "选一到三个有用表达，换个情况再用一次。下次从其中一个继续。",
          "en": "Choose one to three useful expressions and use them in another situation. Revisit one at your next session."
        }
      ]
    }
  ],
  "practice": practiceLinks(["roleplay-coach", "complete-study-notes"])
},
{
  "id": "self-talk-to-real-conversation",
  "shelf": "practice",
  "group": "practise",
  "topic": "methods",
  "title": guideTitles["self-talk-to-real-conversation"],
  "summary": {
    "zh": "先讲一件小事，再练习回应对方。",
    "en": "Describe a small event, then practise responding to someone."
  },
  "tags": [
    {
      "zh": "自言自语 看图 复述",
      "en": "self-talk description retelling"
    }
  ],
  "sections": [
    {
      "id": "start",
      "title": {
        "zh": "先说几句",
        "en": "Start with a few sentences"
      },
      "paragraphs": [
        {
          "zh": "讲今天发生的一件事或接下来要做的决定。不知道某个词时，先解释用途或请求提示。",
          "en": "Describe something that happened today or a decision ahead. Explain a missing word by its purpose or ask for a hint."
        }
      ]
    },
    {
      "id": "choose",
      "title": {
        "zh": "找一个交流伙伴",
        "en": "Add a partner"
      },
      "paragraphs": [
        {
          "zh": "想继续聊可选「朋友闲聊」；想先讲完再纠错可选「复述纠错教练」。把刚才的内容作为开场。",
          "en": "Choose Friendly Free Chat to discuss it, or Retelling Coach to finish your account before feedback. Use your description as the opening."
        }
      ]
    },
    {
      "id": "transfer",
      "title": {
        "zh": "回应没准备的问题",
        "en": "Try an unplanned response"
      },
      "paragraphs": [
        {
          "zh": "请对方追问一个细节，或提出不同看法。尝试澄清、换个说法或回应反驳，逐渐离开预先写好的独白。",
          "en": "Invite a detail question or a different view. Clarify, rephrase or respond to disagreement rather than relying only on a prepared monologue."
        }
      ]
    }
    ,{
      "id": "context-and-tone",
      "title": { "zh": "问清习惯，不猜规则", "en": "Ask about preferences" },
      "paragraphs": [{ "zh": "换了关系或场合，先确认对方的习惯。参加饭局可以询问怎么称呼、是否带东西或餐桌安排，不用按国籍替对方决定规矩。", "en": "Check preferences when the relationship or setting changes. For dinner, ask how to address the host, what to bring or how the meal works rather than assuming rules from nationality." }],
      "example": "Is there anything you would like me to bring?"
    }
  ],
  "practice": practiceLinks(["daily-check-in", "story-summary", "visual-vocabulary"])
},
{
  "id": "listen-check-listen",
  "shelf": "practice",
  "group": "practise",
  "topic": "methods",
  "title": guideTitles["listen-check-listen"],
  "summary": {
    "zh": "先听大意，再核对难点，最后回到原声。",
    "en": "Listen for meaning, check a difficulty and return to the recording."
  },
  "tags": [
    {
      "zh": "听力 精听 泛听 跟读 听写",
      "en": "listening audio dictation shadowing"
    }
  ],
  "sections": [
    {
      "id": "site-use",
      "title": {
        "zh": "选择对应的听力工具",
        "en": "Choose the listening task"
      },
      "paragraphs": [
        {
          "zh": "听写用「听写对照与查漏」，检查主旨和细节用「听力理解自测」，模仿节奏用「短句跟读准备」。",
          "en": "Use Dictation comparison for transcription, Listening comprehension check for meaning, and Prepare a shadowing segment for imitation."
        }
      ]
    },
    {
      "id": "workflow",
      "title": {
        "zh": "处理一小段",
        "en": "Work through a short segment"
      },
      "paragraphs": [
        {
          "zh": "先不看文本听一遍，说明大意；再核对一处没听清的地方。弄懂后暂停模仿，最后隐藏文本再听一次。",
          "en": "Listen without text and state the meaning. Check one unclear moment, imitate it after understanding, then listen again without text."
        }
      ],
      "example": "I heard: We need ship it Friday.\nReference: We need to ship it by Friday."
    },
    {
      "id": "ai-help",
      "title": {
        "zh": "把自己的尝试交给 AI",
        "en": "Share your attempt"
      },
      "paragraphs": [
        {
          "zh": "提供听写或要点及对应原文，让 AI 帮你找差异。只有文字时，它能解释语言，不能确认声音问题。暂停模仿是听完再说；回音式模仿先在脑中回放声音再说；同步跟读则边听边跟。想检查能否运用，再不看稿表达自己的意思；泛听时继续听大意即可。",
          "en": "Supply your attempt and the reference for comparison. With text alone, the AI can explain language but not establish an acoustic cause. Pause-and-repeat follows the phrase; echo practice adds a brief mental replay; synchronous shadowing follows along with the recording. Optionally retell without the script to try using it. For extensive listening, follow the meaning."
        }
      ]
    }
  ],
  "practice": practiceLinks(["listening-dictation", "listening-shadowing", "listening-check"])
},
{
  "id": "read-and-check-understanding",
  "shelf": "practice",
  "group": "practise",
  "topic": "methods",
  "title": guideTitles["read-and-check-understanding"],
  "summary": {
    "zh": "先自己读，再针对难点提问，最后检查理解。",
    "en": "Read first, ask about a difficulty and check your understanding."
  },
  "tags": [
    {
      "zh": "阅读 长难句 技术英语 理解自测",
      "en": "reading complex sentences technical English comprehension"
    }
  ],
  "sections": [
    {
      "id": "site-use",
      "title": {
        "zh": "选择阅读工具",
        "en": "Choose a reading tool"
      },
      "paragraphs": [
        {
          "zh": "段落疑问用「文章阅读辅导」，句子结构用「长难句拆解」，独立自测用「阅读理解自测」。",
          "en": "Use Reading guide for a passage, Unpack a complex sentence for structure, and Reading comprehension check for self-testing."
        }
      ]
    },
    {
      "id": "read-first",
      "title": {
        "zh": "先概括大意",
        "en": "State the main idea"
      },
      "paragraphs": [
        {
          "zh": "读完一小段，用一句话概括，标出影响理解的地方。邮件关注行动与时间，技术文档关注前提与限制。",
          "en": "Summarise a short passage in one sentence and mark what blocks understanding. Look for actions and dates in emails, and prerequisites and limits in technical documents."
        }
      ]
    },
    {
      "id": "unpack",
      "title": {
        "zh": "只问当前难点",
        "en": "Ask a focused question"
      },
      "paragraphs": [
        {
          "zh": "给出原句和自己的理解，让 AI 解释具体分歧。长句先找主干，再看从句、指代和连接词。",
          "en": "Share the sentence and your interpretation. Ask about the specific difference; for long sentences, find the main clause before modifiers and references."
        }
      ]
    },
    {
      "id": "self-test",
      "title": {
        "zh": "合上解释再回答",
        "en": "Answer without the explanation"
      },
      "paragraphs": [
        {
          "zh": "先读再答题，卡住时要线索。已经看过答案，就换一段相近难度的材料检查独立理解。",
          "en": "Read before answering and ask for a hint when stuck. If you have already seen the answers, try another passage to check independent understanding."
        }
      ]
    }
  ],
  "practice": practiceLinks(["material-practice", "reading-guide", "reading-check", "reading-sentences"])
},
{
  "id": "write-revise-and-reuse",
  "shelf": "practice",
  "group": "practise",
  "topic": "methods",
  "title": guideTitles["write-revise-and-reuse"],
  "summary": {
    "zh": "先写自己的版本，再理解修改并尝试复用。",
    "en": "Write your version, understand revisions and reuse the language."
  },
  "tags": [
    {
      "zh": "写作 邮件 工作消息 摘要 改述",
      "en": "writing email messages summary paraphrase revision"
    }
  ],
  "sections": [
    {
      "id": "site-use",
      "title": {
        "zh": "起草还是修改",
        "en": "Start or revise"
      },
      "paragraphs": [
        {
          "zh": "想像发消息一样交流，选「文字聊天伙伴」；练一篇短文选「场景写作练习」，已有草稿选「写作纠错与解释」。",
          "en": "Choose Text Chat Partner for casual written exchanges, Scenario writing practice for a task, or Writing feedback for a draft."
        }
      ]
    },
    {
      "id": "intent",
      "title": {
        "zh": "明确读者与目的",
        "en": "Define the reader and purpose"
      },
      "paragraphs": [
        {
          "zh": "先写清希望对方知道什么或做什么，再写一个短初稿。区分事实、估计和请求。",
          "en": "Decide what the reader should know or do, then write a short draft. Keep facts, estimates and requests distinct."
        }
      ]
    },
    {
      "id": "revise",
      "title": {
        "zh": "看懂改动，再改一版",
        "en": "Understand and revise"
      },
      "paragraphs": [
        {
          "zh": "先处理最影响理解的一到三个问题，核对时间、语气和原意。自己改一版，再请 AI 检查。",
          "en": "Focus on one to three important issues. Check time, tone and meaning, revise yourself and ask for another check."
        }
      ]
    },
    {
      "id": "tasks",
      "title": {
        "zh": "换个情况再写",
        "en": "Try another situation"
      },
      "paragraphs": [
        {
          "zh": "隐藏范文，换一个收件人或场景再写几句。想做双向重构，可在「摘要与改述练习」中先记意思，之后不看原句再写；核对原意，不要求逐字相同。",
          "en": "Hide the model and write for another reader or situation. For reconstruction in Summarize & paraphrase, note the meaning and later rewrite without the original; preserve meaning rather than identical wording."
        }
      ]
    }
  ],
  "practice": practiceLinks(["writing-text-chat", "writing-practice", "writing-feedback", "writing-email", "writing-summary"])
},
{
  "id": "technical-english-in-context",
  "shelf": "practice",
  "group": "practise",
  "topic": "methods",
  "title": guideTitles["technical-english-in-context"],
  "summary": {
    "zh": "读懂一段文档，再练习向同事说明。",
    "en": "Understand a passage, then explain it to a colleague."
  },
  "tags": [
    {
      "zh": "技术英语 文档 职场",
      "en": "technical English documentation workplace"
    }
  ],
  "sections": [
    {
      "id": "read",
      "title": {
        "zh": "先读懂",
        "en": "Understand it"
      },
      "paragraphs": [
        {
          "zh": "用「读懂技术文档」处理一小段公开材料，指出不懂的句子。重点看前提、行为和限制。",
          "en": "Use Read technical documentation with a short public passage. Focus on prerequisites, behavior and limitations."
        }
      ]
    },
    {
      "id": "explain",
      "title": {
        "zh": "用自己的话解释",
        "en": "Explain it yourself"
      },
      "paragraphs": [
        {
          "zh": "合上原文，说清解决什么问题、怎样工作，再用职场场景练讨论。项目细节换成可分享的示例。",
          "en": "Close the text and explain the problem and behavior, then discuss it in a workplace scenario. Use shareable examples rather than confidential details."
        }
      ],
      "example": "Retries add load during an outage. We use a backoff delay to spread them out."
    },
    {
      "id": "check",
      "title": {
        "zh": "核对重要事实",
        "en": "Check important facts"
      },
      "paragraphs": [
        {
          "zh": "练习回应一个条件或限制。语言反馈可以参考 AI，技术结论仍回到原文确认。",
          "en": "Respond to a question about a condition or limitation. Use AI for language feedback and the source for technical verification."
        }
      ]
    }
  ],
  "practice": practiceLinks(["reading-technical", "roleplay-coach"])
},
{
  "id": "review-and-reuse-expressions",
  "shelf": "practice",
  "group": "review",
  "topic": "methods",
  "title": guideTitles["review-and-reuse-expressions"],
  "summary": {
    "zh": "留少量有用表达，隔一阵再试着用出来。",
    "en": "Keep a few useful expressions and retrieve them later."
  },
  "tags": [
    {
      "zh": "主动回忆 间隔 重复 词块 笔记",
      "en": "retrieval spacing repetition chunks vocabulary notes"
    }
  ],
  "sections": [
    {
      "id": "site-use",
      "title": {
        "zh": "选一种复习方式",
        "en": "Choose one review"
      },
      "paragraphs": [
        {
          "zh": "在原来的 AI 对话中生成笔记、句子纠错、词汇或卡片。换了对话，就先提供真实记录。",
          "en": "Create notes, corrections, vocabulary or cards in the original AI chat. Supply the actual record in a different conversation."
        }
      ]
    },
    {
      "id": "select",
      "title": {
        "zh": "保留有用的内容",
        "en": "Keep what matters"
      },
      "paragraphs": [
        {
          "zh": "想积累个人表达时，只选少量近期会用的句子，记下场景，并区分自己说过的与 AI 提供的例句。无需每次整理整段对话。",
          "en": "For a personal collection, keep a few expressions you expect to use, with context. Label your own usage separately from AI examples; a full transcript is unnecessary."
        }
      ]
    },
    {
      "id": "retrieve",
      "title": {
        "zh": "先回忆，再看答案",
        "en": "Recall before checking"
      },
      "paragraphs": [
        {
          "zh": "需要互动复习时，选「情境回忆练习」，只看场景先说一句，卡住先要提示，再核对参考表达。合理的不同说法也算完成。",
          "en": "Choose Expression Recall for interactive practice. Respond to a situation first, ask for a hint if stuck and then check the model; natural alternatives can also work."
        }
      ]
    },
    {
      "id": "transfer",
      "title": {
        "zh": "隔一阵，换个场景",
        "en": "Space it and vary it"
      },
      "paragraphs": [
        {
          "zh": "下次练习先复习几个旧表达，再换一个相近情境使用。能轻松用出的内容可以拉长复习间隔。",
          "en": "Revisit a few expressions next time and use them in a related situation. Increase the interval when retrieval becomes easy."
        }
      ]
    }
  ],
  "practice": practiceLinks(["complete-study-notes", "sentence-correction-review", "vocabulary-ipa-review", "review-cards", "expression-recall"])
}
];

export const companionArticles: HandbookArticle[] = [workflowGuide, ...practiceCompanions];
