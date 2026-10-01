// One-off asset generation for AccelerOps branding.
// Pipeline over the source logo:
//   1. Edge flood-fill removes the white page background while preserving the
//      near-white gears (they are enclosed, not connected to the border).
//   2. A second pass clears the leftover white inside the wordmark letters
//      (the counters of A, e, e, O, p) which the edge fill can't reach.
//   3. The navy "Acceler" text is recolored to steely grey with a black
//      outline so it reads on both light and dark backgrounds.
// Then it emits: transparent logo, favicon icon, apple-icon, and a 1200x630
// Open Graph social image with the tagline rendered on the brand navy field.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = '.kiro/specs/accelerops-website/AccelerOps_C.PNG';
const PUBLIC = 'public';
const APP = 'src/app';

// Brand navy (matches --brand-navy: 210 52% 11%) -> approx #0d1f2d
const NAVY = { r: 13, g: 31, b: 45 };
// Steel/silver pulled from the gear highlights (~#a8adb5).
const STEEL = { r: 168, g: 173, b: 181 };

const WHITE_THRESHOLD = 238;

// The wordmark occupies the bottom band of the source art. The gears and loop
// live above it, so restricting hole-clearing and recoloring to this band keeps
// them safe. Values are fractions of image height/width, measured from the art.
// The wordmark's tallest letters (capital A, ascender of l) top out at ~0.651
// of the image height. Above them is a navy-free gap (~0.62-0.65), and above
// that are the dark shaded undersides of the infinity-loop arrows. The band must
// sit inside that gap: high enough to include the full letter tops, but low
// enough to exclude the arrow shading (which would otherwise get recolored steel).
const WORDMARK_TOP = 0.64;
const ACCELER_RIGHT = 0.68;  // navy "Acceler" ends before this column; "Ops" is gold after

function isWhite(data, i) {
  return data[i] >= WHITE_THRESHOLD &&
    data[i + 1] >= WHITE_THRESHOLD &&
    data[i + 2] >= WHITE_THRESHOLD;
}

function isNavy(data, i) {
  return data[i] < 80 && data[i + 1] < 80 && data[i + 2] < 100;
}

// Generic 4-connected flood fill. `seedEdges` seeds the border; otherwise the
// caller provides an explicit seed list. `predicate(i)` decides fill membership;
// `onFill(i)` mutates the pixel.
function floodFill({ data, width, height, channels, predicate, onFill, seeds }) {
  const px = (x, y) => (y * width + x) * channels;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const flat = y * width + x;
    if (visited[flat]) return;
    visited[flat] = 1;
    if (predicate(px(x, y))) stack.push(x, y);
  };
  for (const [x, y] of seeds) push(x, y);
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    onFill(px(x, y));
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
}

async function processLogo(src) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const px = (x, y) => (y * width + x) * channels;

  // 1. Remove page-white background, seeded from the border.
  const edgeSeeds = [];
  for (let x = 0; x < width; x++) { edgeSeeds.push([x, 0], [x, height - 1]); }
  for (let y = 0; y < height; y++) { edgeSeeds.push([0, y], [width - 1, y]); }
  floodFill({
    data, width, height, channels,
    predicate: (i) => isWhite(data, i),
    onFill: (i) => { data[i + 3] = 0; },
    seeds: edgeSeeds,
  });

  // 2. Clear leftover white inside the wordmark letters. The edge fill can't
  //    reach these enclosed counters, so seed directly from the wordmark band.
  //    Gears sit above WORDMARK_TOP and are never touched.
  const bandTop = Math.floor(WORDMARK_TOP * height);
  const bandSeeds = [];
  for (let y = bandTop; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[px(x, y) + 3] !== 0 && isWhite(data, px(x, y))) bandSeeds.push([x, y]);
    }
  }
  floodFill({
    data, width, height, channels,
    predicate: (i) => isWhite(data, i),
    onFill: (i) => { data[i + 3] = 0; },
    seeds: bandSeeds,
  });

  // 3a. Recolor navy "Acceler" -> steel grey (only in the wordmark band, left of
  //     the gold "Ops"). This leaves navy shadows in the logo mark untouched.
  const accelerRight = Math.floor(ACCELER_RIGHT * width);
  const isSteelText = new Uint8Array(width * height);
  for (let y = bandTop; y < height; y++) {
    for (let x = 0; x < accelerRight; x++) {
      const i = px(x, y);
      if (data[i + 3] !== 0 && isNavy(data, i)) {
        data[i] = STEEL.r; data[i + 1] = STEEL.g; data[i + 2] = STEEL.b;
        isSteelText[y * width + x] = 1;
      }
    }
  }

  // 3b. Add a black outline: any steel-text pixel touching a non-steel/transparent
  //     neighbor becomes near-black. Two-pixel pass for a slightly thicker edge.
  for (let pass = 0; pass < 2; pass++) {
    const edge = [];
    for (let y = bandTop; y < height; y++) {
      for (let x = 0; x < accelerRight; x++) {
        if (!isSteelText[y * width + x]) continue;
        const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        const onBoundary = neighbors.some(([nx, ny]) =>
          nx < 0 || ny < 0 || nx >= width || ny >= height ||
          !isSteelText[ny * width + nx]);
        if (onBoundary) edge.push(y * width + x);
      }
    }
    for (const flat of edge) {
      const i = flat * channels;
      data[i] = 15; data[i + 1] = 15; data[i + 2] = 15;
      isSteelText[flat] = 0; // exclude from next pass's interior so outline grows inward
    }
  }

  return { data, width, height, channels };
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  const { data, width, height, channels } = await processLogo(SRC);
  const logo = () => sharp(Buffer.from(data), { raw: { width, height, channels } });

  // Transparent, trimmed logo for the header/footer.
  await logo()
    .trim()
    .resize({ width: 480, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(`${PUBLIC}/logo.png`);
  console.log('wrote public/logo.png');

  // Favicon (App Router auto-detects src/app/icon.png).
  await logo().resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toFile(`${APP}/icon.png`);
  console.log('wrote src/app/icon.png');

  // Apple touch icon on a solid navy tile (iOS ignores transparency).
  await sharp({ create: { width: 180, height: 180, channels: 4, background: { ...NAVY, alpha: 1 } } })
    .composite([{
      input: await logo().resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
      gravity: 'center',
    }])
    .png().toFile(`${APP}/apple-icon.png`);
  console.log('wrote src/app/apple-icon.png');

  // Open Graph image: logo + tagline on navy, 1200x630.
  const OG_W = 1200, OG_H = 630;
  const tagline = 'Accelerate Your Digital Transformation';
  const svg = `
    <svg width="${OG_W}" height="${OG_H}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .tag { fill: #ffffff; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 52px; }
        .sub { fill: #a8adb5; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 400; font-size: 26px; }
      </style>
      <text x="600" y="500" text-anchor="middle" class="tag">${tagline}</text>
      <text x="600" y="548" text-anchor="middle" class="sub">Modern infrastructure. Cloud migrations. Platform engineering.</text>
    </svg>`;
  await sharp({ create: { width: OG_W, height: OG_H, channels: 4, background: { ...NAVY, alpha: 1 } } })
    .composite([
      {
        input: await logo().trim().resize(360, 360, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer(),
        top: 70, left: (OG_W - 360) / 2,
      },
      { input: Buffer.from(svg), top: 0, left: 0 },
    ])
    .png().toFile(`${PUBLIC}/og-image.png`);
  console.log('wrote public/og-image.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
