import { drawMark } from "./boardArt";

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function font(project, weight, size, italic) {
  const family =
    project.type === "serif"
      ? "Georgia, 'Times New Roman', serif"
      : "'Helvetica Neue', Arial, sans-serif";
  return `${italic ? "italic " : ""}${weight} ${size}px ${family}`;
}

function cover(ctx, img, w, h) {
  if (!img) return false;
  const ar = img.width / img.height;
  let dw = w;
  let dh = w / ar;
  if (dh < h) {
    dh = h;
    dw = h * ar;
  }
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return true;
}

function scrim(ctx, w, h, strength = 0.62) {
  const g = ctx.createLinearGradient(0, h * 0.4, 0, h);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  lines.push(line);
  return lines;
}

function photoPortrait(p, img) {
  const w = 800, h = 1000;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  cover(ctx, img, w, h);
  scrim(ctx, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(p, 700, 40);
  ctx.fillText(p.wordmark || p.title, 48, h - 76);
  ctx.fillStyle = p.accent;
  ctx.fillRect(48, h - 56, 96, 7);
  return [c, w, h, "Campaign imagery"];
}

function wordmarkSquare(p) {
  const w = 800, h = 800;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  drawMark(ctx, p.mark, w / 2, h * 0.32, 150, p.accent);
  ctx.fillStyle = p.ink;
  ctx.textAlign = "center";
  const wm = p.wordmark || p.title;
  ctx.font = font(p, p.type === "serif" ? 400 : 800, wm.length > 9 ? 78 : 108, p.type === "serif");
  ctx.fillText(wm, w / 2, h * 0.62);
  ctx.font = font(p, 400, 26);
  ctx.fillStyle = p.ink + "99";
  ctx.fillText(p.category.toUpperCase(), w / 2, h * 0.72);
  ctx.textAlign = "left";
  return [c, w, h, "Primary wordmark"];
}

function palettePortrait(p) {
  const w = 800, h = 1000;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.bg;
  ctx.font = font(p, 700, 34);
  ctx.fillText("COLOUR SYSTEM", 56, 96);
  const n = p.palette.length;
  const gap = 18;
  const bh = (h - 200 - gap * (n - 1)) / n;
  p.palette.forEach((hex, i) => {
    const y = 140 + i * (bh + gap);
    ctx.fillStyle = hex;
    roundRect(ctx, 56, y, w - 112, bh, 14);
    ctx.fill();
    ctx.fillStyle = p.bg;
    ctx.font = font(p, 400, 24);
    ctx.fillText(hex.toUpperCase(), 72, y + bh / 2 + 8);
  });
  return [c, w, h, "Colour system"];
}

function taglineLandscape(p) {
  const w = 800, h = 600;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.bg;
  ctx.font = font(p, 400, 74, true);
  const lines = wrapText(ctx, p.tagline, w - 140);
  const startY = h / 2 - ((lines.length - 1) * 88) / 2;
  lines.forEach((l, i) => ctx.fillText(l, 70, startY + i * 88));
  ctx.fillRect(70, startY + lines.length * 88 - 40, 130, 9);
  drawMark(ctx, p.mark, w - 100, h - 100, 90, p.bg);
  return [c, w, h, "Brand voice"];
}

function uiPortrait(p) {
  const w = 800, h = 1000;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.ink + "14";
  roundRect(ctx, 44, 44, w - 88, h - 88, 24);
  ctx.fill();
  ctx.fillStyle = p.ink + "22";
  roundRect(ctx, 44, 44, w - 88, 76, 24);
  ctx.fill();
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(88 + i * 40, 82, 12, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = p.ink;
  ctx.font = font(p, 700, 30);
  ctx.fillText(p.wordmark || p.title, 88, 182);
  ctx.fillStyle = p.accent;
  roundRect(ctx, w - 268, 152, 180, 46, 23);
  ctx.fill();
  ctx.fillStyle = p.bg;
  ctx.font = font(p, 700, 23);
  ctx.fillText("Get started", w - 240, 182);
  ctx.fillStyle = p.ink;
  ctx.font = font(p, 800, 66);
  ctx.fillText("Build something", 88, 300);
  ctx.fillText("greater.", 88, 378);
  ctx.fillStyle = p.ink + "88";
  ctx.font = font(p, 400, 26);
  ctx.fillText(p.tagline, 88, 430);
  const cw = (w - 176 - 40) / 3;
  for (let i = 0; i < 3; i++) {
    const x = 88 + i * (cw + 20);
    ctx.fillStyle = p.ink + "10";
    roundRect(ctx, x, 500, cw, 300, 18);
    ctx.fill();
    ctx.fillStyle = p.palette[(i + 1) % p.palette.length];
    roundRect(ctx, x + 20, 522, cw - 40, 110, 12);
    ctx.fill();
    drawMark(ctx, p.mark, x + cw / 2, 577, 56, p.bg);
    ctx.fillStyle = p.ink + "55";
    roundRect(ctx, x + 20, 656, cw - 40, 14, 7);
    ctx.fill();
    roundRect(ctx, x + 20, 684, (cw - 40) * 0.7, 14, 7);
    ctx.fill();
  }
  ctx.fillStyle = p.accent;
  roundRect(ctx, 88, 850, w - 176, 60, 30);
  ctx.fill();
  ctx.fillStyle = p.bg;
  ctx.font = font(p, 700, 26);
  ctx.fillText("Start your journey", 120, 888);
  return [c, w, h, "Web design"];
}

function patternSquare(p) {
  const w = 800, h = 800;
  const [c, ctx] = canvas(w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, p.bg);
  g.addColorStop(0.55, p.palette[3] || p.bg);
  g.addColorStop(1, p.accent);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.16;
  for (let y = 0; y < 4; y++)
    for (let x = 0; x < 4; x++) drawMark(ctx, p.mark, 100 + x * 200, 100 + y * 200, 96, p.ink);
  ctx.globalAlpha = 1;
  drawMark(ctx, p.mark, w / 2, h / 2, 240, p.ink);
  return [c, w, h, "Identity pattern"];
}

function photoLandscape(p, img) {
  const w = 800, h = 500;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  cover(ctx, img, w, h);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = font(p, p.type === "serif" ? 400 : 800, 64, p.type === "serif");
  ctx.fillText(p.wordmark || p.title, w / 2, h / 2 + 20);
  ctx.textAlign = "left";
  return [c, w, h, "Art direction"];
}

function typePortrait(p) {
  const w = 800, h = 1100;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.accent;
  ctx.font = font(p, p.type === "serif" ? 400 : 800, 300, p.type === "serif");
  ctx.fillText("Aa", 56, 360);
  ctx.fillStyle = p.ink;
  ctx.font = font(p, 700, 40);
  ctx.fillText(p.wordmark || p.title, 56, 470);
  ctx.fillStyle = p.ink + "88";
  ctx.font = font(p, 400, 30);
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  ctx.fillText(alpha.slice(0, 13), 56, 560);
  ctx.fillText(alpha.slice(13), 56, 610);
  ctx.fillText(nums, 56, 660);
  ctx.fillStyle = p.ink + "55";
  ctx.font = font(p, 400, 26);
  ctx.fillText("Typography · Display & text", 56, 740);
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(56, 800);
  ctx.lineTo(w - 56, 800);
  ctx.stroke();
  ctx.fillStyle = p.ink;
  ctx.font = font(p, 400, 44, true);
  ctx.fillText(p.tagline, 56, 880);
  return [c, w, h, "Type specimen"];
}

function markGridLandscape(p) {
  const w = 800, h = 520;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.ink;
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < 3; y++)
    for (let x = 0; x < 5; x++)
      drawMark(ctx, p.mark, 90 + x * 155, 90 + y * 170, 92, (x + y) % 2 ? p.accent : p.bg);
  return [c, w, h, "Marque studies"];
}

function bandsLandscape(p) {
  const w = 800, h = 450;
  const [c, ctx] = canvas(w, h);
  const n = p.palette.length;
  const bw = w / n;
  p.palette.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * bw, 0, bw + 1, h);
  });
  return [c, w, h, "Palette bands"];
}

