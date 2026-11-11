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