import "./quick-access.css";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { allPrompts as sourcePrompts } from "./prompts";
import type { Prompt, PromptVariant, ReviewSource } from "./types";
import { FirstPracticeGuide } from "./FirstPracticeGuide";
import { SavedPracticeList, RecentList } from "./QuickAccess";
import { useSavedPrompts } from "./useSavedPrompts";
import { usePromptClipboard } from "./usePromptClipboard";
import { practiceHref, shortcutKey, type PracticeShortcut, type RecentPrompt } from "./shortcuts";
import { readSaved, writeSaved } from "./library";
import { useNavigation, navigate } from "./navigation";
import { useAppFrame } from "./useAppFrame";
import { useRightEdgeBack } from "./useRightEdgeBack";
import { collections } from "./content/collections";
import { Icon } from "./Icon";
import { Settings } from "./Settings";
import { LearningLibrary } from "./LearningLibrary";
import { PromptLibrary } from "./PromptLibrary";
import { composeScene, type SceneSelection } from "./scenes";
import { promptText } from "./prompt-text";
import { useAppUpdate } from "./useAppUpdate";
import { UpdateBanner } from "./UpdateBanner";
import { PromptDialog } from "./PromptDialog";
import { dictionary, initialLocale, type Locale } from "./i18n";
const prompts: Prompt[] = sourcePrompts;
const currentPromptIDs = new Set(prompts.map((p) => p.id));
let storage: Storage | null = null;
try {
  storage = window.localStorage;
} catch {}
export default function App() {
  const route = useNavigation();
  const appUpdate = useAppUpdate();
  const { copying, writer } = usePromptClipboard();
  const savedPrompts = useSavedPrompts(storage);
  const [sceneSelection, setSceneSelection] = useState<SceneSelection>();
  const frame = useAppFrame(route.base);
  const lastPractice = useRef("#library");
  if (route.page === "practice") lastPractice.current = route.base;
  const [locale, setLocale] = useState<Locale>(initialLocale),
    [favorites, setFavorites] = useState<string[]>(() =>
      readSaved(storage, "talksprout:favorites").filter((id) =>
        currentPromptIDs.has(id),
      ),
    );
  const [modal, setModal] = useState<{
      prompt: Prompt | null;
      content: ReactNode;
    } | null>(null),
    [variant, setVariant] = useState<PromptVariant>("full"),
    [reviewSource, setReviewSource] = useState<ReviewSource>("current"),
    [message, setMessage] = useState(""),
    [manual, setManual] = useState(false),
    [copied, setCopied] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [installed, setInstalled] = useState(
      () =>
        matchMedia("(display-mode: standalone)").matches ||
        !!(navigator as Navigator & { standalone?: boolean }).standalone,
    );
  const install = useRef<(Event & { prompt: () => Promise<void> }) | null>(
    null,
  );
  const manualHydration = useRef<string | null>(null);
  const active = useRef(modal);
  active.current = modal;
  const t = dictionary[locale],
    en = locale === "en",
    s = (zh: string, english: string) => (en ? english : zh);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "en"
        ? "TalkSprout · Start speaking English"
        : "TalkSprout 开口芽 · 和 AI 开口练英语";
    try {
      localStorage.setItem("talksprout:locale", locale);
    } catch {}
  }, [locale]);
  useEffect(() => {
    const connection = () => setOnline(navigator.onLine);
    const before = (e: Event) => {
      e.preventDefault();
      install.current = e as typeof install.current;
    };
    window.addEventListener("online", connection);
    window.addEventListener("offline", connection);
    window.addEventListener("beforeinstallprompt", before);
    return () => {
      window.removeEventListener("online", connection);
      window.removeEventListener("offline", connection);
      window.removeEventListener("beforeinstallprompt", before);
    };
  }, []);
  useEffect(() => {
    if (appUpdate.cacheUnavailable)
      setMessage(en ? "Offline cache unavailable." : "离线缓存暂不可用。");
  }, [appUpdate.cacheUnavailable, en]);
  useLayoutEffect(() => {
    writer.invalidate();
    setCopied(false);
    const preserveManual = manualHydration.current === location.hash;
    manualHydration.current = null;
    if (route.promptId) {
      const prompt = prompts.find((p) => p.id === route.promptId);
      if (prompt && !preserveManual) {
        setSceneSelection(route.sceneSelection);
        setVariant(route.format ?? "full");
        setReviewSource(route.reviewSource ?? "current");
        setManual(false);
        setMessage("");
        setModal({ prompt, content: null });
      }
    } else if (route.infoId) {
      info(route.infoId);
    } else if (active.current) {
      setModal(null);
      setMessage("");
      setManual(false);
    }
  }, [route.promptId, route.infoId, route.base, route.sceneSelection?.sceneId, route.sceneSelection?.pace, route.format, route.reviewSource]);
  const previousBase = useRef(route.base);
  useEffect(() => {
    const previous = previousBase.current;
    previousBase.current = route.base;
    if (route.promptId || route.learningPromptId || route.infoId) return;
    const focusedAtNavigation = document.activeElement;
    const frame = requestAnimationFrame(() => {
      if (document.querySelector("dialog[open]")) return;
      // Do not override focus the user moved after navigation but before this frame.
      const focused = document.activeElement;
      if (focused !== focusedAtNavigation && focused !== document.body && focused?.isConnected) return;
      const opener = previous.startsWith("#collection/") && route.base === "#library"
        ? document.querySelector<HTMLElement>(`[data-collection="${previous.slice("#collection/".length)}"]`)
        : null;
      (opener ?? document.getElementById("library-heading"))?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [route.base]);
  useEffect(() => {
    if (!message || modal) return;
    const timer = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [message, modal]);
  useEffect(() => {
    const complete = () => setInstalled(true);
    window.addEventListener("appinstalled", complete);
    return () => window.removeEventListener("appinstalled", complete);
  }, []);
  const openPrompt = (p: Prompt, format: PromptVariant = "full", source: ReviewSource = "current", scene?: SceneSelection, preserveManual = false) => {
    const samePurpose = (p.kind === "review") === (route.page === "review");
    const base =
      samePurpose && route.page !== "settings"
        ? route.base
        : p.kind === "review"
          ? "#review"
          : "#library";
    const params = new URLSearchParams({ prompt: p.id });
    if (format === "spoken") params.set("format", "spoken");
    if (p.kind === "review" && source === "transcript") params.set("source", "transcript");
    if (p.kind !== "review" && scene) {
      params.set("scene", scene.sceneId);
      if (scene.pace === "mock") params.set("pace", "mock");
    }
    const href = `${base}?${params}`;
    if (preserveManual && location.hash !== href) manualHydration.current = href;
    navigate(href, { talksproutPrompt: p.id });
  };
  const resetCopyFeedback = () => {
    writer.invalidate();
    setCopied(false);
    setManual(false);
    setMessage("");
  };
  const changeLocale = (next: Locale) => {
    resetCopyFeedback();
    setLocale(next);
  };
  const closeModal = () => {
    resetCopyFeedback();
    setModal(null);
    setMessage("");
    setManual(false);
    if (route.promptId) {
      if (history.state?.talksproutPrompt === route.promptId) history.back();
      else navigate(route.base);
    } else if (route.infoId) {
      if (history.state?.talksproutInfo === route.infoId) history.back();
      else navigate(route.base);
    }
  };
  useRightEdgeBack(
    modal
      ? () => {
          if (
            history.state?.talksproutSceneBrowser &&
            history.state?.talksproutSceneCoach === route.promptId
          )
            history.back();
          else closeModal();
        }
      : route.learningPromptId
        ? () => {
            if (history.state?.talksproutLearningPrompt === route.learningPromptId)
              history.back();
            else navigate("#learning");
          }
        : route.page === "learning"
          ? () => navigate("#library")
          : route.collection
            ? () => navigate("#library")
            : null,
    `${route.base}:${route.promptId ?? route.learningPromptId ?? ""}:${route.infoId ?? ""}`,
  );
  const save = (key: string, value: string[]) => {
    if (!writeSaved(storage, key, value)) setMessage(t.saveError);
  };
  const detail = (p: Prompt) => {
    resetCopyFeedback();
    setSceneSelection(undefined);
    setVariant("full");
    setReviewSource("current");
    setMessage("");
    setManual(false);
    setModal({ prompt: p, content: null });
    openPrompt(p);
  };
  const shortcut = (p: Prompt, format: PromptVariant, scene?: SceneSelection): PracticeShortcut => ({
    promptId: p.id, variant: format, ...(scene ? { sceneId: scene.sceneId } : {}), pace: scene?.pace ?? "coached",
  });
  const copy = async (
    p: Prompt, format: PromptVariant = "full", source: ReviewSource = "current", scene?: SceneSelection,
  ) => {
    if (copying) return;
    setCopied(false);
    setManual(false);
    setMessage("");
    let persisted = true;
    await writer.write({
      text: promptText(composeScene(p, scene), format, source, locale),
      onDelivered: () => {
        const entry: RecentPrompt = p.kind === "review"
          ? { kind: "review", promptId: p.id, variant: format, source }
          : { kind: "practice", ...shortcut(p, format, scene) };
        persisted = savedPrompts.record(entry);
      },
      onSuccess: () => {
        const success = p.kind === "review"
          ? s("已复制！发送到 AI 聊天，整理复习材料。", "Copied! Send in your AI chat to create review material.")
          : t.copied;
        setCopied(true);
        setMessage(persisted ? success : `${success} ${t.saveError}`);
      },
      onFailure: () => {
        setModal({ prompt: p, content: null });
        setVariant(format);
        setReviewSource(source);
        setSceneSelection(scene);
        setManual(true);
        setMessage(t.manual);
        openPrompt(p, format, source, scene, true);
      },
    });
  };
  const info = (kind: "install" | "about") => {
    resetCopyFeedback();
    setMessage("");
    setModal({
      prompt: null,
      content: (
        <>
          <h2 id="dialog-title">
            {kind === "install"
              ? s("把开口芽放进口袋", "Take TalkSprout with you")
              : s("使用说明", "About TalkSprout")}
          </h2>
          {kind === "install" ? (
            <>
              <p>
                {s(
                  "iPhone 和 iPad：在 Safari 点“分享”，选择“添加到主屏幕”。",
                  "iPhone and iPad: in Safari, choose Share → Add to Home Screen.",
                )}
              </p>
              <p>
                {s(
                  "Android：浏览器菜单选择“安装应用”或“添加到主屏幕”。桌面：点击地址栏安装图标。",
                  "Android: choose Install app or Add to Home Screen in the browser menu. Desktop: use the install icon in the address bar.",
                )}
              </p>
              <p>
                {s(
                  "首次完整加载后可离线浏览缓存内容。外部 AI 需要网络。",
                  "After a full online visit, cached content works offline. External AI requires internet access.",
                )}
              </p>
            </>
          ) : (
            <>
              <p>
                {s(
                  "选择练习 → 复制提示词 → 粘贴到外部 AI → 选择语音或文字练习。",
                  "Choose practice → copy the prompt → paste into an external AI → practice by voice or text.",
                )}
              </p>
              <p>
                {s(
                  "开始练习用于对话开头；结束与复习用于原来的对话结束后，整理笔记、句子、词汇或自测卡片。两类各有简短语音版本。",
                  "Start practice sets up a new conversation. Wrap-up & Review turns an existing chat into notes, sentences, vocabulary, or self-study cards. Both offer short spoken versions.",
                )}
              </p>
              <p>{s(
                "听读写辅助有独立收藏。常用组合保存教练、场景与练习方式；分享链接和最近复制都不包含补充背景。讲解语言跟随界面选择。",
                "Learning helpers have separate favorites. Saved combinations keep the coach, scenario and format. Links and recent copies exclude extra background. Explanation language follows the interface.",
              )}</p>
              <p>
                {s(
                  "无账号、无分析追踪。收藏、最近复制和语言保存在本机，清除浏览器数据会移除记录。本站不保存 AI 聊天。",
                  "No accounts or analytics. Favorites, recent copies and language are stored locally; clearing browser data removes them. AI conversations are not stored here.",
                )}
              </p>
              <p>
                {s(
                  "等级与时长为练习建议。",
                  "Levels and durations are practice suggestions.",
                )}
              </p>
            </>
          )}
        </>
      ),
    });
    navigate(`${route.base}?info=${kind}`, { talksproutInfo: kind });
  };
  const currentCollection = collections.find((c) => c.id === route.collection);
  const title =
    route.page === "learning"
      ? s("听读写辅助", "Listening, reading & writing")
      : route.page === "settings"
        ? s("设置", "Settings")
        : route.page === "review"
          ? s("结束与复习", "Wrap-up & Review")
          : currentCollection
            ? en
              ? currentCollection.titleEn
              : currentCollection.category
            : s("开始练习", "Start practice");
  return (
    <div className={`app-shell${frame.keyboardOpen ? " keyboard-open" : ""}`}>
      <a
        className="skip"
        href="#library"
        onClick={(event) => {
          event.preventDefault();
          document
            .getElementById("library-heading")
            ?.focus({ preventScroll: true });
        }}
      >
        {s("跳到内容", "Skip to content")}
      </a>
      <aside className="app-sidebar">
        <a
          className="brand"
          href="#library"
          onClick={(event) => {
            event.preventDefault();
            navigate("#library");
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}icons/icon.svg`}
            alt=""
            width="38"
            height="38"
          />
          <span>
            TalkSprout
            <small>{s("开口芽", "English, a little every day")}</small>
          </span>
        </a>
        <nav className="app-nav" aria-label={s("主导航", "Primary navigation")}>
          {(["practice", "review", "settings"] as const).map((page) => {
            const href =
              page === "practice"
                ? route.page === "practice"
                  ? "#library"
                  : lastPractice.current
                : page === "review"
                  ? "#review"
                  : "#settings";
            return (
              <a
                key={page}
                href={href}
                aria-current={
                  route.page === page ||
                  (page === "practice" && route.page === "learning")
                    ? "page"
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (location.hash === href)
                    frame.scrollRef.current?.scrollTo({
                      top: 0,
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "auto"
                        : "smooth",
                    });
                  else navigate(href);
                }}
              >
                <Icon name={page} />
                <span>
                  {page === "practice"
                    ? s("开始练习", "Start practice")
                    : page === "review"
                      ? s("结束与复习", "Wrap-up & Review")
                      : s("设置", "Settings")}
                </span>
              </a>
            );
          })}
        </nav>
        <p className="sidebar-note">
          {s("开口练习，回顾积累。", "Practice, review, and keep growing.")}
        </p>
      </aside>
      <main className="app-main">
        <header className="app-header">
          {((route.page === "practice" && route.collection) ||
            route.page === "learning") && (
            <button
              className="back-button icon-button"
              aria-label={
                route.page === "learning"
                  ? s("← 返回练习", "← Back to practice")
                  : s("← 返回分类", "← Back to collections")
              }
              onClick={() => navigate("#library")}
            >
              <Icon name="back" />
            </button>
          )}
          <div className="header-title">
            <span className="eyebrow">TalkSprout</span>
            <h1 id="library-heading" tabIndex={-1}>
              {title}
            </h1>
          </div>
          <span id="connection" className="connection" data-online={online}>
            {online
              ? s("随时，开口练习", "Practice anytime")
              : s("离线模式 · 练习依然在", "Offline · keep practicing")}
          </span>
          <button
            className="icon-button language-shortcut"
            aria-label={en ? "中文" : "English"}
            title={en ? "中文" : "English"}
            onClick={() => changeLocale(en ? "zh" : "en")}
          >
            <Icon name="language" />
          </button>
        </header>
        <UpdateBanner
          snapshot={appUpdate.snapshot}
          completed={appUpdate.completed}
          locale={locale}
          onUpdate={appUpdate.requestUpdate}
        />
        <div
          className="page-scroll"
          data-testid="page-scroll"
          ref={frame.scrollRef}
          onScroll={frame.onScroll}
          role="region"
          aria-label={s("页面内容", "Page content")}
          tabIndex={0}
        >
          <div
            className="workspace"
            hidden={route.page === "settings" || route.page === "learning"}
          >
            <PromptLibrary
              locale={locale}
              purpose={route.page === "review" ? "review" : "practice"}
              collection={route.collection}
              favorites={favorites}
              copying={copying}
              onDetail={detail}
              onCopy={(p) => void copy(p)}
              homeExtras={<>
                <FirstPracticeGuide locale={locale} />
                <SavedPracticeList items={savedPrompts.shortcuts} locale={locale} onRemove={(item) => { if (!savedPrompts.toggleShortcut(item)) setMessage(t.saveError); }} />
                <RecentList items={savedPrompts.recent.filter(item => item.kind === "practice")} locale={locale} />
              </>}
              reviewExtras={<RecentList items={savedPrompts.recent.filter(item => item.kind === "review")} locale={locale} />}
              onFavorite={(id) => {
                const next = favorites.includes(id)
                  ? favorites.filter((value) => value !== id)
                  : [...favorites, id];
                setFavorites(next);
                save("talksprout:favorites", next);
              }}
            />
          </div>
          {route.page === "learning" && (
            <div className="workspace">
              <LearningLibrary
                locale={locale}
                promptId={route.learningPromptId}
                copying={copying}
                writer={writer}
                favorites={savedPrompts.learningFavorites}
                recent={savedPrompts.recent.filter(item => item.kind === "learning")}
                onFavorite={(id) => { if (!savedPrompts.toggleLearningFavorite(id)) setMessage(t.saveError); }}
                onDelivered={(id) => savedPrompts.record({ kind: "learning", promptId: id })}
              />
            </div>
          )}
          {route.page === "settings" && (
            <div className="workspace">
              <Settings
                locale={locale}
                onLocale={changeLocale}
                online={online}
                installed={installed}
                offlineStatus={appUpdate.offlineStatus}
                onAbout={() => info("about")}
                onInstall={() => {
                  if (install.current) {
                    void install.current.prompt();
                    install.current = null;
                  } else info("install");
                }}
              />
            </div>
          )}
        </div>
      </main>
      {!modal && !route.learningPromptId && (
        <div
          id="toast"
          role="status"
          aria-live="polite"
          className={message ? "visible" : ""}
        >
          {message}
        </div>
      )}
      {modal && (
        <PromptDialog
          locale={locale}
          prompt={
            modal.prompt ? composeScene(modal.prompt, sceneSelection) : null
          }
          practiceActions={modal.prompt && modal.prompt.kind !== "review" ? (() => {
            const entry = shortcut(modal.prompt, variant, sceneSelection);
            const stored = savedPrompts.shortcuts.some(item => shortcutKey(item) === shortcutKey(entry));
            const url = new URL(location.href);
            url.search = "";
            url.hash = practiceHref(entry);
            return <div className="practice-actions">
              <button className="save-combination" aria-pressed={stored} onClick={() => { if (!savedPrompts.toggleShortcut(entry)) setMessage(t.saveError); }}>{stored ? s("取消组合收藏", "Remove saved combination") : s("收藏此组合", "Save this combination")}</button>
              <details><summary>{s("分享练习链接", "Share practice link")}</summary>
                <label htmlFor="practice-link">{s("教练、场景与练习方式", "Coach, scenario and format")}</label>
                <input id="practice-link" readOnly value={url.href} />
                <button disabled={copying} onClick={() => {
                  setCopied(false); setManual(false); setMessage("");
                  void writer.write({ text: url.href,
                    onSuccess: () => setMessage(s("练习链接已复制。", "Practice link copied.")),
                    onFailure: () => { const field = document.getElementById("practice-link") as HTMLInputElement | null; field?.focus(); field?.select(); setMessage(s("请手动复制上方链接。", "Select and copy the link manually.")); },
                  });
                }}>{s("复制练习链接", "Copy practice link")}</button>
              </details>
              <small>{s("只保存练习选择，不包含补充背景。", "Only practice choices are saved; extra background is excluded.")}</small>
            </div>;
          })() : undefined}
          sceneSelection={sceneSelection}
          onSceneChange={(next) => {
            resetCopyFeedback();
            setSceneSelection(next);
          }}
          content={modal.content}
          message={message}
          manual={manual}
          copied={copied}
          copying={copying}
          variant={variant}
          reviewSource={reviewSource}
          onSourceChange={(source) => {
            resetCopyFeedback();
            setReviewSource(source);
            setMessage("");
            setManual(false);
          }}
          onVariantChange={(format) => {
            resetCopyFeedback();
            setVariant(format);
            setMessage("");
            setManual(false);
          }}
          onClose={closeModal}
          onCopy={(_p, format) => {
            if (modal.prompt)
              void copy(modal.prompt, format, reviewSource, sceneSelection);
          }}
        />
      )}
    </div>
  );
}
