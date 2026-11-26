import QRCode from "qrcode";
import appIcon from "../public/icons/icon-192.png";
import type { Locale } from "./types";

interface OpeningInstruction { title: string; body: string; alternative?: string }
export interface ShareCardCopy {
  brand: string;
  headline: string[];
  description: string;
  scanLabel: string;
  instructionsTitle: string;
  otherScreen: OpeningInstruction;
  samePhone: OpeningInstruction;
  fallback: string;
  footer: string;
}
export const shareCardCopy: Record<Locale, ShareCardCopy> = {
  zh: {
    brand: "TalkSprout · 开口芽",
    headline: ["把英语，", "说进日常。"],
    description: "选好提示词，去常用 AI 开口练英语。",
    scanLabel: "扫码打开 TalkSprout",
    instructionsTitle: "iPhone 怎么打开",
    otherScreen: { title: "二维码在另一块屏幕上", body: "打开「相机」对准二维码，轻点出现的链接。", alternative: "也可用控制中心的「扫码器」。" },
    samePhone: { title: "图片就在这台 iPhone 上", body: "存到「照片」后打开，尝试长按二维码或网址，再打开链接。" },
    fallback: "没有识别出来？在 Safari 输入下方网址。",
    footer: "无需账号 · 搭配你常用的 AI 应用练习",
  },
  en: {
    brand: "TalkSprout",
    headline: ["A little English.", "A little every day."],
    description: "Choose a prompt. Start speaking with your AI.",
    scanLabel: "Scan to open TalkSprout",
    instructionsTitle: "Opening on iPhone",
    otherScreen: { title: "On another screen", body: "Open Camera, point it at the QR code, then tap the link.", alternative: "Or use Code Scanner in Control Center." },
    samePhone: { title: "Saved on this iPhone", body: "Save to Photos and open it. Try touching and holding the QR code or the address below, then choose an available open-link action." },
    fallback: "No link detected? Type the address below in Safari.",
    footer: "No account · Practise with the AI app you use",
  },
};

const colors = { background: "#f3f5f1", ink: "#223e34", green: "#285a46", muted: "#596d60", border: "#d6dfd3", white: "#ffffff" };
const font = 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

/** A local, self-contained PNG. QR modules remain square with a four-module quiet zone. */
export async function renderShareCard(url: string, locale: Locale): Promise<Blob> {
  await document.fonts.ready;
  const copy = shareCardCopy[locale];
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1800;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  const ctx = context;
  const margin = 88;
  const contentWidth = canvas.width - margin * 2;
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "top";

  function text(value: string, x: number, y: number, size: number, weight = 400, color = colors.ink) {
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.fillText(value, x, y);
  }
  function wrapped(value: string, y: number, size: number, lineHeight: number, color = colors.ink, weight = 400): number {
    ctx.font = `${weight} ${size}px ${font}`;
    const units = locale === "en" ? value.split(/(?<=\s)/) : Array.from(value);
    let line = "";
    for (const unit of units) {
      if (line && ctx.measureText(line + unit).width > contentWidth) {
        text(line.trimEnd(), margin, y, size, weight, color);
        y += lineHeight;
        line = "";
      }
      line += unit;
    }
    if (line) { text(line.trimEnd(), margin, y, size, weight, color); y += lineHeight; }
    return y;
  }

  // The leaf mark continues the app's growing-sprout identity without obscuring the code.
  ctx.fillStyle = colors.green;
  ctx.beginPath();
  ctx.ellipse(105, 76, 19, 10, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  text(copy.brand, 142, 60, 30, 650, colors.green);
  let y = 136;
  for (const line of copy.headline) { text(line, margin, y, locale === "en" ? 72 : 80, 750); y += 96; }
  y = wrapped(copy.description, y + 12, 32, 44, colors.muted) + 28;

  const matrix = QRCode.create(url, { errorCorrectionLevel: "H" }).modules;
  const moduleSize = Math.floor(560 / (matrix.size + 8));
  if (moduleSize < 2) throw new Error("App URL is too long for a readable card");
  const qrSize = (matrix.size + 8) * moduleSize;
  const qrX = Math.floor((canvas.width - qrSize) / 2);
  const qrY = Math.round(y);
  ctx.fillStyle = colors.white;
  ctx.fillRect(qrX, qrY, qrSize, qrSize);
  ctx.fillStyle = "#111111";
  for (let row = 0; row < matrix.size; row++) for (let column = 0; column < matrix.size; column++) {
    if (matrix.get(row, column)) ctx.fillRect(qrX + (column + 4) * moduleSize, qrY + (row + 4) * moduleSize, moduleSize, moduleSize);
  }
  // Reserve a small central badge; high error correction protects the covered modules.
  const icon = new Image();
  icon.src = appIcon;
  await icon.decode();
  const badgeSize = Math.floor(matrix.size * moduleSize * 0.18);
  const badgeX = Math.round(qrX + (qrSize - badgeSize) / 2);
  const badgeY = Math.round(qrY + (qrSize - badgeSize) / 2);
  ctx.fillStyle = colors.white;
  ctx.fillRect(badgeX - 6, badgeY - 6, badgeSize + 12, badgeSize + 12);
  ctx.drawImage(icon, badgeX, badgeY, badgeSize, badgeSize);
  y = qrY + qrSize + 28;
  ctx.font = `650 34px ${font}`;
  text(copy.scanLabel, (canvas.width - ctx.measureText(copy.scanLabel).width) / 2, y, 34, 650, colors.green);
  y += 74;
  ctx.fillStyle = colors.border;
  ctx.fillRect(margin, y, contentWidth, 2);
  y += 30;
  text(copy.instructionsTitle, margin, y, 34, 700);
  y += 60;
  for (const instruction of [copy.otherScreen, copy.samePhone]) {
    y = wrapped(instruction.title, y, 29, 40, colors.green, 650) + 10;
    y = wrapped(instruction.body, y, 28, 40, colors.ink);
    if (instruction.alternative) y = wrapped(instruction.alternative, y + 6, 26, 38, colors.muted);
    y += 24;
  }
  y = wrapped(copy.fallback, y, 28, 40, colors.muted) + 18;
  // Render every URL character, even at a narrow deployment path or with a long host.
  ctx.font = `26px ${font}`;
  let line = "";
  for (const character of url) {
    if (line && ctx.measureText(line + character).width > contentWidth) {
      text(line, margin, y, 26, 500, colors.green); y += 36; line = "";
    }
    line += character;
  }
  if (line) { text(line, margin, y, 26, 500, colors.green); y += 36; }
  y += 28;
  wrapped(copy.footer, y, 25, 36, colors.muted);
  if (y + 72 > canvas.height) throw new Error("Card text exceeds image bounds");
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG export unavailable")), "image/png"));
}
