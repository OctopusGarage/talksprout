import type { HandbookArticle } from "./guide-types";
import { guideTitles } from "./guide-titles";
import { practiceLinks } from "./guide-practice";

export const workflowGuide: HandbookArticle = {
  "id": "complete-workflow",
  "title": guideTitles["complete-workflow"],
  "shelf": "practice",
  "group": "prepare",
  "topic": "ai",
  "summary": {
    "zh": "选择练习、开始对话、结束复习，再保存有用的内容。",
    "en": "Choose a practice, start a conversation, review it and keep what helps."
  },
  "tags": [
    {
      "zh": "入门 全流程 Skill 插件 MCP 语音 笔记",
      "en": "getting started workflow Skill plugin MCP voice notes"
    }
  ],
  "sections": [
    {
      "id": "manual",
      "title": {
        "zh": "复制提示词开始",
        "en": "Start by copying a prompt"
      },
      "paragraphs": [
        {
          "zh": "在「开始练习」选择教练，按需选场景，再把完整提示词发到自己的 AI。想专练表达，可选句型变式或情境回忆；想写消息，可到「听读写 → 写作」选择文字聊天伙伴。",
          "en": "Choose a coach under Start practice, add an optional scenario and send the full prompt to your AI. Choose pattern variation or expression recall for targeted practice, or find Text Chat Partner under Learning → Writing."
        }
      ]
    },
    {
      "id": "setup",
      "title": {
        "zh": "直接在 AI 中选择",
        "en": "Choose directly in your AI"
      },
      "paragraphs": [
        {
          "zh": "也可在「设置 → 在 AI 中使用」接入 Skill、插件或 MCP。接入后发送「用 TalkSprout 开始练习」，或在支持的平台输入 $talksprout，再按提示选择。",
          "en": "Alternatively, set up a Skill, plugin or MCP from Settings → Use in your AI. Ask “Use TalkSprout; help me choose first,” or invoke $talksprout on supported hosts, then choose an option."
        }
      ],
      "example": "Use TalkSprout. Help me choose a practice mode and topic."
    },
    {
      "id": "voice",
      "title": {
        "zh": "开启语音",
        "en": "Turn on voice"
      },
      "paragraphs": [
        {
          "zh": "想练口语，使用所选 AI 自带的语音按钮。先发送练习指令；若语音不沿用文字对话，可使用简短语音开场白。",
          "en": "For speaking practice, use your AI’s voice button. Send the instructions first; if voice uses a separate context, use the short spoken opening."
        }
      ]
    },
    {
      "id": "practice",
      "title": {
        "zh": "按自己的节奏练",
        "en": "Practise at your own pace"
      },
      "paragraphs": [
        {
          "zh": "卡住可要提示、请求慢一点或换话题。想平等交流，选择「朋友闲聊」或「观点交流」；想集中纠错，选择相应教练。",
          "en": "Ask for a hint, a slower pace or a new topic. Choose Friendly Free Chat or Exchange Views for reciprocal discussion, or a correction coach for focused feedback."
        }
      ]
    },
    {
      "id": "review",
      "title": {
        "zh": "结束后选一种复习",
        "en": "Choose a review when you finish"
      },
      "paragraphs": [
        {
          "zh": "说「结束练习」，再选择学习笔记、句子纠错、词汇短语或复习卡片。复制使用时，从「结束与复习」取提示词，发回同一段 AI 对话；已接入时直接提出需求。",
          "en": "Finish practice, then choose study notes, corrections, vocabulary or review cards. For manual use, send a Wrap-up & Review prompt into the same chat; with an integration, request the review directly."
        }
      ],
      "example": "Finish practice. Create study notes from this conversation."
    },
    {
      "id": "save",
      "title": {
        "zh": "保存需要的内容",
        "en": "Save what you need"
      },
      "paragraphs": [
        {
          "zh": "检查生成的资料，再请 AI 保存到你指定的位置。没有保存功能时，复制或下载后自行保存。",
          "en": "Check the material, then ask your AI to save it to your chosen location. If saving is unavailable, copy or download it yourself."
        }
      ]
    },
    {
      "id": "return",
      "title": {
        "zh": "下次接着练",
        "en": "Pick it up next time"
      },
      "paragraphs": [
        {
          "zh": "带上笔记或几个想复习的表达，选择「情境回忆练习」先试着用出来。新对话中提供这些内容；只想继续聊天也可以。",
          "en": "Bring notes or a few expressions to Expression Recall and try using them. Supply them in a new chat, or simply continue the conversation if you prefer."
        }
      ]
    }
  ],
  "practice": practiceLinks(["friend-chat", "gentle-start", "complete-study-notes", "review-cards", "expression-recall", "writing-text-chat"])
};
