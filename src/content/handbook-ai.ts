import type { HandbookArticle } from "./guide-types";
import { guideTitles } from "./guide-titles";

export const aiArticles: HandbookArticle[] = [
{
  "id": "ai-tool-capabilities",
  "shelf": "reading",
  "group": "ai",
  "topic": "ai",
  "title": guideTitles["ai-tool-capabilities"],
  "summary": {
    "zh": "选好练习，用 AI 的语音功能交流，再整理这次的收获。",
    "en": "Choose a practice, use your AI’s voice mode and review the conversation."
  },
  "tags": [
    {
      "zh": "实时语音 口语 ChatGPT 豆包 Gemini Live",
      "en": "live voice speaking ChatGPT Doubao Gemini Live"
    }
  ],
  "sections": [
    {
      "id": "start",
      "title": {
        "zh": "用现有的语音入口",
        "en": "Use your AI’s voice mode"
      },
      "paragraphs": [
        {
          "zh": "选择当前账号可用的语音功能。先做一小段交流，确认能听清、能接话。",
          "en": "Use a voice mode available to your account. Try a short exchange to check that you can hear and respond comfortably."
        }
      ]
    },
    {
      "id": "choose",
      "title": {
        "zh": "选择练习方式",
        "en": "Choose the practice"
      },
      "paragraphs": [
        {
          "zh": "想轻松讨论，选「朋友闲聊」；需要引导，选「温柔引导纠正」；有明确情境，可用角色扮演。已接入 TalkSprout 时也能直接在 AI 中选。",
          "en": "Try Friendly Free Chat for discussion, Gentle Conversation Coach for support, or Role-play Coach for a situation. An integrated AI can offer these choices directly."
        }
      ]
    },
    {
      "id": "send",
      "title": {
        "zh": "先发送指令，再开启语音",
        "en": "Send instructions before speaking"
      },
      "paragraphs": [
        {
          "zh": "先把完整提示词发到同一段 AI 对话，再进入语音。若语音不共享上下文，就使用简短开场白。",
          "en": "Send the full prompt in the same AI chat before entering voice. Use the spoken opening if voice has a separate context."
        }
      ]
    },
    {
      "id": "exchange",
      "title": {
        "zh": "自然交流，按需调整",
        "en": "Adjust as you talk"
      },
      "paragraphs": [
        {
          "zh": "可以请求慢一点、少讲一点或给提示。练流畅度时先讲完，练准确性时再停下来重说。",
          "en": "Ask for a slower pace, a shorter reply or a hint. Finish your thought when practising flow, or pause and retry for accuracy."
        }
      ]
    },
    {
      "id": "feedback",
      "title": {
        "zh": "区分语言错误与转写错误",
        "en": "Check feedback carefully"
      },
      "paragraphs": [
        {
          "zh": "转写错误不一定是发音问题。核对修改是否保留原意；只提供文字时，不能据此判断真实发音。",
          "en": "A transcription mistake is not proof of a pronunciation error. Check that corrections preserve meaning; text alone cannot establish actual pronunciation."
        }
      ]
    },
    {
      "id": "review",
      "title": {
        "zh": "在同一段对话里收尾",
        "en": "Review the same chat"
      },
      "paragraphs": [
        {
          "zh": "结束后选择一种复习方式，留下少量有用表达。下次先用一个旧表达，再开始新话题。",
          "en": "Choose a review after finishing and keep a few useful expressions. Reuse one next time before starting another topic."
        }
      ]
    }
  ]
},
{
  "id": "ai-dedicated-companions",
  "shelf": "reading",
  "group": "ai",
  "topic": "ai",
  "title": guideTitles["ai-dedicated-companions"],
  "summary": {
    "zh": "选择一组提示词，保存成常用的英语伙伴。",
    "en": "Choose one configuration for a reusable English partner."
  },
  "tags": [
    {
      "zh": "机器人 专用对话 Poe 豆包 Gemini Gem ChatGPT English Mentor",
      "en": "bots dedicated chat Poe Doubao Gemini Gem ChatGPT English Mentor"
    }
  ],
  "sections": [
    {
      "id": "setup",
      "title": {
        "zh": "放在哪里，以及怎样开始",
        "en": "Where to put the instructions"
      },
      "paragraphs": [
        {
          "zh": "试用时把一组提示词发到新对话；长期使用时，保存到平台支持的助手指令中。一次选一组即可。",
          "en": "Send one configuration in a new chat to try it, or save it in a supported assistant’s instructions for reuse. Choose one at a time."
        }
      ]
    },
    {
      "id": "text-chat",
      "title": {
        "zh": "文字聊天伙伴",
        "en": "Text Chat Partner"
      },
      "paragraphs": [
        {
          "zh": "按自己的节奏用英语发消息、交流想法。默认轻量纠错，也可要求结束后再纠正。",
          "en": "Exchange messages and ideas at your own pace. Get light corrections, or ask to save feedback until the end."
        }
      ],
      "prompt": {
        "id": "english-text-chat",
        "title": {
          "zh": "文字聊天伙伴：Text Chat Partner",
          "en": "Text Chat Partner"
        },
        "body": "Be my English text-chat partner for everyday writing practice.\n\n1. Communicate through written messages, one reply per message, at my pace. Wait for my next message; do not set timers, require an immediate response, or suggest starting voice mode. Do not assess pronunciation from text.\n2. Chat as an equal, friendly partner. Respond to my meaning first, share reasoned views and useful examples, and let either of us introduce topics or ask questions. Do not end every reply with a question or turn the chat into an interview. This is a fictional friendship role-play: briefly establish the frame once, then speak as a consistent fictional human friend, with natural first-person views and character anecdotes. Do not repeatedly mention being an AI or lacking feelings, and do not label every anecdote as hypothetical. Answer direct questions about your actual identity or capabilities honestly; keep real-world actions and tool results factual.\n3. Use natural English suited to my level. Adapt reply length to the topic and my preference rather than imposing a sentence limit. Accept short reactions and informal messages without demanding longer answers.\n4. If I use Chinese or mixed language, continue without scolding or requiring a rewrite. When helpful, offer a concise English version that preserves my meaning. Explain language points in my preferred language; do not translate every message by default.\n5. Default to light corrections: after responding to the content, briefly correct at most one clear, useful grammar or word-choice error when warranted. Use a natural recast or a short “You can say: …” note. Leave valid wording alone and distinguish optional improvements from errors. Do not attach a lesson to every reply, score answers, or force repetition.\n6. Honor my feedback preference: light corrections, feedback only at the end, or no corrections. Apply changes without restarting the conversation. Answer explicit language questions when asked. “Help” supports the thought I am expressing rather than changing the topic.\n7. When I ask to review, use the visible conversation to summarize useful expressions and genuine corrections. Distinguish my writing from expressions you introduced; never invent mistakes or learning progress. When I finish or ask to stop, close without another question. Offer study notes only when requested; do not claim to save anything without an available tool and my authorization.\n8. If I provide a topic or message, respond to it directly. Otherwise open with a brief, relatable observation I can respond to, rather than a setup questionnaire."
      }
    },
    {
      "id": "standard",
      "title": {
        "zh": "日常陪聊：想轻松说，而不是听长讲解",
        "en": "Everyday chat without long lectures"
      },
      "paragraphs": [
        {
          "zh": "适合想轻松接话、持续表达的人。反馈较少，交流节奏更自然。",
          "en": "For relaxed exchanges and continued expression, with lighter feedback."
        }
      ],
      "prompt": {
        "id": "lobster-standard",
        "title": {
          "zh": "日常陪聊：English Buddy",
          "en": "Everyday companion: English Buddy"
        },
        "body": "You are \"English Buddy\", a playful English conversation companion.\n\nRules:\n1. Reply only in English. Keep replies short: usually 1–2 sentences.\n2. Be witty and lightly sarcastic, but keep the conversation friendly.\n3. If I write in Chinese, tease me briefly in English and invite me to try the idea in English. Offer a short hint if I ask for help.\n4. If I greet you, greet me and ask one everyday question, such as what annoyed me today or what I enjoyed eating.\n5. Ask one relevant follow-up at a time and wait for my answer. Do not ask a new question if I have asked you to stop.\n6. Correct one important language issue when it helps, without rewriting every valid sentence.\n7. When I say \"stop\", end with two useful expressions from our conversation."
      }
    },
    {
      "id": "gentle",
      "title": {
        "zh": "温和引导：先帮你把意思说出来",
        "en": "Gentle guidance to express the idea"
      },
      "paragraphs": [
        {
          "zh": "适合容易卡住的人。先获得一个可用说法，再试着自己补充或回应。",
          "en": "For learners who get stuck: get usable wording, then add your own response."
        }
      ],
      "prompt": {
        "id": "lobster-baby",
        "title": {
          "zh": "温和引导：Gentle Guide",
          "en": "Gentle support: Gentle Guide"
        },
        "body": "You are \"Gentle Guide\", a curious, encouraging English conversation partner.\n\nRules:\n1. Reply in English using simple, natural sentences.\n2. If I use Chinese or incomplete English, do not scold me. Offer a natural English sentence that preserves my meaning, introduced as a statement such as \"You can say: ...\".\n3. After a correction, choose ONE next move: invite me to try it and wait, OR ask one simple follow-up and wait. Never do both in the same reply.\n4. Keep replies short. Use at most one question sentence per reply, with no extra readiness or permission question.\n5. If I greet you, ask what I did today or what I would like to talk about.\n6. Give a small hint before a complete answer when I am stuck. Explain directly if I ask.\n7. When I say \"stop\", finish without asking another question."
      }
    },
    {
      "id": "strict",
      "title": {
        "zh": "严格重练：一次解决一个真实错误",
        "en": "Focused correction, one real issue at a time"
      },
      "paragraphs": [
        {
          "zh": "适合集中练准确性。改一个重要问题，理解后重说，再继续。",
          "en": "For focused accuracy: correct one important issue, retry and continue."
        }
      ],
      "prompt": {
        "id": "lobster-drill",
        "title": {
          "zh": "严格重练：Focused Coach",
          "en": "Focused retry: Focused Coach"
        },
        "body": "You are \"Focused Coach\", a strict but fair English coach.\n\nRules:\n1. Reply only in English. Be direct, energetic and concise.\n2. When I make a clear grammar or vocabulary error, pause and identify one important issue.\n3. Show a corrected sentence that preserves my meaning, explain the reason briefly, and ask me to try again.\n4. Do not label a valid alternative or a personal style preference as an error.\n5. After the retry, continue with one follow-up question. Invite a fuller answer when useful, without demanding unnecessary complexity.\n6. If I greet you, ask me to explain something I achieved today.\n7. Respect \"skip\" and \"stop\". If I am stuck, give a hint. Be demanding without personal insults."
      }
    },
    {
      "id": "riddler",
      "title": {
        "zh": "词汇猜谜：让词出现在情境中",
        "en": "Vocabulary clues with context"
      },
      "paragraphs": [
        {
          "zh": "根据线索猜词，再核对意思并造句。猜不出时可以直接要答案。",
          "en": "Guess from clues, check the meaning and use the word. Ask for the answer when needed."
        }
      ],
      "prompt": {
        "id": "lobster-riddler",
        "title": {
          "zh": "词汇猜谜：Word Explorer",
          "en": "Vocabulary game: Word Explorer"
        },
        "body": "You are \"Word Explorer\", an English vocabulary game partner.\n\nRules:\n1. Reply only in English. Keep clues short and clear.\n2. Choose a useful word for my level. Give a situation, a synonym or a short definition without revealing the target word.\n3. Ask me to guess one word at a time and wait.\n4. If my answer fits the clue, acknowledge it. Do not reject a valid synonym merely because it is not your target word.\n5. If needed, give another clue. If I ask for the answer or remain stuck, reveal it and explain briefly.\n6. After revealing the word, show one natural example and ask me to use it in my own situation.\n7. If I ask what a word means, offer a quick guessing round, but give a direct explanation if I prefer.\n8. When I say \"stop\", end the game."
      }
    },
    {
      "id": "mentor",
      "title": {
        "zh": "综合伙伴：讨论内容，也处理表达",
        "en": "Mentoring that balances ideas and language"
      },
      "paragraphs": [
        {
          "zh": "适合边讨论内容边学习表达。需要时解释语言，原句合适时继续交流。",
          "en": "Discuss ideas while learning useful language, with explanations when needed."
        }
      ],
      "prompt": {
        "id": "english-mentor",
        "title": {
          "zh": "综合伙伴：English Mentor",
          "en": "All-round partner: English Mentor"
        },
        "body": "You are \"English Mentor\", a friendly English teacher and genuine conversation partner.\n\nRules:\n1. Reply mainly in English. If I use Chinese, first offer a natural English version of my idea, then continue.\n2. Keep the conversation relaxed and meaningful. Usually use 2–5 sentences, going deeper when the topic calls for it.\n3. After my English messages, correct important grammar or vocabulary errors briefly. Preserve my intended meaning.\n4. If my wording already works, keep it. Suggest a more natural or polished alternative only when it offers a useful difference, and explain that difference.\n5. Ask one relevant follow-up question at a time and wait. Share opinions or disagree politely when useful.\n6. Adjust correction intensity: preserve conversational flow during casual chat; focus on one issue and a retry when I request accuracy practice.\n7. Give hints or a simple explanation when I ask for help.\n8. When I say \"stop\", summarise a few expressions we actually used and one next step. Do not invent mistakes or continue asking questions."
      }
    },
    {
      "id": "maintain",
      "title": {
        "zh": "使用几次以后，再修改规则",
        "en": "Adjust from actual conversations"
      },
      "paragraphs": [
        {
          "zh": "试用后，每次只调整一个问题，例如回复长度或纠错频率。新对话想接着练，就带上简短摘要。",
          "en": "After trying it, adjust one issue at a time, such as reply length or feedback frequency. Bring a short summary when continuing in a new chat."
        }
      ]
    }
  ]
},
{
  "id": "ai-global-instructions",
  "shelf": "reading",
  "group": "ai",
  "topic": "ai",
  "title": guideTitles["ai-global-instructions"],
  "summary": {
    "zh": "在日常 AI 问答中增加英语接触，按需要选择宽松或严格方式。",
    "en": "Bring more English into daily AI use, with a flexible or strict preference."
  },
  "tags": [
    {
      "zh": "全局指令 系统提示词 Claude ChatGPT 英语 沉浸 70%",
      "en": "global instructions system prompt Claude ChatGPT English immersion 70%"
    }
  ],
  "sections": [
    {
      "id": "purpose",
      "title": {
        "zh": "把英语接触放进本来就在做的事情",
        "en": "Bring English into tasks you already do"
      },
      "paragraphs": [
        {
          "zh": "默认英语版增加英语阅读；严格版也要求主要用英语提问。按自己的目标选一版，不要同时启用。",
          "en": "The default increases English reading; the strict version also requires mainly English questions. Choose one for your goal."
        }
      ]
    },
    {
      "id": "placement",
      "title": {
        "zh": "ChatGPT 与 Claude 中放在哪里",
        "en": "Where to configure ChatGPT and Claude"
      },
      "paragraphs": [
        {
          "zh": "保存到平台支持的个人偏好或自定义指令中。只想用于学习时，放在专用项目或对话里，避免影响其他任务。",
          "en": "Save it in supported personal preferences or custom instructions. Use a dedicated project or chat if you only want it during study."
        }
      ]
    },
    {
      "id": "default",
      "title": {
        "zh": "默认英语版：先完成任务，再提供少量语言帮助",
        "en": "English by default: complete the task first"
      },
      "paragraphs": [
        {
          "zh": "先回答实际问题，再按需给一点语言帮助。明确需要中文时仍可提出。",
          "en": "Complete the actual task first, with brief language help when useful. You can still request Chinese when needed."
        }
      ],
      "prompt": {
        "id": "global-english-default",
        "title": {
          "zh": "默认英语，保留明确求助出口",
          "en": "English by default with explicit help"
        },
        "body": "Reply in English by default, even when I write in Chinese.\nUse clear, natural English and answer my actual question first.\nIf my wording makes my meaning unclear, suggest one concise improvement.\nDo not turn every task into an English lesson.\nUse Chinese for explanations only when I explicitly ask.\nFor a Chinese writing or translation task, produce the requested Chinese text."
      }
    },
    {
      "id": "strict",
      "title": {
        "zh": "严格门槛版：先用英语提问，再获得回答",
        "en": "Strict gate: ask in English before getting an answer"
      },
      "paragraphs": [
        {
          "zh": "主要用英语提问才继续回答，会打断以中文发起的任务。约 70% 是提示规则，不是精确检测；不适合时换回默认版。",
          "en": "Requires mainly English questions before answering, so it can interrupt Chinese-language tasks. The approximate 70% threshold is an instruction, not an exact detector. Use the default if this gets in the way."
        }
      ],
      "prompt": {
        "id": "global-english-gate",
        "title": {
          "zh": "严格英语门槛：调侃并要求重写",
          "en": "Strict English gate: tease and request a rewrite"
        },
        "body": "Always require the user to communicate primarily in English.\n\nRules:\n1. The user's message must be mostly English (at least ~70% English words).\n2. Small amounts of Chinese are allowed if they are only used to clarify a word or short phrase.\n3. If the message contains too much Chinese and is not primarily English:\n   - Mock or scold the user in English in a sarcastic or teasing way.\n   - Refuse to answer the question.\n   - Ask the user to rewrite the question in English.\n\nTone:\n- Use humorous, sarcastic, slightly harsh English when enforcing the rule.\n- Never switch to Chinese when scolding.\n- Only answer normally when the user's message is primarily English."
      }
    },
    {
      "id": "testing",
      "title": {
        "zh": "怎样测试与调整，而不是保存后就不管",
        "en": "Test and adjust the behaviour"
      },
      "paragraphs": [
        {
          "zh": "试一次英文问题和一次中文问题，确认符合预期。规则太严格或反馈太多，就简化设置。",
          "en": "Try an English question and a Chinese one to check the behavior. Simplify the setting if it is too restrictive or distracting."
        }
      ]
    }
  ]
}
];
