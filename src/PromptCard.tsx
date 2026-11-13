import { dictionary, metadata, type Locale } from "./i18n";
import type { Prompt } from "./types";
import { Icon } from "./Icon";
export function PromptCard({
  prompt: p,
  favorite,
  copying,
  onFavorite,
  onDetail,
  onCopy,
  locale,
}: {
  locale: Locale;
  prompt: Prompt;
  favorite: boolean;
  copying: boolean;
  onFavorite: () => void;
  onDetail: () => void;
  onCopy: () => void;
}) {
  const en = locale === "en",
    t = dictionary[locale];
  return (
    <article className="card">
      <button
        className="detail-link card-main"
        data-detail={p.id}
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          onDetail();
        }}
      >
        <span className="prompt-info">
          <span className="prompt-title">
            <h3>{en ? p.english : p.title}</h3>
            {p.kind === "review" && p.recommended && (
              <span className="recommended">{en ? "Recommended" : "推荐"}</span>
            )}
          </span>
          <span className="prompt-description">
            {metadata(p, "description", locale)}
          </span>
          <span className="tags">
            {p.kind !== "review" && <span>{p.level}</span>}
            <span>{metadata(p, "feedback", locale)}</span>
          </span>
        </span>
        <Icon name="chevron" />
      </button>
      <div className="card-actions">
        <button
          className="favorite icon-button"
          data-favorite={p.id}
          aria-label={`${favorite ? (en ? "Remove favorite" : "取消收藏") : en ? "Favorite" : "收藏"}${en ? ": " : "："}${en ? p.english : p.title}`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Icon name="heart" />
        </button>
        <button
          className="copy icon-button"
          data-copy={p.id}
          disabled={copying}
          aria-busy={copying}
          aria-label={`${t.copy}${en ? ": " : "："}${en ? p.english : p.title}`}
          onClick={(event) => {
            event.currentTarget.focus({ preventScroll: true });
            onCopy();
          }}
        >
          <Icon name="copy" />
        </button>
      </div>
    </article>
  );
}
