// Material 3 Expressive inspired shapes, generated as closed SVG paths in a 100 x 100 box.
// Most shapes are polar curves r(theta); a few are drawn directly.

type Radius = (theta: number) => number;

const STEPS = 240;
const CENTER = 50;
const SIZE = 48;

function polarPath(radius: Radius, rotate = 0): string {
  const points: string[] = [];
  for (let i = 0; i < STEPS; i += 1) {
    const theta = (i / STEPS) * Math.PI * 2;
    const r = radius(theta) * SIZE;
    const angle = theta + (rotate * Math.PI) / 180;
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join('')}Z`;
}

const softSign = (value: number, power: number) => Math.sign(value) * Math.abs(value) ** power;

// Scalloped edge with n gentle bumps.
const cookie =
  (n: number, depth: number): Radius =>
  (t) =>
    1 - depth + depth * Math.cos(n * t);

// Rounded polygon: a regular polygon softened toward a circle.
const softPolygon =
  (n: number, softness: number): Radius =>
  (t) => {
    const sector = (Math.PI * 2) / n;
    const local = (((t % sector) + sector) % sector) - sector / 2;
    const polygon = Math.cos(Math.PI / n) / Math.cos(local);
    return (polygon * (1 - softness) + softness) * 0.98;
  };

const RADII = {
  cookie4: cookie(4, 0.09),
  cookie6: cookie(6, 0.08),
  cookie7: cookie(7, 0.075),
  cookie9: cookie(9, 0.07),
  cookie12: cookie(12, 0.06),
  sunny: (t: number) => 0.86 + 0.14 * softSign(Math.cos(8 * t), 0.7),
  verySunny: (t: number) => 0.82 + 0.18 * softSign(Math.cos(8 * t), 0.55),
  softBurst: (t: number) => 0.8 + 0.2 * softSign(Math.cos(10 * t), 0.6),
  burst: (t: number) => 0.68 + 0.32 * ((Math.cos(12 * t) + 1) / 2) ** 2.4,
  clover4: (t: number) => 0.74 + 0.26 * Math.abs(Math.cos(2 * t)) ** 0.7,
  clover8: (t: number) => 0.8 + 0.2 * Math.abs(Math.cos(4 * t)) ** 0.7,
  flower: (t: number) => 0.58 + 0.42 * Math.abs(Math.cos(4 * t)) ** 1.4,
  puffy: (t: number) => 0.86 + 0.14 * Math.abs(Math.cos(5 * t)) ** 0.5,
  // Offset so a vertex points straight up and the silhouette reads as upright.
  pentagon: (t: number) => softPolygon(5, 0.2)(t + Math.PI / 2),
  gem: (t: number) => softPolygon(6, 0.2)(t + Math.PI / 2),
  circle: () => 0.98,
} satisfies Record<string, Radius>;

const DRAWN = {
  arch: 'M8 92V50C8 26.8 26.8 8 50 8S92 26.8 92 50V92Q92 96 88 96H12Q8 96 8 92Z',
  semicircle: 'M6 70C6 45.7 25.7 26 50 26S94 45.7 94 70V72Q94 76 90 76H10Q6 76 6 72Z',
  ghost:
    'M10 50C10 27.9 27.9 10 50 10S90 27.9 90 50V82C90 90 82 94 75 90C66 85 60 80 50 80S34 85 25 90C18 94 10 90 10 82Z',
  pill: 'M30 8H70C82.2 8 92 17.8 92 30V70C92 82.2 82.2 92 70 92H30C17.8 92 8 82.2 8 70V30C8 17.8 17.8 8 30 8Z',
  heart: 'M50 90L14 52C3 40 6 18 24 13C35 10 45 16 50 25C55 16 65 10 76 13C94 18 97 40 86 52Z',
} as const;

export type ShapeKind = keyof typeof RADII | keyof typeof DRAWN;

const cache = new Map<string, string>();

export function shapePath(kind: ShapeKind, rotate = 0): string {
  const key = `${kind}:${rotate}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const path =
    kind in DRAWN
      ? DRAWN[kind as keyof typeof DRAWN]
      : polarPath(RADII[kind as keyof typeof RADII], rotate);
  cache.set(key, path);
  return path;
}
