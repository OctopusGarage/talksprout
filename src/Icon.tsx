export type IconName =
  | "practice"
  | "review"
  | "settings"
  | "chevron"
  | "back"
  | "copy"
  | "heart"
  | "close"
  | "language"
  | "search"
  | "chat"
  | "game"
  | "image"
  | "book"
  | "check"
  | "download"
  | "help"
  | "offline";
const paths: Record<IconName, string[]> = {
  practice: [
    "M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
    "M7 9h10M7 13h6",
  ],
  review: [
    "M5 3h13a2 2 0 0 1 2 2v16H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Z",
    "M3 17h17M8 7h7M8 11h5",
  ],
  settings: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
    "m10 2 4 0 1 3 3 1 3 3-2 3 0 3-3 2-2 3-4 0-1-3-3-1-3-3 2-3 0-3 3-2Z",
  ],
  chevron: ["m9 6 6 6-6 6"],
  back: ["m14 5-7 7 7 7"],
  copy: ["M9 8h10v13H9Z", "M15 8V3H4v13h5"],
  heart: [
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  ],
  close: ["m6 6 12 12M6 18 18 6"],
  language: [
    "M3 5h12M9 2v3M5 5c1 5 4 8 8 10M13 5c-1 5-4 8-8 10",
    "m14 21 4-10 4 10M15.5 17h5",
  ],
  search: ["M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Z", "m16 16 5 5"],
  chat: ["M4 4h16v12H9l-5 4V4Z", "M8 8h8M8 12h5"],
  game: [
    "M8 7h8a5 5 0 0 1 5 5v5a2 2 0 0 1-3 1l-3-2H9l-3 2a2 2 0 0 1-3-1v-5a5 5 0 0 1 5-5Z",
    "M7 10v4M5 12h4M16 11h.01M18 13h.01",
  ],
  image: ["M3 3h18v18H3Z", "m3 17 5-5 4 4 3-3 6 6M15 7h.01"],
  book: [
    "M12 5v16M12 5C8 2 4 3 2 4v15c4-2 7-1 10 2 3-3 6-4 10-2V4c-2-1-6-2-10 1Z",
  ],
  check: ["m5 12 4 4L20 5"],
  download: ["M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"],
  help: [
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z",
    "M9 8a3 3 0 1 1 4 3c-1 .5-1 1-1 3M12 17h.01",
  ],
  offline: [
    "m3 3 18 18M2 8c3-3 6-4 10-4 4 0 7 1 10 4M5 12c4-3 6-3 10-2M9 16c2-1 4-1 6 0M12 20h.01",
  ],
};
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name].map((d, i) => (
        <path d={d} key={i} />
      ))}
    </svg>
  );
}
