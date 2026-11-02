'use client';

import { useMemo, useState } from 'react';
import { AREA_LABELS, type SystemArea } from '@/shared/tracks';
import { systemMap } from '@/system-maps';
import { layoutView } from '@/system-maps/layout';
import type { MapView, SystemMap } from '@/system-maps/types';
import { ToneGlyph } from '../glyph/tone-glyph';
import pageStyles from '../shell/page.module.css';
import { MapCanvas, flowColor } from './map-canvas';
import styles from './system-map.module.css';

function Legend({ map }: { map: SystemMap }) {
  return (
    <ul className={styles.legend} aria-label="Legend">
      {map.flows.map((flow) => (
        <li key={flow.id} className={styles.legendItem}>
          <svg className={styles.legendLine} viewBox="0 0 28 10" aria-hidden="true">
            <path d="M1 5H21" style={{ stroke: flowColor(flow) }} />
            <path d="M20 1L27 5L20 9Z" style={{ fill: flowColor(flow) }} />
          </svg>
          {flow.label}
        </li>
      ))}
      <li className={styles.legendItem}>
        <svg className={styles.legendLine} viewBox="0 0 28 10" aria-hidden="true">
          <path d="M1 5H27" strokeDasharray="5 4" style={{ stroke: 'var(--color-muted)' }} />
        </svg>
        Conceptual, inferred
      </li>
      {map.kinds.map((kind) => (
        <li key={kind.id} className={styles.legendItem}>
          <span
            className={styles.legendBox}
            style={{
              background: `var(--pastel-${kind.tone})`,
              borderColor: `var(--pastel-${kind.tone}-strong)`,
            }}
            aria-hidden="true"
          />
          {kind.label}
        </li>
      ))}
    </ul>
  );
}

function Selection({
  map,
  view,
  selected,
}: {
  map: SystemMap;
  view: MapView;
  selected: string | null;
}) {
  const node = view.nodes.find((n) => n.id === selected);
  if (!node) {
    return (
      <p className={styles.hint}>
        Select a box to highlight its direct links. Drag to pan, scroll to zoom.
      </p>
    );
  }
  const titles = new Map(view.nodes.map((n) => [n.id, n.title]));
  const flows = new Map(map.flows.map((f) => [f.id, f]));
  const kind = map.kinds.find((k) => k.id === node.kind);
  const links = view.edges.filter((edge) => edge.from === node.id || edge.to === node.id);

  return (
    <div className={styles.selection}>
      <div className={styles.selectionHead}>
        <p className={styles.selectionTitle}>
          {node.ref ? `${node.ref} ` : ''}
          {node.title}
        </p>
        <p className={styles.selectionMeta}>
          {kind?.label}, {links.length} {links.length === 1 ? 'link' : 'links'}
        </p>
      </div>
      {links.length > 0 ? (
        <ul className={styles.links}>
          {links.map((edge, i) => {
            const outgoing = edge.from === node.id;
            const other = titles.get(outgoing ? edge.to : edge.from);
            return (
              <li key={i} className={styles.link}>
                <span
                  className={styles.linkDot}
                  style={{ background: flowColor(flows.get(edge.flow)) }}
                  aria-hidden="true"
                />
                <span>
                  {outgoing ? 'To' : 'From'} {other}
                  {edge.label ? `: ${edge.label}` : ''}
                </span>
                <span className={styles.linkSource}>
                  {edge.conceptual ? 'Conceptual' : edge.source}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

// The overview only; System has no further views.
function MapBody({ map, label }: { map: SystemMap; label: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const layout = useMemo(() => layoutView(map.overview), [map]);

  return (
    <>
      <MapCanvas
        map={map}
        layout={layout}
        label={label}
        selected={selected}
        onSelect={setSelected}
      />
      <div className={styles.footer}>
        <Legend map={map} />
        <Selection map={map} view={map.overview} selected={selected} />
      </div>
    </>
  );
}

export function SystemView({ area }: { area: SystemArea }) {
  const map = systemMap(area);
  const label = AREA_LABELS[area];

  return (
    <div
      className={map ? styles.page : undefined}
      data-tone={area}
      data-layout={map ? 'wide' : undefined}
    >
      <header className={pageStyles.header}>
        <ToneGlyph glyph={area} />
        <div className={pageStyles.headerText}>
          <p className={pageStyles.crumbs}>System overview</p>
          <h1 className={pageStyles.title}>{label}</h1>
        </div>
      </header>
      {map ? (
        <MapBody map={map} label={label} />
      ) : (
        <div className={`glass ${pageStyles.card}`}>
          <div className={pageStyles.empty}>
            <ToneGlyph glyph={area} />
            <p>No map yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
