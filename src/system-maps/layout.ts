import type { MapEdge, MapNode, MapView } from './types';

// Geometry in SVG units. Boxes sit on a grid; the gaps between them are the channels
// connectors travel through, so a routed connector never crosses a box.
export const BOX = { w: 176, h: 64 };
export const GAP = { x: 104, y: 60 };
export const MARGIN = { left: 128, top: 36, right: 28, bottom: 36 };
export const TITLE_MAX_CHARS = 22;
export const SUBTITLE_MAX_CHARS = 26;
export const EDGE_LABEL_MAX_CHARS = 28;

const PORT_SPACING = 12;
const LANE_SPACING = 9;
const LABEL_HEIGHT = 16;
const LABEL_CHAR_WIDTH = 5.7;
const LABEL_LINE = 12;

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
type Side = 'top' | 'right' | 'bottom' | 'left';

export type PlacedNode = MapNode & Rect & { lines: string[] };

export type EdgeLabel = Rect & { lines: string[] };

export type RoutedEdge = MapEdge & {
  index: number;
  points: Point[];
  labelBox: EdgeLabel | null;
};

export type Layer = { label: string; y: number; h: number };

export type ViewLayout = {
  width: number;
  height: number;
  nodes: PlacedNode[];
  edges: RoutedEdge[];
  layers: Layer[];
};

export function colX(col: number): number {
  return MARGIN.left + col * (BOX.w + GAP.x);
}

export function rowY(row: number): number {
  return MARGIN.top + row * (BOX.h + GAP.y);
}

