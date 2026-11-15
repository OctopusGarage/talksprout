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
    "zh": "用本站口语提示词开始实时交流：选练习方式、设置情境、处理卡顿与纠错，再从同一段对话整理复习。",
    "en": "Use the app’s speaking prompts for live exchanges: choose a coach, set a situation, handle help and feedback, then review the same conversation."
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
        "zh": "实时语音适合练什么",
        "en": "What live voice is useful for"
      },
      "paragraphs": [
        {
          "zh": "实时语音的重点，是听到对方说话以后组织自己的回应。它可以练日常交流、工作解释、角色扮演和临场追问；与先把一段话写好、再朗读给 AI 不同，你需要在交流中确认意思、请求重复和调整说法。语音输入转成文字再发送也有用，但它不等于持续来回的实时对话。",
          "en": "Live voice practises organising a response after hearing another person. Use it for everyday conversation, work explanations, role-play and unexpected questions. Unlike reading a prepared script, interaction includes clarification and rephrasing. Dictating text before sending is useful too, but differs from a live spoken exchange."
        },
        {
          "zh": "ChatGPT 的语音对话、豆包的实时语音通话、Gemini Live 都是这类入口。选你当前账号和客户端实际可用的即可，不用按品牌再学三套方法。先用短交流确认麦克风、语言和等待方式合适；支持语音不代表所有附件、机器人和个性化设置都能在同一模式里使用。",
          "en": "ChatGPT voice conversations, Doubao voice calls and Gemini Live are examples. Use the one actually available to your account and client, and check the microphone, language and turn-taking in a short exchange. Voice availability does not establish that every attachment, bot or personalisation setting works in the same mode."
        }
      ]
    },
    {
      "id": "choose",
      "title": {
        "zh": "先在本站选一种口语练习",
        "en": "Choose a speaking coach in this app"
      },
      "paragraphs": [
        {
          "zh": "从底部“开始练习”进入，先按本次目标选提示词。想随便聊而不想频繁中断，用“自然聊天纠正”；基础不稳、需要提示和温和接话，用“温柔引导纠正”；想集中纠正并重说，用“严格纠错重练”；需要情境互动，用角色扮演类练习。不要第一次就把所有模式拼成一条长指令。",
          "en": "Open Start practice and choose a prompt for today’s goal. Use the natural coach for conversational flow, gentle coaching for support, focused correction for retries, or role-play for a situation. Start with one mode instead of combining every coach into a long instruction."
        },
        {
          "zh": "打开详情后，可以选择一个相关情境。情境负责交代你们是谁、想完成什么，教练模式负责决定如何帮助和纠错。相同的酒店入住场景既可以温和练，也可以模拟更接近真实的来回；先决定本次是练流畅交流还是练某个具体表达，反馈方式才不会互相冲突。",
          "en": "Choose an optional situation in the prompt details. A situation supplies roles and a goal; a coach defines support and correction. The same hotel exchange can be supportive or more realistic. Decide whether you want conversational flow or a particular language improvement so feedback requests do not conflict."
        }
      ]
    },
    {
      "id": "send",
      "title": {
        "zh": "完整提示词与简短开场怎么用",
        "en": "Use the full prompt or the spoken opening"
      },
      "paragraphs": [
        {
          "zh": "能先发文字时，复制完整提示词到你将要练习的那一个 AI 对话，再从该对话进入语音。如果当前语音入口不沿用之前的文字说明，就在语音里重新简述最重要的要求。不能先贴长文本时，使用本站的简短口头开场。简短版适合启动，但不包含完整提示词的所有细节。",
          "en": "When possible, paste the full prompt into the AI conversation you will use, then enter voice from that conversation. Restate key requirements if that voice mode does not carry them over. Use the short spoken opening when pasting a long prompt is impractical. It starts the exercise without reproducing every detail of the full version."
        },
        {
          "zh": "不要把在本站收藏组合误认为已经创建了 AI 机器人，也不要以为复制提示词会自动传送聊天记录。本站负责准备提示词；实际语音、材料访问和历史记录发生在你使用的 AI 中。Gems 不能直接用于 Gemini Live，因此保存一个 Gem 后仍要单独确认 Live 中的练习要求。",
          "en": "Saving a combination here does not create an AI bot, and copying a prompt does not transfer a transcript. This app prepares instructions; the chosen AI handles voice and history. Gems cannot be used directly in Gemini Live, so confirm your requirements separately in Live."
        }
      ]
    },
    {
      "id": "exchange",
      "title": {
        "zh": "一次练习，从表达一个意思开始",
        "en": "Begin with one message you want to convey"
      },
      "paragraphs": [
        {
          "zh": "开始以后先完成一个小目标：解释今天遇到的问题、描述一张图、在角色扮演中提出一个请求。允许停顿和简单句。想不起词时先绕着解释，或者说“I’m not sure how to say this. Give me a hint.”。如果 AI 一次问很多问题，直接要求一次只问一个；如果回复太长，要求更短，而不是重开所有设置。",
          "en": "Start with one goal: explain a problem, describe an image or make a request in a role-play. Allow pauses and simple sentences. Explain around missing words or ask for a hint. If the AI asks too much, request one question at a time; if it talks too long, ask for shorter replies."
        },
        {
          "zh": "练流畅度时可以先讲完一小段，再处理一个重要问题；练准确性时可以暂停，听懂修改后自己重说。不要把“更像母语者”当唯一标准，先检查是否清楚、合适并保留原意。你可以明确要求结束、跳过一次重练，或换一个话题。请求慢一点是交流要求，不是精确音频倍速。",
          "en": "For fluency, finish a short message before discussing one important issue. For accuracy, pause, understand a revision and retry. Prioritise clear and appropriate meaning over sounding native. You can stop, skip a retry or change the topic. Asking for slower speech is a conversational request rather than exact playback-speed control."
        }
      ]
    },
    {
      "id": "feedback",
      "title": {
        "zh": "怎样判断语音反馈有没有帮助",
        "en": "Judge whether feedback helps"
      },
      "paragraphs": [
        {
          "zh": "转写把一个词记错，不能直接证明你发音错误；只提供文字时，AI 也没有依据评价具体口音、重音和语速。对语言反馈，检查它指出了哪一句、为什么要改、是否改变了你的意思。AI 的流利度分数和夸奖可以作为非正式反馈，但不等于专业口语测评。",
          "en": "A transcription mismatch does not establish a pronunciation error, and text alone does not support judging accent, stress or speech rate. For language feedback, identify the actual sentence, reason and effect on meaning. Fluency scores and praise in a chat are informal feedback rather than professional assessment."
        },
        {
          "zh": "遇到改写分歧，可以问“Is my original sentence wrong, or is this another style?”。重要技术事实回到实际文档，语言用法可以对照可靠例句。不要通过反复让同一个模型确认，来替代检查依据。最后自己在新句子里用一次，比只听完解释更能暴露是否理解。",
          "en": "Ask whether your original is wrong or simply another style. Check important technical facts against actual documentation and language questions against reliable examples. Repeated confirmation from a model does not replace evidence. Try the expression in a new sentence rather than stopping at the explanation."
        }
      ]
    },
    {
      "id": "review",
      "title": {
        "zh": "结束后，在同一段对话里整理",
        "en": "Review in the conversation where you practised"
      },
      "paragraphs": [
        {
          "zh": "结束时回到本站“结束与复习”，选择本次需要的整理方式，再把提示词发到刚才练习的 AI 对话里。可以整理少量表达、做句子练习或自测卡片。若另开对话，就要自己提供实际练习记录；没有记录，AI 只能给通用建议，不能准确回顾你刚才说过什么。",
          "en": "At the end, use Wrap-up and Review and send the selected review prompt to the conversation where you practised. Choose a few expressions, sentence practice or self-test cards. A new conversation needs the actual transcript; without it, the AI cannot accurately review what you said."
        },
        {
          "zh": "下次开始时先用一个旧表达回答新问题，再继续聊天。不必每次都把整段记录存成大笔记。留下目标、一个实际练过的例子和一个下次重点，就足够作为小型续接材料。计时和复习提醒需要自己安排，不能只因为提示词写了时间就认为系统一定在后台计时。",
          "en": "Next time, use an old expression in a fresh answer before continuing. A short record of the goal, a practised example and next focus can support continuity without a large transcript archive. Arrange timing and reminders separately; a time mentioned in a prompt does not establish a running timer."
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
    "zh": "保存一个随时能打开的英语伙伴。五组完整提示词可分别复制，用于陪聊、温和引导、严格重练、猜词和综合辅导。",
    "en": "Save a reusable English partner with five complete, separately copyable configurations for conversation, gentle help, focused retries, vocabulary and mentoring."
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
          "zh": "只想试一次，打开普通新对话，把下面选中的一组提示词作为第一条消息发送即可。想长期复用，就在当前平台支持的机器人、自定义助手或 Gem 的指令设置里保存，起一个容易识别的名字。Poe、豆包和 Gemini 等提供的具体入口会变化；ChatGPT 的自定义机制也可能随账号调整。用实际可用的配置方式，不必为了名字相同而换工具。",
          "en": "For a trial, send one configuration as the first message in a fresh chat. To reuse it, save it in the instructions for a bot, custom assistant or Gem available in your platform. Names and creation access vary across Poe, Doubao, Gemini and ChatGPT. Use the mechanism your account provides."
        },
        {
          "zh": "每个机器人只放一组主规则，不要把五种模式全部粘进去。创建后先打招呼、说一句不完整英语、试一次中文求助，再说 stop，看看它是否按预期接话。机器人保存的是练习方式，不代表每段聊天都会共享完整记忆；新聊天需要准确续接时，带上自己的简短学习摘要。",
          "en": "Use one main configuration per partner rather than pasting all five. Test a greeting, incomplete English, a request for help in Chinese and stop. A saved partner preserves a practice setup, not necessarily a complete shared transcript. Bring a short learning summary when exact continuity matters."
        }
      ]
    },
    {
      "id": "standard",
      "title": {
        "zh": "日常陪聊：想轻松说，而不是听长讲解",
        "en": "Everyday chat without long lectures"
      },
      "paragraphs": [
        {
          "zh": "这个版本适合已经能表达一些意思、希望有人用轻松语气追问的人。保留幽默和一点调侃，但把重点放在继续表达上。它不要求每句都修改，也不把简短回复做成固定考试。可以从今天最烦的一件事、吃到的食物或一个正在回避的任务聊起。",
          "en": "This partner suits someone who can express basic ideas and wants light conversation with follow-ups. It keeps humour and a little teasing while prioritising your participation. It does not rewrite every sentence or turn short answers into an exam. Start with your day, a meal or something you have been avoiding."
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
          "zh": "这个版本适合容易卡住、还不愿意被频繁纠错的人。你可以先给零散英语或中文意思，它会提出一种可用英语表达，再用简单问题接着聊。需要时可以直接要解释，不必一直猜。不要把它当成替你说完所有内容的工具：得到帮助后，尽量自己补一句或回应追问。",
          "en": "Use this when you get stuck easily or dislike frequent interruptions. Supply partial English or an idea in Chinese; the partner offers a usable expression and continues simply. Ask directly for an explanation when needed. After support, contribute a sentence or answer the follow-up yourself."
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
          "zh": "这个版本适合明确想练准确性的时候。它暂停交流，解释一个重要问题，让你重说后再继续。严格的核心是指出依据、保留原意、给出可执行的重练，不是纠错越多越好。原句本来正确、只是另一种风格时，不应该为了显得严格而判错。",
          "en": "Use this when accuracy is the explicit goal. It pauses for an important issue, explains it and invites a retry before continuing. Rigour means a justified correction and an actionable retry. A valid sentence should not be marked wrong merely to make the coach seem strict."
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
          "zh": "这个版本适合想用游戏增加词汇接触的人。先从线索猜，再核对词义和例句，最后用到自己的情境中。一个线索可能对应多个合理词，因此规则要求接受合理同义词；猜不出来也可以直接看答案。游戏是练习入口，不需要为了“挑战”无限延迟解释。",
          "en": "Use clues to encounter vocabulary, then check meaning and an example before making a personal sentence. A clue can fit several words, so the rules acknowledge valid alternatives. You can ask for the answer. The game should lead to usable understanding rather than indefinitely withholding an explanation."
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
          "zh": "这个版本适合希望一个固定伙伴既能聊内容、也能顺手解释英语的人。它会在必要时纠正，原句合适时不强行升级，还可以讨论观点和礼貌反驳。与严格重练版相比，它更重视完整交流；与纯陪聊相比，它会更主动地解释有用的表达差异。",
          "en": "This partner combines discussion with language help. It corrects useful issues without upgrading every suitable sentence and can discuss or politely challenge ideas. Compared with focused retry, it favours continuity; compared with casual chat, it offers more language explanation."
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
          "zh": "如果它讲太长，就修改回复长度；如果纠错太频繁，就改成每段之后处理一个问题；如果只给答案不等你尝试，就明确先提示、再等待。一次修改一个最影响使用的问题，比不断加长人设更容易判断效果。专业事实和重要用法仍需核对，机器人名称不代表老师资质或测评能力。",
          "en": "Change the rule that causes an actual difficulty: reply length, correction frequency or waiting before showing an answer. Adjust one important behaviour at a time. A persona does not establish teaching qualifications or assessment ability, and significant language or factual claims still need checking."
        },
        {
          "zh": "不必添加“这些是永久系统规则，永不压缩或遗忘”之类的承诺。写在指令里的这句话不能控制平台如何管理上下文。重要规则写在实际使用的助手设置里，长对话偏离时重申当前任务，新对话需要时补上摘要，通常比依靠强硬措辞更容易维护。",
          "en": "Declaring rules permanent or impossible to compress does not control a platform’s context management. Put important rules in the assistant configuration you actually use, restate the task when the conversation drifts and supply a summary when starting again."
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
    "zh": "把英语偏好放进日常 AI 设置。提供默认英语与严格英语门槛两种完整指令，分别复制，按需要选择。",
    "en": "Bring English into everyday AI use with two separately copyable settings: English by default or a strict English-input gate."
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
          "zh": "不一定每次都要进入“英语练习”才使用英语。查一个概念、讨论方案、整理计划和问生活问题时，也可以让 AI 主要用英语回答。这样讨论仍围绕真实任务，语言接触发生在过程中。它与专用英语机器人不同：全局偏好可能影响这个账号下许多普通聊天，因此规则应当简短、稳定，并适合大多数任务。",
          "en": "English need not be limited to a practice session. Use it while discussing a concept, plan or everyday question, keeping the real task central. Unlike a dedicated English bot, global preferences can affect many ordinary conversations, so keep them concise and broadly useful."
        },
        {
          "zh": "先决定自己需要的是哪一种约束：只是希望更多读英语，选默认英语；希望连提问也被要求主要用英语，选严格门槛。两者目的不同，不要把两段互相冲突的规则一起粘贴。也可以只在一个专门的学习项目中应用严格版，日常账号保留较宽松的设置。",
          "en": "Choose the constraint you want. English by default increases English reading while allowing ordinary tasks. The strict gate also requires your questions to be mainly English. Choose one rather than pasting conflicting versions together. A dedicated learning project can hold the strict version while ordinary chats stay more flexible."
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
          "zh": "ChatGPT 可以在设置的个性化／自定义指令中保存长期偏好；Claude 可以在账号的 Instructions 设置中保存，部分界面称个人偏好。名称和位置可能变化，认准账号级指令的作用范围即可。如果只希望某个学习项目生效，就用该项目的指令；只想本次试用，就把规则发在普通新对话里。",
          "en": "Use ChatGPT’s personalisation or Custom Instructions settings, or Claude’s account-level Instructions, called preferences in some interfaces. Names can change; identify the account-wide scope. Use project instructions for a learning project only, or a fresh conversation to try the rule once."
        },
        {
          "zh": "这些设置不等于你获得了平台内部的最高系统权限。专用助手、项目和语音模式也不一定继承账号所有规则；例如自定义 GPT 不使用账号自定义指令。设置后请在你真正要用的聊天环境里试一次，而不是只看保存成功。不要把私人聊天记录塞进全局指令，稳定偏好和具体材料要分开。",
          "en": "These preferences do not grant platform-level system authority. Assistants, projects and voice modes need not inherit all account rules; custom GPTs do not use account Custom Instructions. Test the actual environment after saving. Keep stable preferences separate from private transcripts and task material."
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
          "zh": "这个版本适合希望增加英语接触，但不想每次提问都被拦下的人。中文问题也主要收到英语回答；表达影响理解时才补一个简短建议。明确要求中文解释或中文写作时，仍能完成该任务。复制后可以先问一个普通工作问题，检查它是否回答了内容，而不是突然开始完整英语课。",
          "en": "Use this to increase English exposure without blocking questions. Chinese questions receive mainly English answers, with a brief improvement when wording affects meaning. Explicit Chinese explanations and writing tasks remain possible. Test an ordinary question and check that it answers the task rather than launching a language lesson."
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
          "zh": "这个版本会检查提问是否主要用英语。中文过多时，它用英语调侃或批评，拒绝回答原问题，并要求你改写。适合你主动希望增加英文输出约束的使用场景；它与“只让 AI 用英语回答”不是同一件事。下面这段可整段复制，替换默认英语版。",
          "en": "This version checks whether the question is mainly English. With too much Chinese, it teases or scolds in English, declines the question and requests a rewrite. It adds an output constraint you actively choose, rather than only changing the AI’s reply language. Copy it as a replacement for the default version."
        },
        {
          "zh": "“约 70%”是自然语言提示，不是精确的字符或词数校验器。短句、代码、专有名词和中英混合表达可能被判断得不一致。先用你常问的几个问题试用；如果拦截妨碍了真实任务，可以改用默认版，或把严格版限制在学习专用对话中。",
          "en": "The approximate 70% threshold is an instruction rather than an exact word-count validator. Short messages, code, names and mixed-language input may be classified inconsistently. Try representative questions; use the default version or confine the gate to a practice chat if it interrupts important tasks."
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
          "zh": "先试三种输入：普通英文问题、一句夹着不认识词的英文问题、一个主要中文的问题。默认版应继续回答，严格版应只在第三种情况要求重写。再试需要中文产物的任务，确认当前规则是否符合你的预期。若严格规则优先拦截中文写作请求，那是它的使用成本，不需要另加一串互相矛盾的补丁来掩盖。",
          "en": "Try an English question, an English question with one Chinese clarification and a mainly Chinese question. The default version continues answering; the strict gate should request rewriting in the third case. Also test a task requiring Chinese output. Notice whether the chosen constraint fits instead of accumulating contradictory exceptions."
        },
        {
          "zh": "需要降低难度，可以把提示改成先给一个英文开头，再请你补完；需要更纯粹的英语环境，可以明确要求即使用中文提问也只用英语解释。一次改变一个行为，再看几轮交流。英语偏好可以带来更多接触，但进步还需要自己理解、回应和复用表达；不能只把开关打开，就当作完成了口语练习。",
          "en": "To reduce difficulty, ask for an English opening you can finish. For an English-only environment, explicitly request English explanations even after Chinese questions. Change one behaviour and observe several turns. Settings can increase exposure, but understanding, responding and reusing language still require your participation."
        }
      ]
    }
  ]
}
];
