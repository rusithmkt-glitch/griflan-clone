// Drawing happens in a 1024 unit space; RES is the actual pixel size of the texture.
const SIZE = 1024;
const RES = 512;
const cache = new Map();

function ctx2d() {
  const c = document.createElement("canvas");
  c.width = RES;
  c.height = RES;
  const ctx = c.getContext("2d");
  ctx.scale(RES / SIZE, RES / SIZE);
  return [c, ctx];
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
  ctx.font = fontFor(project, 700, 34);
  ctx.fillText("COLOUR PALETTE", 56, 92);
  ctx.textAlign = "right";
  ctx.font = fontFor(project, 700, 30);
  ctx.fillText(project.wordmark || project.title, SIZE - 56, 92);
  ctx.textAlign = "left";
  const n = project.palette.length;
  const w = (SIZE - 112) / n;
  project.palette.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(56 + i * w, 140, w - 10, SIZE - 260);
    ctx.save();
    ctx.translate(56 + i * w + 14, SIZE - 88);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = project.bg;
    ctx.font = fontFor(project, 400, 24);
    ctx.fillText(hex.toUpperCase(), 0, 0);
    ctx.restore();
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

function tileUI(project, img) {
  const [c, ctx] = ctx2d();
  ctx.fillStyle = project.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  const glow = ctx.createRadialGradient(SIZE / 2, SIZE * 0.42, 60, SIZE / 2, SIZE * 0.42, SIZE * 0.75);
  glow.addColorStop(0, project.accent + "33");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SIZE, SIZE);
  // laptop lid
  const lx = 132, ly = 168, lw = SIZE - 264, lh = lw * 0.62;
  ctx.fillStyle = "#0c0c0e";
  roundRect(ctx, lx - 18, ly - 18, lw + 36, lh + 36, 26);
  ctx.fill();
  ctx.save();
  roundRect(ctx, lx, ly, lw, lh, 12);
  ctx.clip();
  if (img) {
    const ar = img.width / img.height;
    let dw = lw, dh = lh;
    if (ar > lw / lh) dw = lh * ar;
    else dh = lw / ar;
    ctx.drawImage(img, lx + (lw - dw) / 2, ly + (lh - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = project.accent;
    ctx.fillRect(lx, ly, lw, lh);
  }
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(lx, ly, lw, lh);
  ctx.fillStyle = "#ffffff";
  ctx.font = fontFor(project, 800, 52);
  ctx.fillText(project.wordmark || project.title, lx + 40, ly + 84);
  ctx.restore();
  // base
  ctx.fillStyle = "#1a1a1f";
  ctx.beginPath();
  ctx.moveTo(lx - 60, ly + lh + 18);
  ctx.lineTo(lx + lw + 60, ly + lh + 18);
  ctx.lineTo(lx + lw + 96, ly + lh + 74);
  ctx.lineTo(lx - 96, ly + lh + 74);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#26262c";
  roundRect(ctx, SIZE / 2 - 90, ly + lh + 26, 180, 22, 10);
  ctx.fill();
  // caption
  ctx.fillStyle = project.ink;
  ctx.font = fontFor(project, 700, 34);
  ctx.fillText(project.wordmark || project.title, 96, SIZE - 96);
  ctx.fillStyle = project.ink + "88";
  ctx.font = fontFor(project, 400, 26);
  ctx.fillText(project.category.toUpperCase(), 96, SIZE - 52);
  return c;
}

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

function tilePattern(project, img) {
  const [c, ctx] = ctx2d();
  const rnd = hashSeed(project.slug);
  ctx.fillStyle = project.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  const n = 6;
  const s = SIZE / n;
  const fills = [project.accent, project.ink, project.palette[3] || project.bg, project.bg];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const r = rnd();
      if (img && r < 0.52) {
        const sw = img.width / 3;
        const sh = img.height / 3;
        const sx = Math.floor(rnd() * 3) * sw;
        const sy = Math.floor(rnd() * 3) * sh;
        ctx.drawImage(img, sx, sy, sw, sh, x * s, y * s, s, s);
      } else {
        ctx.fillStyle = fills[Math.floor(rnd() * fills.length)];
        ctx.fillRect(x * s, y * s, s, s);
        if (rnd() < 0.3) drawMark(ctx, project.mark, x * s + s / 2, y * s + s / 2, s * 0.5, project.bg);
      }
    }
  }
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

export function getBoardTiles(project) {
  // cache the promise so concurrent callers share one generation run
  if (!cache.has(project.slug)) {
    cache.set(
      project.slug,
      (async () => {
        const img = await loadImage(project.image);
        return [
          tileHero(project, img),
          tileWordmark(project),
          tilePalette(project),
          tileTagline(project),
          tileUI(project, img),
          tilePattern(project, img),
        ];
      })(),
    );
  }
  return cache.get(project.slug);
}