function quoteSquare(p) {
  const w = 800, h = 800;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = p.accent;
  ctx.font = font(p, 700, 200, true);
  ctx.fillText("“", 48, 220);
  ctx.fillStyle = p.ink;
  ctx.font = font(p, 400, 56, true);
  const lines = wrapText(ctx, p.tagline, w - 120);
  lines.forEach((l, i) => ctx.fillText(l, 60, 320 + i * 76));
  ctx.fillStyle = p.ink + "88";
  ctx.font = font(p, 400, 26);
  ctx.fillText("— " + (p.wordmark || p.title) + ", " + p.category, 60, h - 80);
  return [c, w, h, "Manifesto"];
}

function photoTall(p, img) {
  const w = 800, h = 1200;
  const [c, ctx] = canvas(w, h);
  ctx.fillStyle = p.accent;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(28, 28, w - 56, h - 56);
  ctx.clip();
  ctx.fillStyle = p.bg;
  ctx.fillRect(28, 28, w - 56, h - 56);
  cover(ctx, img, w - 56, h - 56);
  ctx.restore();
  scrim(ctx, w, h, 0.5);
  ctx.fillStyle = "#ffffff";
  ctx.font = font(p, 700, 34);
  ctx.fillText(p.category.toUpperCase(), 56, h - 72);
  return [c, w, h, "Brand world"];
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const artCache = new Map();
const masonryCache = new Map();
const boardCache = new Map();

const MAKERS = [
  photoPortrait,
  wordmarkSquare,
  palettePortrait,
  taglineLandscape,
  uiPortrait,
  patternSquare,
  photoLandscape,
  typePortrait,
  markGridLandscape,
  bandsLandscape,
  quoteSquare,
  photoTall,
];

// Raw artefact canvases, generated once per project and shared by the detail
// page and the 3D floor cards so both surfaces show identical imagery.
export function getArtTiles(project) {
  if (!artCache.has(project.slug)) {
    artCache.set(
      project.slug,
      (async () => {
        const img = await loadImage(project.image);
        const tiles = [];
        for (let i = 0; i < MAKERS.length; i++) {
          const [c, w, h, caption] = MAKERS[i](project, img);
          tiles.push({ canvas: c, w, h, caption, index: i + 1 });
          // yield between tiles so drawing never blocks a frame
          await new Promise((r) => setTimeout(r, 0));
        }
        return tiles;
      })(),
    );
  }
  return artCache.get(project.slug);
}

export function getMasonry(project) {
  if (!masonryCache.has(project.slug)) {
    masonryCache.set(
      project.slug,
      (async () => {
        const tiles = await getArtTiles(project);
        const out = [];
        for (const t of tiles) {
          out.push({
            src: t.canvas.toDataURL("image/jpeg", 0.88),
            w: t.w,
            h: t.h,
            caption: t.caption,
            index: t.index,
          });
          // yield between tiles so encoding never blocks a frame
          await new Promise((r) => setTimeout(r, 0));
        }
        return out;
      })(),
    );
  }
  return masonryCache.get(project.slug);
}

// Six detail-page artefacts chosen for the floor collage, in slot order:
// [wide, square, square, square, square, wide]. These are the same canvases
// getMasonry encodes, so a card previews exactly what its detail page shows.
export function getBoardTiles(project) {
  if (!boardCache.has(project.slug)) {
    boardCache.set(
      project.slug,
      (async () => {
        const t = await getArtTiles(project);
        return [t[6], t[5], t[10], t[1], t[0], t[8]];
      })(),
    );
  }
  return boardCache.get(project.slug);
}