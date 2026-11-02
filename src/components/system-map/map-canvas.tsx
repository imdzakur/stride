'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import {
  MARGIN,
  edgePath,
  relatedTo,
  wrapText,
  type PlacedNode,
  type ViewLayout,
} from '@/system-maps/layout';
import type { FlowKind, SystemMap } from '@/system-maps/types';
import { Glyph } from '../glyph/glyph';
import { IconButton } from '../ui/button';
import styles from './system-map.module.css';

type Transform = { k: number; x: number; y: number };

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
// Fit to View never shrinks text below a readable size; larger maps can still be panned.
const FIT_MIN = 0.5;
const FIT_MAX = 1.2;
const FIT_PADDING = 40;
const DRAG_THRESHOLD = 4;
const KEY_PAN = 48;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function flowColor(flow: Pick<FlowKind, 'tone'> | undefined): string {
  if (!flow || flow.tone === 'ink') return 'var(--color-muted)';
  return `var(--pastel-${flow.tone}-strong)`;
}

type MapCanvasProps = {
  map: SystemMap;
  layout: ViewLayout;
  label: string;
  selected: string | null;
  onSelect: (id: string | null) => void;
};

function NodeBox({
  node,
  tone,
  kindLabel,
  selected,
  dimmed,
  links,
  onSelect,
}: {
  node: PlacedNode;
  tone: string;
  kindLabel: string;
  selected: boolean;
  dimmed: boolean;
  links: number;
  onSelect: (id: string) => void;
}) {
  const titleHeight = node.lines.length * 15;
  const block = titleHeight + (node.subtitle ? 14 : 0);
  const top = node.y + (node.h - block) / 2 + 11;
  const x = node.x + 12;

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      onSelect(node.id);
    }
  };

  return (
    <g
      className={styles.node}
      data-dimmed={dimmed || undefined}
      data-selected={selected || undefined}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${node.ref ? `${node.ref} ` : ''}${node.title}. ${kindLabel}. ${links} ${links === 1 ? 'link' : 'links'}.`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.id);
      }}
      onKeyDown={onKeyDown}
    >
      <rect
        className={styles.box}
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={10}
        style={{
          fill: `var(--pastel-${tone})`,
          stroke: `var(--pastel-${tone}-strong)`,
        }}
      />
      {node.lines.map((line, i) => (
        <text key={i} className={styles.boxTitle} x={x} y={top + i * 15}>
          {i === 0 && node.ref ? (
            <tspan className={styles.boxRef} style={{ fill: `var(--pastel-${tone}-strong)` }}>
              {node.ref}{' '}
            </tspan>
          ) : null}
          {line}
        </text>
      ))}
      {node.subtitle ? (
        <text className={styles.boxSubtitle} x={x} y={top + titleHeight + 1}>
          {node.subtitle}
        </text>
      ) : null}
    </g>
  );
}

export function MapCanvas({ map, layout, label, selected, onSelect }: MapCanvasProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform | null>(null);
  // Once the person pans or zooms, a resize keeps their view instead of fitting again.
  const touched = useRef(false);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    from: Transform;
    moved: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  const fitted = useCallback(
    (width: number, height: number): Transform => {
      const k = clamp(
        Math.min((width - FIT_PADDING) / layout.width, (height - FIT_PADDING) / layout.height),
        FIT_MIN,
        FIT_MAX,
      );
      return { k, x: (width - layout.width * k) / 2, y: (height - layout.height * k) / 2 };
    },
    [layout],
  );

  const fit = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    touched.current = false;
    setTransform(fitted(frame.clientWidth, frame.clientHeight));
  }, [fitted]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(() => {
      if (!touched.current) setTransform(fitted(frame.clientWidth, frame.clientHeight));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [fitted]);

  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    touched.current = true;
    setTransform((prev) => {
      if (!prev) return prev;
      const k = clamp(prev.k * factor, MIN_ZOOM, MAX_ZOOM);
      const ratio = k / prev.k;
      return { k, x: px - (px - prev.x) * ratio, y: py - (py - prev.y) * ratio };
    });
  }, []);

  const zoomCenter = useCallback(
    (factor: number) => {
      const frame = frameRef.current;
      if (frame) zoomAt(factor, frame.clientWidth / 2, frame.clientHeight / 2);
    },
    [zoomAt],
  );

  // The wheel zooms around the pointer; React wheel listeners are passive, so this one is native.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = frame.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top);
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
  }, [zoomAt]);

  const pan = (dx: number, dy: number) => {
    touched.current = true;
    setTransform((prev) => (prev ? { ...prev, x: prev.x + dx, y: prev.y + dy } : prev));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !transform) return;
    if ((event.target as Element).closest('button')) return;
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from: transform,
      moved: false,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      state.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    touched.current = true;
    setTransform({ ...state.from, x: state.from.x + dx, y: state.from.y + dy });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state || state.id !== event.pointerId) return;
    suppressClick.current = state.moved;
    drag.current = null;
  };

  // A click on empty canvas clears the selection; the click that ends a drag does nothing.
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!(event.target as Element).closest('button')) onSelect(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, () => void> = {
      '+': () => zoomCenter(1.2),
      '=': () => zoomCenter(1.2),
      '-': () => zoomCenter(1 / 1.2),
      '0': fit,
      ArrowLeft: () => pan(KEY_PAN, 0),
      ArrowRight: () => pan(-KEY_PAN, 0),
      ArrowUp: () => pan(0, KEY_PAN),
      ArrowDown: () => pan(0, -KEY_PAN),
      Escape: () => onSelect(null),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  const related = relatedTo(layout, selected);
  const kinds = new Map(map.kinds.map((kind) => [kind.id, kind]));
  const flows = new Map(map.flows.map((flow) => [flow.id, flow]));
  const linkCount = (id: string) =>
    layout.edges.filter((edge) => edge.from === id || edge.to === id).length;
  const selectingClick = (id: string) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onSelect(id === selected ? null : id);
  };

  return (
    <div
      ref={frameRef}
      role="region"
      className={`glass ${styles.frame}`}
      tabIndex={0}
      aria-label={`${label} map. Drag or use arrow keys to pan, scroll or press plus and minus to zoom, 0 to fit.`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {transform ? (
        <svg className={styles.svg} role="group" aria-label={`${label} boxes and connections`}>
          <defs>
            {map.flows.map((flow) => (
              <marker
                key={flow.id}
                id={`arrow-${map.area}-${flow.id}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                markerUnits="userSpaceOnUse"
                orient="auto-start-reverse"
              >
                <path d="M0 0L10 5L0 10Z" style={{ fill: flowColor(flow) }} />
              </marker>
            ))}
          </defs>
          <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
            {layout.layers.map((layer) => (
              <g key={layer.label} className={styles.layer}>
                <rect
                  className={styles.layerBand}
                  x={12}
                  y={layer.y - 12}
                  width={layout.width - 24}
                  height={layer.h + 24}
                  rx={14}
                />
                {wrapText(layer.label, 16).map((line, i, lines) => (
                  <text
                    key={i}
                    className={styles.layerLabel}
                    x={MARGIN.left - 22}
                    y={layer.y + layer.h / 2 + 4 + (i - (lines.length - 1) / 2) * 14}
                  >
                    {line}
                  </text>
                ))}
              </g>
            ))}

            {layout.edges.map((edge) => {
              const flow = flows.get(edge.flow);
              return (
                <path
                  key={edge.index}
                  className={styles.edge}
                  data-dimmed={(related && !related.edges.has(edge.index)) || undefined}
                  data-active={related?.edges.has(edge.index) || undefined}
                  d={edgePath(edge.points)}
                  style={{ stroke: flowColor(flow) }}
                  strokeDasharray={edge.conceptual ? '5 4' : undefined}
                  markerEnd={`url(#arrow-${map.area}-${edge.flow})`}
                />
              );
            })}

            {layout.edges.map((edge) => {
              const box = edge.labelBox;
              if (!box) return null;
              return (
                <g
                  key={edge.index}
                  className={styles.edgeLabel}
                  data-dimmed={(related && !related.edges.has(edge.index)) || undefined}
                >
                  <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={8} />
                  {box.lines.map((line, i) => (
                    <text key={i} x={box.x + box.w / 2} y={box.y + 11.5 + i * 12}>
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}

            {layout.nodes.map((node) => {
              const kind = kinds.get(node.kind);
              return (
                <NodeBox
                  key={node.id}
                  node={node}
                  tone={kind?.tone ?? 'periwinkle'}
                  kindLabel={kind?.label ?? ''}
                  selected={node.id === selected}
                  dimmed={Boolean(related && !related.nodes.has(node.id))}
                  links={linkCount(node.id)}
                  onSelect={selectingClick}
                />
              );
            })}
          </g>
        </svg>
      ) : null}

      <div className={`glass ${styles.controls}`}>
        <IconButton label="Zoom out" onClick={() => zoomCenter(1 / 1.2)}>
          <Glyph name="minus" size={16} />
        </IconButton>
        <span className={styles.zoom} aria-live="polite">
          {transform ? `${Math.round(transform.k * 100)}%` : ''}
        </span>
        <IconButton label="Zoom in" onClick={() => zoomCenter(1.2)}>
          <Glyph name="plus" size={16} />
        </IconButton>
        <button type="button" className={styles.fit} onClick={fit}>
          <Glyph name="fit" size={16} />
          Fit to view
        </button>
      </div>
    </div>
  );
}
