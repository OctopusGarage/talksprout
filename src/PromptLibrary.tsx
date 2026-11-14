import { useLayoutEffect, useRef, useState } from "react";
import { collections, reviewCollection } from "./content/collections";
import { allPrompts } from "./prompts";
import { filterPrompts } from "./library";
import { PromptCard } from "./PromptCard";
import { Icon } from "./Icon";
import { navigate } from "./navigation";
import type { Prompt, Locale } from "./types";

type Purpose = "practice" | "review";
type Props = {
  locale: Locale;
  purpose: Purpose;
  collection: string | null;
  favorites: string[];
  copying: boolean;
  onFavorite: (id: string) => void;
  onDetail: (prompt: Prompt) => void;
  onCopy: (prompt: Prompt) => void;
};
export function PromptLibrary({
  locale,
  purpose,
  collection,
  favorites,
  copying,
  onFavorite,
  onDetail,
  onCopy,
}: Props) {
  const en = locale === "en";
  const reviewing = purpose === "review";
  const filterKey = reviewing ? "review" : (collection ?? "practice");
  const [filters, setFilters] = useState<
    Record<string, { query: string; favoritesOnly: boolean }>
  >({});
  const { query, favoritesOnly } = filters[filterKey] ?? {
    query: "",
    favoritesOnly: false,
  };
  const update = (changes: { query?: string; favoritesOnly?: boolean }) =>
    setFilters((old) => ({
      ...old,
      [filterKey]: {
        ...(old[filterKey] ?? { query: "", favoritesOnly: false }),
        ...changes,
      },
    }));
  const clear = () => update({ query: "", favoritesOnly: false });
  const previous = useRef(collection);
  useLayoutEffect(() => {
    if (previous.current && !collection && !reviewing)
      document
        .querySelector<HTMLButtonElement>(
          `[data-collection="${previous.current}"]`,
        )
        ?.focus({ preventScroll: true });
    previous.current = collection;
  }, [collection, reviewing]);
  const current = collections.find((c) => c.id === collection);
  const stagePrompts = allPrompts.filter(
    (p) =>
      (p.kind === "review") === reviewing &&
      (!current || reviewing || p.category === current.category),
  );
  const favoriteCount = favorites.filter((id) =>
    stagePrompts.some((p) => p.id === id),
  ).length;
  const searching = !!query.trim() || favoritesOnly;
  const matches = filterPrompts(stagePrompts, {
    query,
    favoritesOnly,
    favorites,
  });
  const groups = reviewing
    ? [reviewCollection]
    : collections.filter((c) => (collection ? c.id === collection : searching));
  const showCollections = !reviewing && !current && !searching;
  const searchLabel = reviewing
    ? en
      ? "Search reviews"
      : "搜索复习方式"
    : en
      ? "Search coaches"
      : "搜索陪练模式";
  return (
    <section
      id="library"
      className="library-view"
      aria-label={en ? "Prompt library" : "提示词目录"}
    >
      <p className="view-caption">
        {reviewing
          ? en
            ? "Save what you learned from your AI conversation."
            : "聊天结束后，把学到的表达留下来。"
          : current
            ? en
              ? current.descriptionEn
              : current.description
            : en
              ? "Choose how you want to learn as you chat."
              : "选一种陪练方式，随聊随学。"}
      </p>
      <div className="library-toolbar">
        <label className="search">
          <Icon name="search" />
          <input
            id="search"
            type="search"
            aria-label={searchLabel}
            placeholder={searchLabel}
            value={query}
            onChange={(e) => update({ query: e.target.value })}
          />
        </label>
        <button
          id="favorites"
          aria-label={en ? "Saved prompts" : "收藏的提示词"}
          className="favorites-filter"
          aria-pressed={favoritesOnly}
          onClick={() => update({ favoritesOnly: !favoritesOnly })}
        >
          <Icon name="heart" />
          <span>{en ? "Saved" : "收藏"}</span>
          <span id="favorite-count">{favoriteCount}</span>
        </button>
      </div>
      {searching && (
        <div className="results-toolbar">
          <p role="status">
            {matches.length} {en ? "results" : "个结果"}
          </p>
          <button onClick={clear}>{en ? "Clear filters" : "清除筛选"}</button>
        </div>
      )}
      {showCollections ? (
        <>
          <h2 className="section-label">
            {en ? "Practice collections" : "练习分类"}
          </h2>
          <div className="collection-grid native-list">
            {collections.map((c, index) => (
              <button
                className="collection-card"
                key={c.id}
                data-collection={c.id}
                onClick={() => {
                  clear();
                  navigate(`#collection/${c.id}`);
                }}
              >
                <span className={`entry-icon tone-${index + 1}`}>
                  <Icon
                    name={index === 0 ? "chat" : index === 1 ? "game" : "image"}
                  />
                </span>
                <span className="collection-text">
                  <strong>{en ? c.titleEn : c.category}</strong>
                  <span>{en ? c.descriptionEn : c.description}</span>
                </span>
                <span className="collection-count">
                  {allPrompts.filter((p) => p.category === c.category).length}
                </span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
          <p className="section-note">
            {en
              ? "Copy a prompt to your AI, or read its short spoken opening aloud."
              : "复制给常用 AI，或照着简短语音开场白念。"}
          </p>
          <div className="learning-entry">
            <button onClick={() => navigate("#learning")}>
              <Icon name="book" />
              <span>
                <strong>{en ? "Listening, reading & writing" : "听读写辅助"}</strong>
                <small>{en ? "Extra prompts for your other English practice." : "为其他英语学习需求，补充几个实用提示词。"}</small>
              </span>
              <Icon name="chevron" />
            </button>
          </div>
        </>
      ) : (
        <>
          {reviewing && !searching && (
            <p className="review-recommendation">
              {en
                ? "Start with Complete Study Notes, or focus on one thing below."
                : "先用「完整学习笔记」，也可以只整理其中一项。"}
            </p>
          )}
          {groups.map((c) => {
            const list = matches.filter((p) => p.category === c.category);
            if (!list.length) return null;
            return (
              <section
                key={c.id}
                className="collection-results"
                aria-label={en ? c.titleEn : c.category}
              >
                {searching && (
                  <h2 className="section-label">
                    {en ? c.titleEn : c.category}
                  </h2>
                )}
                <div className="cards native-list">
                  {list.map((p) => (
                    <PromptCard
                      key={p.id}
                      prompt={p}
                      locale={locale}
                      favorite={favorites.includes(p.id)}
                      copying={copying}
                      onFavorite={() => onFavorite(p.id)}
                      onDetail={() => onDetail(p)}
                      onCopy={() => onCopy(p)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
          {!matches.some((p) =>
            groups.some((c) => c.category === p.category),
          ) && (
            <div className="empty">
              <span className="empty-icon">
                <Icon name={favoritesOnly ? "heart" : "search"} />
              </span>
              <h2>
                {favoritesOnly
                  ? en
                    ? "Nothing saved here yet"
                    : "这里还没有收藏"
                  : en
                    ? "No matching prompts"
                    : "没有找到匹配内容"}
              </h2>
              <p>
                {favoritesOnly
                  ? en
                    ? "Tap a heart to keep a prompt handy."
                    : "点一下爱心，把常用提示词留在这里。"
                  : en
                    ? "Try another word or clear your filters."
                    : "换个关键词，或清除筛选。"}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
