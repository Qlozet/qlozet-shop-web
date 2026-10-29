'use client';

/**
 * A branded picture of a studio design for sharing: the design on white, a
 * near-black band with the Qlozet logo, the design's name and where it was
 * made. 1080×1350 (4:5) — the size Instagram and WhatsApp show in full.
 *
 * Returns null when the picture can't be drawn (e.g. the image host refuses
 * cross-origin reads), so the caller can fall back to sharing the link.
 */
const W = 1080;
const H = 1350;
const BAND = 210;

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    if (cors) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/** Shorten text with an ellipsis until it fits maxWidth. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

export async function makeShareCard(imageUrl: string, designName: string): Promise<Blob | null> {
  try {
    const [design, logo] = await Promise.all([
      loadImage(imageUrl, true),
      loadImage('/image/logowhite.png', false),
    ]);
    // Fonts the page already loaded; the canvas falls back cleanly otherwise.
    await document.fonts?.ready;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Design on white, contained with a margin.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H - BAND);
    const pad = 48;
    const boxW = W - pad * 2;
    const boxH = H - BAND - pad * 2;
    const scale = Math.min(boxW / design.width, boxH / design.height);
    const dw = design.width * scale;
    const dh = design.height * scale;
    ctx.drawImage(design, (W - dw) / 2, pad + (boxH - dh) / 2, dw, dh);

    // Near-black band with a gold hairline (brand: #0B0B0C, gold #D4AF37).
    ctx.fillStyle = '#0B0B0C';
    ctx.fillRect(0, H - BAND, W, BAND);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(0, H - BAND, W, 4);

    // Logo, left.
    const logoH = 96;
    const logoW = (logo.width / logo.height) * logoH;
    const bandMid = H - BAND / 2 + 2;
    ctx.drawImage(logo, 56, bandMid - logoH / 2, logoW, logoH);

    // Name + line, right of the logo.
    const textX = 56 + logoW + 40;
    const textMax = W - textX - 56;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 40px Outfit, Inter, system-ui, sans-serif';
    ctx.fillText(fit(ctx, designName, textMax), textX, bandMid - 6);
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 26px Inter, system-ui, sans-serif';
    ctx.fillText(fit(ctx, 'Designed on Qlozet · qlozet.app', textMax), textX, bandMid + 38);

    return await new Promise<Blob | null>((resolve) => {
      try {
        canvas.toBlob((b) => resolve(b), 'image/png');
      } catch {
        resolve(null); // tainted canvas: the host didn't allow reading the image
      }
    });
  } catch {
    return null;
  }
}
