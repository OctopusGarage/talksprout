import { useEffect, useRef, useState, type RefObject } from "react";
import {
  sceneCategories,
  sceneGroups,
  type Scene,
  type SceneCategory,
} from "./scenes";
import { categoryEmoji, groupEmoji, sceneIcon } from "./scene-icons";
import type { Locale } from "./types";

export function SceneBrowser({
  available,
  promptId,
  returnFocus,
  selected,
  locale,
  onSelect,
  onClose,
}: {
  available: Scene[];
  promptId: string;
  returnFocus: RefObject<HTMLButtonElement | null>;
  selected?: Scene;
  locale: Locale;
  onSelect: (scene?: Scene) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState<SceneCategory | undefined>(
    selected?.category,
  );
  const [group, setGroup] = useState<string | undefined>(selected?.group);
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const token = useRef(`scene-${Date.now()}-${Math.random()}`);
  const heading = useRef<HTMLHeadingElement>(null);
  const s = (zh: string, en: string) => (locale === "en" ? en : zh);
  useEffect(() => {
    const element = dialog.current!;
    const previous = returnFocus.current;
    if (
      history.state?.talksproutSceneCoach === promptId &&
      typeof history.state?.talksproutSceneBrowser === "string"
    ) {
      token.current = history.state.talksproutSceneBrowser;
    } else {
      history.pushState(
        {
          ...history.state,
          talksproutSceneBrowser: token.current,
          talksproutSceneCoach: promptId,
        },
        "",
        location.href,
      );
    }
    const pop = () => {
      if (history.state?.talksproutSceneBrowser !== token.current)
        closeRef.current();
    };
    window.addEventListener("popstate", pop);
    element.showModal();
    heading.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("popstate", pop);
      element.close();
      if (history.state?.talksproutSceneBrowser === token.current)
        history.back();
      requestAnimationFrame(() => {
        if (previous?.isConnected) previous.focus({ preventScroll: true });
      });
    };
  }, []);
  const changePage = (nextCategory?: SceneCategory, nextGroup?: string) => {
    setCategory(nextCategory);
    setGroup(nextGroup);
    setQuery("");
    dialog.current?.querySelector(".scene-browser-scroll")?.scrollTo(0, 0);
    heading.current?.focus({ preventScroll: true });
  };
  const search = query.trim().toLowerCase();
  const scenes = available.filter((scene) =>
    search
      ? `${scene.title.zh} ${scene.title.en} ${sceneGroups.find((g) => g.id === scene.group)?.title.zh} ${sceneGroups.find((g) => g.id === scene.group)?.title.en} ${scene.goal}`
          .toLowerCase()
          .includes(search)
      : scene.group === group,
  );
  const title = group
    ? sceneGroups.find((g) => g.id === group)!.title[locale]
    : category
      ? sceneCategories.find((c) => c.id === category)!.title[locale]
      : s("选择场景", "Choose a scenario");
  return (
    <dialog
      ref={dialog}
      className="scene-browser"
      aria-labelledby="scene-browser-title"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        if (!controls.length) return;
        // Explicit traversal also includes buttons when Safari's system setting
        // limits native Tab navigation to form fields.
        event.preventDefault();
        const current = controls.indexOf(document.activeElement as HTMLElement);
        const next =
          current < 0
            ? event.shiftKey
              ? controls.length - 1
              : 0
            : (current + (event.shiftKey ? -1 : 1) + controls.length) %
              controls.length;
        controls[next].focus();
      }}
      onCancel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header className="scene-browser-toolbar">
        <button
          type="button"
          className="scene-back"
          aria-label={s("返回", "Back")}
          onClick={() =>
            group ? changePage(category) : category ? changePage() : onClose()
          }
        >
          <span aria-hidden="true">‹</span>
        </button>
        <h2 id="scene-browser-title" ref={heading} tabIndex={-1}>
          {title}
        </h2>
        <button type="button" className="scene-done" onClick={onClose}>
          {s("完成", "Done")}
        </button>
      </header>
      <div className="scene-browser-search">
        <span aria-hidden="true">⌕</span>
        <input
          id="scene-search"
          type="search"
          aria-label={s("搜索全部可用场景", "Search all available scenarios")}
          placeholder={s("搜索场景", "Search scenarios")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="scene-browser-scroll">
        <div className="scene-list">
          <button
            type="button"
            className="scene-row scene-none"
            aria-label={s("不指定场景", "No preset")}
            onClick={() => onSelect(undefined)}
          >
            <span className="scene-emoji" aria-hidden="true">
              💬
            </span>
            <span className="scene-row-copy">
              <strong>{s("不指定场景", "No preset")}</strong>
              <small>
                {s("自由选择聊天内容", "Let the conversation find its topic")}
              </small>
            </span>
            {!selected && (
              <span className="scene-check" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        </div>
        <p className="scene-section-label">
          {search
            ? s("搜索结果", "Search results")
            : group
              ? s("选择一个场景", "Choose a preset")
              : category
                ? s("按主题浏览", "Browse topics")
                : s("场景分类", "Categories")}
        </p>
        <div className="scene-list">
          {!search &&
            !category &&
            sceneCategories
              .filter((c) => available.some((scene) => scene.category === c.id))
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="scene-row"
                  aria-label={c.title[locale]}
                  onClick={() => changePage(c.id)}
                >
                  <span className="scene-emoji" aria-hidden="true">
                    {categoryEmoji[c.id]}
                  </span>
                  <span className="scene-row-copy">
                    <strong>{c.title[locale]}</strong>
                    <small>
                      {
                        available.filter((scene) => scene.category === c.id)
                          .length
                      }
                      {s(" 个场景", " scenarios")}
                    </small>
                  </span>
                  <span className="scene-chevron" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
          {!search &&
            category &&
            !group &&
            sceneGroups
              .filter(
                (g) =>
                  g.category === category &&
                  available.some((scene) => scene.group === g.id),
              )
              .map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="scene-row"
                  aria-label={g.title[locale]}
                  onClick={() => changePage(category, g.id)}
                >
                  <span className="scene-emoji" aria-hidden="true">
                    {groupEmoji[g.id]}
                  </span>
                  <span className="scene-row-copy">
                    <strong>{g.title[locale]}</strong>
                  </span>
                  <span className="scene-chevron" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
          {(search || group) &&
            scenes.map((scene) => (
              <button
                key={scene.id}
                type="button"
                className="scene-row scene-option"
                aria-label={scene.title[locale]}
                aria-pressed={selected?.id === scene.id}
                onClick={() => onSelect(scene)}
              >
                <span className="scene-emoji" aria-hidden="true">
                  {sceneIcon(scene)}
                </span>
                <span className="scene-row-copy">
                  <strong>{scene.title[locale]}</strong>
                  {search && (
                    <small>
                      {
                        sceneCategories.find((c) => c.id === scene.category)!
                          .title[locale]
                      }
                    </small>
                  )}
                </span>
                {selected?.id === scene.id && (
                  <span className="scene-check" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))}
        </div>
        {search && !scenes.length && (
          <p className="scene-empty" role="status">
            {s(
              "没有找到场景，换个词试试",
              "No scenarios found. Try another word.",
            )}
          </p>
        )}
      </div>
    </dialog>
  );
}
