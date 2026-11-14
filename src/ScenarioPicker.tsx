import { useEffect, useRef, useState } from "react";
import { compatibleScenes, type SceneSelection } from "./scenes";
import { prompts } from "./prompts";
import { SceneBrowser } from "./SceneBrowser";
import { sceneIcon } from "./scene-icons";
import type { Locale, Prompt } from "./types";

export function ScenarioPicker({
  prompt,
  locale,
  selection,
  onChange,
}: {
  prompt: Prompt;
  locale: Locale;
  selection?: SceneSelection;
  onChange: (next?: SceneSelection) => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [browsing, setBrowsing] = useState(
    () =>
      history.state?.talksproutSceneCoach === prompt.id &&
      typeof history.state?.talksproutSceneBrowser === "string",
  );
  useEffect(() => {
    const restore = () =>
      setBrowsing(
        history.state?.talksproutSceneCoach === prompt.id &&
          typeof history.state?.talksproutSceneBrowser === "string",
      );
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [prompt.id]);
  const available = compatibleScenes(prompt);
  const selected = available.find((scene) => scene.id === selection?.sceneId);
  if (!available.length) return null;
  const en = locale === "en";
  const s = (zh: string, english: string) => (en ? english : zh);
  const selectedLabel = selected?.title[locale] ?? s("不指定场景", "No preset");
  return (
    <section
      className="scenario-picker"
      aria-label={s("练习场景", "Practice scenario")}
    >
      <button
        type="button"
        className="scene-trigger"
        ref={trigger}
        aria-label={`${s("练习场景", "Practice scenario")}：${selectedLabel}`}
        aria-haspopup="dialog"
        aria-expanded={browsing}
        onClick={() => setBrowsing(true)}
      >
        <span className="scene-emoji" aria-hidden="true">
          {selected ? sceneIcon(selected) : "💬"}
        </span>
        <span className="scene-row-copy">
          <small>{s("练习场景", "Practice scenario")}</small>
          <strong>{selectedLabel}</strong>
        </span>
        <span className="scene-chevron" aria-hidden="true">
          ›
        </span>
      </button>
      {selected && selection && (
        <details className="scene-settings" key={selected.id}>
          <summary>{s("场景设置", "Scenario settings")}</summary>
          <div className="scene-settings-body">
            <p lang="en">{selected.context}</p>
            <p lang="en">{selected.goal}</p>
            <p className="fineprint">
              {s("模拟练习 · 推荐：", "Hypothetical practice · Recommended: ")}
              {selected.recommendedCoachIds
                .map((id) => {
                  const coach = prompts.find((p) => p.id === id)!;
                  return en ? coach.english : coach.title;
                })
                .join(" · ")}
              {selected.handbookUnit &&
                ` · ${s("手册单元", "Handbook unit")} ${selected.handbookUnit}`}
            </p>
            <label htmlFor="scene-background">
              {s("补充背景（可选）", "Additional background (optional)")}
            </label>
            <textarea
              id="scene-background"
              rows={3}
              maxLength={2000}
              value={selection.background}
              onChange={(e) =>
                onChange({ ...selection, background: e.target.value })
              }
              placeholder={s(
                "例如：我主要写 Go，想练习解释并发。",
                "For example: I use Go and want to explain concurrency.",
              )}
            />
            <p className="fineprint">
              {s(
                "仅加入完整提示词，不在本机保存。语音版保留主题，详细背景可在对话中补充。",
                "Included only in the full prompt; not saved locally. Add details during the spoken conversation.",
              )}
            </p>
            {selected.category === "interview" &&
              prompt.id === "roleplay-coach" && (
                <fieldset className="scene-pace">
                  <legend>{s("面试节奏", "Interview pace")}</legend>
                  <div>
                    <button
                      type="button"
                      aria-pressed={selection.pace === "coached"}
                      onClick={() =>
                        onChange({ ...selection, pace: "coached" })
                      }
                    >
                      {s("逐题辅导", "Coached")}
                    </button>
                    <button
                      type="button"
                      aria-pressed={selection.pace === "mock"}
                      onClick={() => onChange({ ...selection, pace: "mock" })}
                    >
                      {s("模拟面试", "Mock interview")}
                    </button>
                  </div>
                  <p className="fineprint" role="status">
                    {selection.pace === "mock"
                      ? s(
                          "先连续问答，复盘或结束时再反馈。",
                          "Feedback waits until review or finish.",
                        )
                      : s(
                          "每次回答后，获得简短反馈。",
                          "Receive brief feedback after each answer.",
                        )}
                  </p>
                </fieldset>
              )}
            {selected.category === "interview" &&
              prompt.id !== "roleplay-coach" && (
                <p className="fineprint">
                  {s(
                    "当前按所选教练辅导。连续模拟面试请使用情境扮演教练。",
                    "Use Role-play Coach for an uninterrupted mock interview.",
                  )}
                </p>
              )}
          </div>
        </details>
      )}
      {browsing && (
        <SceneBrowser
          available={available}
          promptId={prompt.id}
          returnFocus={trigger}
          selected={selected}
          locale={locale}
          onClose={() => setBrowsing(false)}
          onSelect={(scene) => {
            onChange(
              scene
                ? { sceneId: scene.id, background: "", pace: "coached" }
                : undefined,
            );
            setBrowsing(false);
          }}
        />
      )}
    </section>
  );
}
