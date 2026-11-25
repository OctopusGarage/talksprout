# 全局指令：让日常 AI 使用也成为英语接触

把英语偏好放进日常 AI 设置。提供默认英语与严格英语门槛两种完整指令，分别复制，按需要选择。

## 把英语接触放进本来就在做的事情

不一定每次都要进入“英语练习”才使用英语。查一个概念、讨论方案、整理计划和问生活问题时，也可以让 AI 主要用英语回答。这样讨论仍围绕真实任务，语言接触发生在过程中。它与专用英语机器人不同：全局偏好可能影响这个账号下许多普通聊天，因此规则应当简短、稳定，并适合大多数任务。

先决定自己需要的是哪一种约束：只是希望更多读英语，选默认英语；希望连提问也被要求主要用英语，选严格门槛。两者目的不同，不要把两段互相冲突的规则一起粘贴。也可以只在一个专门的学习项目中应用严格版，日常账号保留较宽松的设置。







## ChatGPT 与 Claude 中放在哪里

ChatGPT 可以在设置的个性化／自定义指令中保存长期偏好；Claude 可以在账号的 Instructions 设置中保存，部分界面称个人偏好。名称和位置可能变化，认准账号级指令的作用范围即可。如果只希望某个学习项目生效，就用该项目的指令；只想本次试用，就把规则发在普通新对话里。

这些设置不等于你获得了平台内部的最高系统权限。专用助手、项目和语音模式也不一定继承账号所有规则；例如自定义 GPT 不使用账号自定义指令。设置后请在你真正要用的聊天环境里试一次，而不是只看保存成功。不要把私人聊天记录塞进全局指令，稳定偏好和具体材料要分开。







## 默认英语版：先完成任务，再提供少量语言帮助

这个版本适合希望增加英语接触，但不想每次提问都被拦下的人。中文问题也主要收到英语回答；表达影响理解时才补一个简短建议。明确要求中文解释或中文写作时，仍能完成该任务。复制后可以先问一个普通工作问题，检查它是否回答了内容，而不是突然开始完整英语课。





Reply in English by default, even when I write in Chinese.
Use clear, natural English and answer my actual question first.
If my wording makes my meaning unclear, suggest one concise improvement.
Do not turn every task into an English lesson.
Use Chinese for explanations only when I explicitly ask.
For a Chinese writing or translation task, produce the requested Chinese text.

## 严格门槛版：先用英语提问，再获得回答

这个版本会检查提问是否主要用英语。中文过多时，它用英语调侃或批评，拒绝回答原问题，并要求你改写。适合你主动希望增加英文输出约束的使用场景；它与“只让 AI 用英语回答”不是同一件事。下面这段可整段复制，替换默认英语版。

“约 70%”是自然语言提示，不是精确的字符或词数校验器。短句、代码、专有名词和中英混合表达可能被判断得不一致。先用你常问的几个问题试用；如果拦截妨碍了真实任务，可以改用默认版，或把严格版限制在学习专用对话中。





Always require the user to communicate primarily in English.

Rules:
1. The user's message must be mostly English (at least ~70% English words).
2. Small amounts of Chinese are allowed if they are only used to clarify a word or short phrase.
3. If the message contains too much Chinese and is not primarily English:
   - Mock or scold the user in English in a sarcastic or teasing way.
   - Refuse to answer the question.
   - Ask the user to rewrite the question in English.

Tone:
- Use humorous, sarcastic, slightly harsh English when enforcing the rule.
- Never switch to Chinese when scolding.
- Only answer normally when the user's message is primarily English.

## 怎样测试与调整，而不是保存后就不管

先试三种输入：普通英文问题、一句夹着不认识词的英文问题、一个主要中文的问题。默认版应继续回答，严格版应只在第三种情况要求重写。再试需要中文产物的任务，确认当前规则是否符合你的预期。若严格规则优先拦截中文写作请求，那是它的使用成本，不需要另加一串互相矛盾的补丁来掩盖。

需要降低难度，可以把提示改成先给一个英文开头，再请你补完；需要更纯粹的英语环境，可以明确要求即使用中文提问也只用英语解释。一次改变一个行为，再看几轮交流。英语偏好可以带来更多接触，但进步还需要自己理解、回应和复用表达；不能只把开关打开，就当作完成了口语练习。