// Greedy word wrap by character count; text sizes are fixed, so this matches the render.
export function wrapText(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// The domain number is drawn in front of the title, so it counts toward the line width.
export function titleLines(node: Pick<MapNode, 'title' | 'ref'>): string[] {
  const prefix = node.ref ? `${node.ref} ` : '';
  const lines = wrapText(`${prefix}${node.title}`, TITLE_MAX_CHARS);
  if (prefix && lines[0]) lines[0] = lines[0].slice(prefix.length);
  return lines;
}

type Route = {
  points: Point[];
  start: Side;
  end: Side;
  // Segment index and channel key for segments that run inside a shared channel.
  channels: { segment: number; key: string }[];
};

function center(node: PlacedNode): Point {
  return { x: node.x + node.w / 2, y: node.y + node.h / 2 };
}

function sidePoint(node: PlacedNode, side: Side): Point {
  const c = center(node);
  if (side === 'top') return { x: c.x, y: node.y };
  if (side === 'bottom') return { x: c.x, y: node.y + node.h };
  if (side === 'left') return { x: node.x, y: c.y };
  return { x: node.x + node.w, y: c.y };
}

function routeEdge(s: PlacedNode, t: PlacedNode, occupied: Set<string>): Route {
  const free = (row: number, col: number) => !occupied.has(`${row}:${col}`);
  // Cells strictly between a and b (inclusive of both bounds when given as such) are free.
  const rowFree = (row: number, from: number, to: number) => {
    const step = from <= to ? 1 : -1;
    for (let col = from; col !== to + step; col += step) if (!free(row, col)) return false;
    return true;
  };
  const colFree = (col: number, from: number, to: number) => {
    const step = from <= to ? 1 : -1;
    for (let row = from; row !== to + step; row += step) if (!free(row, col)) return false;
    return true;
  };

  const dr = t.row - s.row;
  const dc = t.col - s.col;
  const h = Math.sign(dc);
  const v = Math.sign(dr);

  if (dr === 0) {
    if (Math.abs(dc) === 1 || rowFree(s.row, s.col + h, t.col - h)) {
      const start: Side = h > 0 ? 'right' : 'left';
      const end: Side = h > 0 ? 'left' : 'right';
      return { points: [sidePoint(s, start), sidePoint(t, end)], start, end, channels: [] };
    }
    const y = rowY(s.row) - GAP.y / 2;
    const a = sidePoint(s, 'top');
    const b = sidePoint(t, 'top');
    return {
      points: [a, { x: a.x, y }, { x: b.x, y }, b],
      start: 'top',
      end: 'top',
      channels: [{ segment: 1, key: `h${s.row - 1}` }],
    };
  }

  if (dc === 0) {
    if (Math.abs(dr) === 1 || colFree(s.col, s.row + v, t.row - v)) {
      const start: Side = v > 0 ? 'bottom' : 'top';
      const end: Side = v > 0 ? 'top' : 'bottom';
      return { points: [sidePoint(s, start), sidePoint(t, end)], start, end, channels: [] };
    }
    const x = colX(s.col) + BOX.w + GAP.x / 2;
    const a = sidePoint(s, 'right');
    const b = sidePoint(t, 'right');
    return {
      points: [a, { x, y: a.y }, { x, y: b.y }, b],
      start: 'right',
      end: 'right',
      channels: [{ segment: 1, key: `v${s.col}` }],
    };
  }

  // One bend, leaving sideways: the row cells up to the target column and the column
  // cells down to the target must be free.
  if (
    rowFree(s.row, s.col + h, t.col) &&
    (Math.abs(dr) === 1 || colFree(t.col, s.row + v, t.row - v))
  ) {
    const start: Side = h > 0 ? 'right' : 'left';
    const end: Side = v > 0 ? 'top' : 'bottom';
    const a = sidePoint(s, start);
    const b = sidePoint(t, end);
    return { points: [a, { x: b.x, y: a.y }, b], start, end, channels: [] };
  }

  // One bend, leaving up or down.
  if (
    colFree(s.col, s.row + v, t.row) &&
    (Math.abs(dc) === 1 || rowFree(t.row, s.col + h, t.col - h))
  ) {
    const start: Side = v > 0 ? 'bottom' : 'top';
    const end: Side = h > 0 ? 'left' : 'right';
    const a = sidePoint(s, start);
    const b = sidePoint(t, end);
    return { points: [a, { x: a.x, y: b.y }, b], start, end, channels: [] };
  }

  // Through the channels: sideways into the column gap, along it to the row gap next to
  // the target, then across and into the target.
  const start: Side = h > 0 ? 'right' : 'left';
  const end: Side = v > 0 ? 'top' : 'bottom';
  const vx = h > 0 ? colX(s.col) + BOX.w + GAP.x / 2 : colX(s.col) - GAP.x / 2;
  const hy = v > 0 ? rowY(t.row) - GAP.y / 2 : rowY(t.row) + BOX.h + GAP.y / 2;
  const a = sidePoint(s, start);
  const b = sidePoint(t, end);
  return {
    points: [a, { x: vx, y: a.y }, { x: vx, y: hy }, { x: b.x, y: hy }, b],
    start,
    end,
    channels: [
      { segment: 1, key: h > 0 ? `v${s.col}` : `v${s.col - 1}` },
      { segment: 2, key: v > 0 ? `h${t.row - 1}` : `h${t.row}` },
    ],
  };
}

const isVertical = (a: Point, b: Point) => a.x === b.x;

// Spreads connectors that share a channel so they run side by side instead of on top of each other.
function spreadLanes(routes: Route[]): void {
  const lanes = new Map<string, { route: Route; segment: number }[]>();
  routes.forEach((route) => {
    for (const { segment, key } of route.channels) {
      lanes.set(key, [...(lanes.get(key) ?? []), { route, segment }]);
    }
  });
  for (const [key, list] of lanes) {
    const vertical = key.startsWith('v');
    const room = (vertical ? GAP.x : GAP.y) - 24;
    const spacing = list.length > 1 ? Math.min(LANE_SPACING, room / (list.length - 1)) : 0;
    list.forEach(({ route, segment }, i) => {
      const offset = (i - (list.length - 1) / 2) * spacing;
      const a = route.points[segment];
      const b = route.points[segment + 1];
      if (!a || !b) return;
      if (vertical) {
        a.x += offset;
        b.x += offset;
      } else {
        a.y += offset;
        b.y += offset;
      }
    });
  }
}

type Port = { route: Route; end: 'start' | 'end'; key: number; index: number };

// Spreads connectors that meet the same side of a box along that side.
function spreadPorts(routes: Route[], edges: { s: PlacedNode; t: PlacedNode }[]): void {
  const sides = new Map<string, Port[]>();
  routes.forEach((route, index) => {
    const pair = edges[index];
    if (!pair) return;
    const add = (node: PlacedNode, side: Side, other: PlacedNode, end: 'start' | 'end') => {
      const along = side === 'top' || side === 'bottom';
      const key = along ? center(other).x : center(other).y;
      const id = `${node.id}:${side}`;
      sides.set(id, [...(sides.get(id) ?? []), { route, end, key, index }]);
    };
    add(pair.s, route.start, pair.t, 'start');
    add(pair.t, route.end, pair.s, 'end');
  });

  const shifts = new Map<Route, { start: number; end: number }>();
  for (const [id, ports] of sides) {
    const side = id.slice(id.lastIndexOf(':') + 1) as Side;
    const along = side === 'top' || side === 'bottom';
    const length = (along ? BOX.w : BOX.h) - 20;
    const spacing = ports.length > 1 ? Math.min(PORT_SPACING, length / (ports.length - 1)) : 0;
    ports.sort((a, b) => a.key - b.key || a.index - b.index);
    ports.forEach((port, i) => {
      const offset = (i - (ports.length - 1) / 2) * spacing;
      const entry = shifts.get(port.route) ?? { start: 0, end: 0 };
      entry[port.end] = offset;
      shifts.set(port.route, entry);
    });
  }

  for (const route of routes) {
    const shift = shifts.get(route);
    if (!shift) continue;
    const pts = route.points;
    const alongStart = route.start === 'top' || route.start === 'bottom';
    const alongEnd = route.end === 'top' || route.end === 'bottom';

    if (pts.length === 2) {
      const [a, b] = pts as [Point, Point];
      const vertical = isVertical(a, b);
      if (shift.start === shift.end) {
        if (vertical) {
          a.x += shift.start;
          b.x += shift.start;
        } else {
          a.y += shift.start;
          b.y += shift.start;
        }
        continue;
      }
      // Different offsets at each end: add a short jog halfway.
      if (vertical) {
        const mid = (a.y + b.y) / 2;
        route.points = [
          { x: a.x + shift.start, y: a.y },
          { x: a.x + shift.start, y: mid },
          { x: b.x + shift.end, y: mid },
          { x: b.x + shift.end, y: b.y },
        ];
      } else {
        const mid = (a.x + b.x) / 2;
        route.points = [
          { x: a.x, y: a.y + shift.start },
          { x: mid, y: a.y + shift.start },
          { x: mid, y: b.y + shift.end },
          { x: b.x, y: b.y + shift.end },
        ];
      }
      continue;
    }

    const first = pts[0];
    const second = pts[1];
    const last = pts[pts.length - 1];
    const beforeLast = pts[pts.length - 2];
    if (!first || !second || !last || !beforeLast) continue;
    if (alongStart) {
      first.x += shift.start;
      second.x += shift.start;
    } else {
      first.y += shift.start;
      second.y += shift.start;
    }
    if (alongEnd) {
      last.x += shift.end;
      beforeLast.x += shift.end;
    } else {
      last.y += shift.end;
      beforeLast.y += shift.end;
    }
  }
}

function overlaps(a: Rect, b: Rect, pad = 0): boolean {
  return (
    a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y
  );
}

// Puts each label on a segment where it covers no box and no other label.
function placeLabels(edges: RoutedEdge[], nodes: PlacedNode[]): void {
  const placed: Rect[] = [];
  const free = (c: Rect, pad: number) =>
    !nodes.some((n) => overlaps(c, n, pad)) && !placed.some((p) => overlaps(c, p, 3));

  for (const edge of edges) {
    if (!edge.label) continue;
    const segments = edge.points
      .slice(1)
      .map((b, i) => ({ a: edge.points[i] as Point, b }))
      .map(({ a, b }) => ({ a, b, length: Math.abs(a.x - b.x) + Math.abs(a.y - b.y) }))
      .sort((p, q) => q.length - p.length);

    // One line where it fits; two shorter lines for the narrow gaps between columns.
    const variants = [[edge.label], wrapText(edge.label, Math.ceil(edge.label.length / 2) + 2)];
    const candidates: EdgeLabel[] = [];
    for (const lines of variants) {
      const w = Math.round(Math.max(...lines.map((l) => l.length)) * LABEL_CHAR_WIDTH + 14);
      const h = LABEL_HEIGHT + (lines.length - 1) * LABEL_LINE;
      // Longer segments come first; a short one still works when the label fits in the gap.
      for (const { a, b } of segments) {
        for (const t of [0.5, 0.3, 0.7, 0.2, 0.8]) {
          const x = a.x + (b.x - a.x) * t;
          const y = a.y + (b.y - a.y) * t;
          candidates.push({ x: x - w / 2, y: y - h / 2, w, h, lines });
        }
      }
    }
    // When every spot on the line is taken, a label may sit just beside its line instead.
    const beside: EdgeLabel[] = [];
    for (const lines of variants) {
      const w = Math.round(Math.max(...lines.map((l) => l.length)) * LABEL_CHAR_WIDTH + 14);
      const h = LABEL_HEIGHT + (lines.length - 1) * LABEL_LINE;
      for (const { a, b } of segments) {
        const x = (a.x + b.x) / 2;
        const y = (a.y + b.y) / 2;
        // All four sides, so the short jog in the middle of a gap can carry a label too.
        beside.push({ x: x - w / 2, y: y - h - 8, w, h, lines });
        beside.push({ x: x - w / 2, y: y + 8, w, h, lines });
        beside.push({ x: x + 8, y: y - h / 2, w, h, lines });
        beside.push({ x: x - w - 8, y: y - h / 2, w, h, lines });
      }
    }
    candidates.push(...beside);
    const fallback = segments[0];
    if (fallback) {
      const lines = variants[1] ?? [edge.label];
      const w = Math.round(Math.max(...lines.map((l) => l.length)) * LABEL_CHAR_WIDTH + 14);
      const h = LABEL_HEIGHT + (lines.length - 1) * LABEL_LINE;
      const x = (fallback.a.x + fallback.b.x) / 2;
      const y = (fallback.a.y + fallback.b.y) / 2;
      candidates.push({ x: x - w / 2, y: y - h / 2, w, h, lines });
    }

    const box =
      candidates.find((c) => free(c, 4)) ??
      candidates.find((c) => !nodes.some((n) => overlaps(c, n, 2))) ??
      candidates[candidates.length - 1];
    if (!box) continue;
    placed.push(box);
    edge.labelBox = box;
  }
}

export function layoutView(view: MapView): ViewLayout {
  const nodes: PlacedNode[] = view.nodes.map((node) => ({
    ...node,
    x: colX(node.col),
    y: rowY(node.row),
    w: BOX.w,
    h: BOX.h,
    lines: titleLines(node),
  }));
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const occupied = new Set(nodes.map((node) => `${node.row}:${node.col}`));

  const pairs = view.edges.map((edge) => {
    const s = byId.get(edge.from);
    const t = byId.get(edge.to);
    if (!s || !t) throw new Error(`Unknown box: ${edge.from} -> ${edge.to}`);
    return { s, t };
  });
  const routes = pairs.map(({ s, t }) => routeEdge(s, t, occupied));
  spreadLanes(routes);
  spreadPorts(routes, pairs);

  const edges: RoutedEdge[] = view.edges.map((edge, index) => ({
    ...edge,
    index,
    points: routes[index]?.points ?? [],
    labelBox: null,
  }));
  placeLabels(edges, nodes);

  const maxCol = Math.max(0, ...nodes.map((n) => n.col));
  const maxRow = Math.max(0, ...nodes.map((n) => n.row));
  const layers = view.layers.map((label, row) => ({ label, y: rowY(row), h: BOX.h }));

  // Connectors may loop around the last column or row, so the canvas covers them and their labels.
  const right = Math.max(
    colX(maxCol) + BOX.w,
    ...edges.flatMap((e) => e.points.map((p) => p.x)),
    ...edges.map((e) => (e.labelBox ? e.labelBox.x + e.labelBox.w : 0)),
  );
  const bottom = Math.max(
    rowY(maxRow) + BOX.h,
    ...edges.flatMap((e) => e.points.map((p) => p.y)),
    ...edges.map((e) => (e.labelBox ? e.labelBox.y + e.labelBox.h : 0)),
  );

  return {
    width: Math.ceil(right + MARGIN.right),
    height: Math.ceil(bottom + MARGIN.bottom),
    nodes,
    edges,
    layers,
  };
}

// Rounded orthogonal path through the routed points.
export function edgePath(points: Point[], radius = 6): string {
  const [first, ...rest] = points;
  if (!first) return '';
  let d = `M${first.x} ${first.y}`;
  for (let i = 0; i < rest.length; i += 1) {
    const p = rest[i] as Point;
    const prev = points[i] as Point;
    const next = rest[i + 1];
    if (!next) {
      d += ` L${p.x} ${p.y}`;
      break;
    }
    const inLen = Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y);
    const outLen = Math.abs(next.x - p.x) + Math.abs(next.y - p.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const inX = p.x - Math.sign(p.x - prev.x) * r;
    const inY = p.y - Math.sign(p.y - prev.y) * r;
    const outX = p.x + Math.sign(next.x - p.x) * r;
    const outY = p.y + Math.sign(next.y - p.y) * r;
    d += ` L${inX} ${inY} Q${p.x} ${p.y} ${outX} ${outY}`;
  }
  return d;
}

// Every box and connector touching the selected box.
export function relatedTo(layout: ViewLayout, id: string | null) {
  if (!id) return null;
  const edges = new Set<number>();
  const nodes = new Set<string>([id]);
  for (const edge of layout.edges) {
    if (edge.from === id || edge.to === id) {
      edges.add(edge.index);
      nodes.add(edge.from);
      nodes.add(edge.to);
    }
  }
  return { edges, nodes };
}
