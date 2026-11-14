import { useLayoutEffect, useRef, useState } from "react";
import { focusHomeAction } from "./home-focus";
import { navigate } from "./navigation";
import type { Locale } from "./types";

export function FirstPracticeGuide({ locale }: { locale: Locale }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem("talksprout:guide-dismissed") === "yes"; } catch { return false; }
  });
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (dismissed && restoreFocus.current) {
      restoreFocus.current = false;
      if (document.activeElement === document.body) focusHomeAction();
    }
  }, [dismissed]);
  if (dismissed) return null;
  const en = locale === "en";
  const start = (id: string) => navigate(`#library?prompt=${id}`, { talksproutPrompt: id });
  return <section className="first-practice" aria-label={en ? "First practice suggestions" : "第一次练习建议"}>
    <div className="first-practice-heading"><strong>{en ? "Not sure where to start?" : "第一次用，不知道选哪个？"}</strong>
      <button onClick={(event) => { restoreFocus.current = document.activeElement === event.currentTarget; setDismissed(true); try { localStorage.setItem("talksprout:guide-dismissed", "yes"); } catch {} }}>{en ? "Dismiss" : "收起指引"}</button>
    </div>
    <p>{en ? "Start with natural conversation. Choose gentle coaching for short beginner answers, or role-play for a specific situation." : "先试自然对话；刚开始开口可以选温柔引导，有具体任务就用情境扮演。"}</p>
    <div className="first-practice-actions">
      <button onClick={() => start("daily-check-in")}>{en ? "Start a conversation" : "试试自然对话"}</button>
      <button onClick={() => start("gentle-start")}>{en ? "Gentle start" : "温柔起步"}</button>
      <button onClick={() => start("roleplay-coach")}>{en ? "Practice a situation" : "练一个情境"}</button>
    </div>
    <small>{en ? "Everyday, travel and service scenarios are available alongside dedicated tech workplace and software interview topics." : "日常、旅行和办事都能练，也有专门的科技职场与程序员面试场景。"}</small>
  </section>;
}
