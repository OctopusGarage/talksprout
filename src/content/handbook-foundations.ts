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
    "zh": "把理解、表达、语言研究和熟练使用搭配起来。",
    "en": "Combine understanding, expression, language study and fluency."
  },
  "tags": [
    {
      "zh": "学习框架 输入 输出 流利度 计划",
      "en": "learning framework input output fluency planning"
    }
  ],
  "sections": [
    {
      "id": "input",
      "title": {
        "zh": "听读：理解内容",
        "en": "Input: understand a message"
      },
      "paragraphs": [
        {
          "zh": "选择能跟住大意、又愿意继续看的材料。先理解内容，遇到关键障碍再查，不必逐句分析。",
          "en": "Choose material you can broadly follow and want to continue. Follow the message, checking only what blocks understanding."
        }
      ]
    },
    {
      "id": "output",
      "title": {
        "zh": "说写：表达自己的意思",
        "en": "Output: express your meaning"
      },
      "paragraphs": [
        {
          "zh": "先自己说几句或写一小段，再看示范和反馈。说明对象与目的，会让练习更接近真实交流。",
          "en": "Speak or write before seeing a model. Define the audience and purpose to make the task useful."
        }
      ]
    },
    {
      "id": "study",
      "title": {
        "zh": "研究：解决具体问题",
        "en": "Study: investigate a difficulty"
      },
      "paragraphs": [
        {
          "zh": "从实际遇到的问题里选一个词、搭配或句式，查清用法，再为自己的情况造句。",
          "en": "Choose a word, collocation or structure from an actual difficulty. Check its use and make an example of your own."
        }
      ]
    },
    {
      "id": "fluency",
      "title": {
        "zh": "熟练：减少对脚本的依赖",
        "en": "Fluency: rely less on a script"
      },
      "paragraphs": [
        {
          "zh": "用熟悉内容练得更顺：重听、复述或重写。先看关键词，再离开提示，最后换相近情境。可以选一次复述或限时说明作为针对性任务，计时只是可选辅助。",
          "en": "Use familiar material for smoother listening, retelling or writing. Move from keywords to no script, then try a related situation. A retelling or timed explanation can be a focused task; timing is optional."
        }
      ]
    },
    {
      "id": "worked-example",
      "title": {
        "zh": "例子：说明项目延期",
        "en": "Example: explain a delay"
      },
      "paragraphs": [
        {
          "zh": "先读一则项目更新，自己说明延期原因，核对一个重要表达，再不看稿讲一次。一次任务就能串起四条主线。",
          "en": "Read a project update, explain a delay yourself, check one useful expression and repeat without a script. One task can connect all four strands."
        }
      ],
      "example": "The integration is taking longer than expected.\nWe ran into an authentication issue.\nI expect to have an update tomorrow."
    },
    {
      "id": "planning",
      "title": {
        "zh": "按一周整体安排",
        "en": "Plan across the week"
      },
      "paragraphs": [
        {
          "zh": "不必每次平均分成四份。回顾一周是否有听读、说写、查明疑问和熟悉内容的练习，补上长期缺少的一项。",
          "en": "You do not need equal parts in every session. Look across the week for input, output, focused study and familiar practice, and add what is missing."
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
    "zh": "按目标挑一小份材料，试读后再决定怎么用。",
    "en": "Choose a short source for your goal and try it before committing."
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
        "zh": "先定用途",
        "en": "Choose the purpose"
      },
      "paragraphs": [
        {
          "zh": "想持续阅读，就找能跟住、愿意继续的内容；想解决听力难点，就用带文本的短录音；想写邮件，就看相关沟通样例。",
          "en": "For ongoing reading, choose accessible, interesting content. For a listening difficulty, use a short recording with a transcript. For email, use relevant examples."
        }
      ]
    },
    {
      "id": "trial",
      "title": {
        "zh": "先试一小段",
        "en": "Try a short section"
      },
      "paragraphs": [
        {
          "zh": "不查词先读或听一小段，再概括大意。几乎每句都需要解释时，先缩短或降难度；背景、语速和信息密度也会影响难度。",
          "en": "Read or listen briefly without a dictionary, then summarise. Shorten or simplify material when nearly every sentence needs help. Background knowledge, pace and density also affect difficulty."
        }
      ]
    },
    {
      "id": "intensive",
      "title": {
        "zh": "泛读看内容，精读解难点",
        "en": "Follow the message or inspect a difficulty"
      },
      "paragraphs": [
        {
          "zh": "泛读泛听允许略过次要细节。需要精读精听时，只选一个关键问题，核对后回到原文或原声。",
          "en": "In extensive reading or listening, allow missed details. For close work, choose one important difficulty, check it and return to the source."
        }
      ]
    },
    {
      "id": "dictionary",
      "title": {
        "zh": "查原句中的用法",
        "en": "Check usage in context"
      },
      "paragraphs": [
        {
          "zh": "先确认词义和词性，再看搭配、结构与例句。换成自己的情况造句；查读音时听可靠词典的音频。",
          "en": "Identify the meaning and part of speech, then inspect collocations, structure and examples. Make your own sentence and use reliable dictionary audio for pronunciation."
        }
      ]
    },
    {
      "id": "support",
      "title": {
        "zh": "借助解释，再减少帮助",
        "en": "Use support, then reduce it"
      },
      "paragraphs": [
        {
          "zh": "字幕、翻译和 AI 可以帮助理解。追内容时可保留字幕；检查听音辨词时，先听再用字幕核对。看懂后关掉部分提示，再自己听、概括或表达；重要信息回原文核对。",
          "en": "Use captions, translation or AI when helpful. Keep captions to follow content, or listen first and check captions when testing word recognition. Then remove some support and listen, summarise or respond yourself. Check important information against the source."
        }
      ]
    },
    {
      "id": "complete-session",
      "title": {
        "zh": "完成一次小循环",
        "en": "Complete a small cycle"
      },
      "paragraphs": [
        {
          "zh": "选一段内容，理解大意，查一个关键表达，再离开原文说几句。手写或键盘记录都可以，关键是离开原文主动回忆，不是抄写方式更优。常用材料留一份即可，不必不断增加收藏。",
          "en": "Understand a short source, check one expression and speak without looking. Handwriting and typing can both work: recalling without the source matters more than the recording method. Keep a main source you can return to rather than collecting endlessly."
        }
      ]
    }
  ]
}
];
