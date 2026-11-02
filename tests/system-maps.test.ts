import { describe, expect, it } from 'vitest';
import { SYSTEM_MAPS } from '@/system-maps';
import {
  EDGE_LABEL_MAX_CHARS,
  SUBTITLE_MAX_CHARS,
  layoutView,
  titleLines,
  type Point,
  type Rect,
} from '@/system-maps/layout';
import { LOGISTICS_MAP } from '@/system-maps/logistics';

const maps = Object.values(SYSTEM_MAPS).map((map) => [map.area, map] as const);

// True when the segment a-b passes through the inside of the rectangle.
function crosses(a: Point, b: Point, r: Rect): boolean {
  const inset = 1;
  const left = r.x + inset;
  const right = r.x + r.w - inset;
  const top = r.y + inset;
  const bottom = r.y + r.h - inset;
  if (a.x === b.x) {
    return a.x > left && a.x < right && Math.max(a.y, b.y) > top && Math.min(a.y, b.y) < bottom;
  }
  return a.y > top && a.y < bottom && Math.max(a.x, b.x) > left && Math.min(a.x, b.x) < right;
}

describe('system map data', () => {
  it.each(maps)('%s references only known boxes, kinds, and flows', (_area, map) => {
    const view = map.overview;
    const ids = new Set(view.nodes.map((node) => node.id));
    const kinds = new Set(map.kinds.map((kind) => kind.id));
    const flows = new Set(map.flows.map((flow) => flow.id));
    expect(ids.size).toBe(view.nodes.length);
    for (const node of view.nodes) {
      expect(kinds.has(node.kind)).toBe(true);
      expect(node.row).toBeLessThan(view.layers.length);
    }
    for (const edge of view.edges) {
      expect(ids.has(edge.from) && ids.has(edge.to)).toBe(true);
      expect(flows.has(edge.flow)).toBe(true);
      expect(edge.source || edge.conceptual).toBeTruthy();
    }
    const cells = new Set(view.nodes.map((node) => `${node.row}:${node.col}`));
    expect(cells.size).toBe(view.nodes.length);
    // Every category in the legend is used by at least one box.
    for (const kind of kinds) expect(view.nodes.some((node) => node.kind === kind)).toBe(true);
  });

  it.each(maps)('%s keeps every label short enough to stay inside its box', (_area, map) => {
    for (const node of map.overview.nodes) {
      expect(titleLines(node).length, node.title).toBeLessThanOrEqual(2);
      expect((node.subtitle ?? '').length, node.subtitle).toBeLessThanOrEqual(SUBTITLE_MAX_CHARS);
    }
    for (const edge of map.overview.edges) {
      expect((edge.label ?? '').length, edge.label).toBeLessThanOrEqual(EDGE_LABEL_MAX_CHARS);
    }
  });

  it('names all 26 logistics domains in the overview groups', () => {
    const named = new Set<number>();
    for (const node of LOGISTICS_MAP.overview.nodes) {
      const list = node.subtitle?.startsWith('Domains ') ? node.subtitle.slice(8) : '';
      for (const part of list
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)) {
        const [from, to = from] = part.split('-').map(Number);
        for (let n = from ?? 0; n <= (to ?? 0); n += 1) named.add(n);
      }
    }
    expect([...named].sort((a, b) => a - b)).toEqual(Array.from({ length: 26 }, (_, i) => i + 1));
  });
});

describe('system map layout', () => {
  it.each(maps)('%s routes connectors around boxes with right angles only', (_area, map) => {
    const layout = layoutView(map.overview);
    for (const edge of layout.edges) {
      expect(edge.points.length).toBeGreaterThanOrEqual(2);
      edge.points.slice(1).forEach((b, i) => {
        const a = edge.points[i] as Point;
        expect(a.x === b.x || a.y === b.y).toBe(true);
        for (const node of layout.nodes) {
          expect(crosses(a, b, node), `${edge.from} -> ${edge.to} crosses ${node.id}`).toBe(false);
        }
      });
      for (const p of edge.points) {
        expect(p.x > 0 && p.x < layout.width && p.y > 0 && p.y < layout.height).toBe(true);
      }
      if (edge.label) expect(edge.labelBox).not.toBeNull();
      const box = edge.labelBox;
      if (box) {
        for (const node of layout.nodes) {
          const covers =
            box.x < node.x + node.w &&
            box.x + box.w > node.x &&
            box.y < node.y + node.h &&
            box.y + box.h > node.y;
          expect(covers, `label ${edge.label ?? ''} covers ${node.id}`).toBe(false);
        }
      }
    }
    const labels = layout.edges.flatMap((edge) => (edge.labelBox ? [edge.labelBox] : []));
    labels.forEach((a, i) => {
      for (const b of labels.slice(i + 1)) {
        const overlap = a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        expect(overlap, `${a.lines.join(' ')} overlaps ${b.lines.join(' ')}`).toBe(false);
      }
    });
  });
});
