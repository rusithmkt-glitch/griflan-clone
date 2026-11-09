const SIZE = 1024;
const cache = new Map();

function ctx2d() {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  return [c, c.getContext("2d")];
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

export function drawMark(ctx, kind, cx, cy, s, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.12;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const u = s / 2;
  ctx.beginPath();
  switch (kind) {
    case "bolt":
      ctx.moveTo(-u * 0.25, -u);
      ctx.lineTo(u * 0.55, -u * 0.15);
      ctx.lineTo(u * 0.05, -u * 0.1);
      ctx.lineTo(u * 0.3, u);
      ctx.lineTo(-u * 0.55, u * 0.1);
      ctx.lineTo(-u * 0.05, u * 0.05);
      ctx.closePath();
      ctx.fill();
      break;
    case "smile":
      ctx.arc(0, 0, u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#00000055";
      ctx.beginPath();
      ctx.arc(-u * 0.35, -u * 0.25, u * 0.13, 0, Math.PI * 2);
      ctx.arc(u * 0.35, -u * 0.25, u * 0.13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#00000055";
      ctx.beginPath();
      ctx.arc(0, u * 0.1, u * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      break;
    case "loop":
      ctx.lineWidth = s * 0.24;
      ctx.arc(-u * 0.3, 0, u * 0.55, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(u * 0.3, 0, u * 0.55, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.stroke();
      break;
    case "peak":
      ctx.moveTo(-u, u * 0.7);
      ctx.lineTo(-u * 0.15, -u * 0.7);
      ctx.lineTo(u * 0.25, u * 0.1);
      ctx.lineTo(u * 0.55, -u * 0.3);
      ctx.lineTo(u, u * 0.7);
      ctx.closePath();
      ctx.fill();
      break;
    case "hex":
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = Math.cos(a) * u;
        const y = Math.sin(a) * u;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case "envelope":
      roundRect(ctx, -u, -u * 0.65, u * 2, u * 1.3, s * 0.08);
      ctx.fill();
      ctx.strokeStyle = "#00000044";
      ctx.beginPath();
      ctx.moveTo(-u, -u * 0.55);
      ctx.lineTo(0, u * 0.15);
      ctx.lineTo(u, -u * 0.55);
      ctx.stroke();
      break;
    case "fish":
      ctx.ellipse(-u * 0.15, 0, u * 0.7, u * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(u * 0.4, 0);
      ctx.lineTo(u, -u * 0.45);
      ctx.lineTo(u, u * 0.45);
      ctx.closePath();
      ctx.fill();
      break;
    case "spark":
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(Math.cos(a + 0.5) * u * 0.5, Math.sin(a + 0.5) * u * 0.5, Math.cos(a) * u, Math.sin(a) * u);
        ctx.quadraticCurveTo(Math.cos(a - 0.5) * u * 0.5, Math.sin(a - 0.5) * u * 0.5, 0, 0);
      }
      ctx.fill();
      break;
    case "oval":
      ctx.ellipse(0, 0, u * 0.6, u, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "grid":
      ctx.lineWidth = s * 0.1;
      for (let i = -1; i <= 1; i++) {
        ctx.moveTo(i * u * 0.6, -u);
        ctx.lineTo(i * u * 0.6, u);
        ctx.moveTo(-u, i * u * 0.6);
        ctx.lineTo(u, i * u * 0.6);
      }
      ctx.stroke();
      break;
    case "wave":
      ctx.lineWidth = s * 0.14;
      for (let r = -1; r <= 1; r++) {
        ctx.beginPath();
        for (let x = -u; x <= u; x += 4) {
          const y = r * u * 0.5 + Math.sin((x / u) * Math.PI) * u * 0.25;
          x === -u ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    default:
      ctx.arc(0, 0, u, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function fontFor(project, weight, size, italic) {
  const family =
    project.type === "serif"
      ? `Georgia, 'Times New Roman', serif`
      : project.type === "mono"
        ? `'Courier New', monospace`
        : `'Helvetica Neue', Arial, sans-serif`;
  return `${italic ? "italic " : ""}${weight} ${size}px ${family}`;
}

function tileHero(project, img) {
  const wm = project.wordmark || project.title;
  const [c, ctx] = ctx2d();
  ctx.fillStyle = project.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (img) {
    const ar = img.width / img.height;
    let dw = SIZE, dh = SIZE;
    if (ar > 1) dw = SIZE * ar;
    else dh = SIZE / ar;
    ctx.drawImage(img, (SIZE - dw) / 2, (SIZE - dh) / 2, dw, dh);
  }
  const g = ctx.createLinearGradient(0, SIZE * 0.55, 0, SIZE);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = "#ffffff";
  ctx.font = fontFor(project, 700, 44);
  ctx.textBaseline = "alphabetic";
  ctx.fillText(wm, 56, SIZE - 56);
  ctx.fillStyle = project.accent;
  ctx.fillRect(56, SIZE - 40, 120, 8);
  return c;
}

function tileWordmark(project) {
  const wm = project.wordmark || project.title;
  const [c, ctx] = ctx2d();
  ctx.fillStyle = project.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  drawMark(ctx, project.mark, SIZE / 2, SIZE * 0.34, 150, project.accent);
  ctx.fillStyle = project.ink;
  ctx.textAlign = "center";
  const long = wm.length > 9;
  ctx.font = fontFor(project, project.type === "serif" ? 400 : 800, long ? 96 : 132, project.type === "serif");
  ctx.fillText(wm, SIZE / 2, SIZE * 0.62);
  ctx.font = fontFor(project, 400, 30);
  ctx.fillStyle = project.ink + "99";
  ctx.fillText(project.category.toUpperCase(), SIZE / 2, SIZE * 0.72);
  ctx.textAlign = "left";
  return c;
}

function tilePalette(project) {
  const [c, ctx] = ctx2d();
  ctx.fillStyle = project.ink;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = project.bg;
  ctx.font = fontFor(project, 700, 40);
  ctx.fillText("COLOUR SYSTEM", 64, 110);
  const cols = 3, rows = 2, gap = 24;
  const w = (SIZE - 128 - gap * (cols - 1)) / cols;
  const h = (SIZE - 260 - gap) / rows;
  project.palette.forEach((hex, i) => {
    const x = 64 + (i % cols) * (w + gap);
    const y = 170 + Math.floor(i / cols) * (h + gap);
    ctx.fillStyle = hex;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.fillStyle = project.bg;
    ctx.font = fontFor(project, 400, 26);
    ctx.fillText(hex.toUpperCase(), x + 4, y + h + 34);
  });
  return c;
}

function tileTagline(project) {
  const [c, ctx] = ctx2d();
  ctx.fillStyle = project.accent;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = project.bg;
  ctx.font = fontFor(project, 400, 92, true);
  const words = project.tagline.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > SIZE - 160 && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  lines.push(line);
  const startY = SIZE / 2 - ((lines.length - 1) * 110) / 2;
  lines.forEach((l, i) => ctx.fillText(l, 80, startY + i * 110));
  ctx.fillRect(80, startY + lines.length * 110 - 60, 160, 10);
  drawMark(ctx, project.mark, SIZE - 130, SIZE - 130, 110, project.bg);
  return c;
}

function tileUI(project) {
  const [c, ctx] = ctx2d();
  ctx.fillStyle = project.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // browser chrome
  ctx.fillStyle = project.ink + "14";
  roundRect(ctx, 48, 48, SIZE - 96, SIZE - 96, 26);
  ctx.fill();
  ctx.fillStyle = project.ink + "22";
  roundRect(ctx, 48, 48, SIZE - 96, 84, 26);
  ctx.fill();
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(96 + i * 44, 90, 14, 0, Math.PI * 2);
    ctx.fill();
  });
  // nav
  ctx.fillStyle = project.ink;
  ctx.font = fontFor(project, 700, 34);
  ctx.fillText(project.wordmark || project.title, 96, 200);
  ctx.fillStyle = project.accent;
  roundRect(ctx, SIZE - 300, 168, 200, 52, 26);
  ctx.fill();
  ctx.fillStyle = project.bg;
  ctx.font = fontFor(project, 700, 26);
  ctx.fillText("Get started", SIZE - 268, 202);
  // hero
  ctx.fillStyle = project.ink;
  ctx.font = fontFor(project, 800, 76);
  ctx.fillText("Build something", 96, 340);
  ctx.fillText("greater.", 96, 430);
  ctx.fillStyle = project.ink + "88";
  ctx.font = fontFor(project, 400, 30);
  ctx.fillText(project.tagline, 96, 490);
  // cards
  const cw = (SIZE - 192 - 48) / 3;
  for (let i = 0; i < 3; i++) {
    const x = 96 + i * (cw + 24);
    ctx.fillStyle = project.ink + "10";
    roundRect(ctx, x, 560, cw, 300, 20);
    ctx.fill();
    ctx.fillStyle = project.palette[(i + 1) % project.palette.length];
    roundRect(ctx, x + 24, 584, cw - 48, 120, 14);
    ctx.fill();
    drawMark(ctx, project.mark, x + cw / 2, 644, 64, project.bg);
    ctx.fillStyle = project.ink + "55";
    roundRect(ctx, x + 24, 730, cw - 48, 16, 8);
    ctx.fill();
    roundRect(ctx, x + 24, 760, (cw - 48) * 0.7, 16, 8);
    ctx.fill();
    roundRect(ctx, x + 24, 790, (cw - 48) * 0.5, 16, 8);
    ctx.fill();
  }
  return c;
}

function tilePattern(project) {
  const [c, ctx] = ctx2d();
  const g = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  g.addColorStop(0, project.bg);
  g.addColorStop(0.55, project.palette[3] || project.bg);
  g.addColorStop(1, project.accent);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.globalAlpha = 0.16;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      drawMark(ctx, project.mark, 128 + x * 256, 128 + y * 256, 120, project.ink);
    }
  }
  ctx.globalAlpha = 1;
  drawMark(ctx, project.mark, SIZE / 2, SIZE / 2, 300, project.ink);
  return c;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function getBoardTiles(project) {
  if (cache.has(project.slug)) return cache.get(project.slug);
  const img = await loadImage(project.image);
  const canvases = [
    tileHero(project, img),
    tileWordmark(project),
    tilePalette(project),
    tileTagline(project),
    tileUI(project),
    tilePattern(project),
  ];
  const urls = canvases.map((c) => c.toDataURL("image/jpeg", 0.9));
  cache.set(project.slug, urls);
  return urls;
}

export function peekBoardTiles(project) {
  return cache.get(project.slug) || null;
}