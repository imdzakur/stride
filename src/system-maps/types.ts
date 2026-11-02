import type { SystemArea } from '@/shared/tracks';

// Pastel pairs from tokens.css; a box reads --pastel-<tone> and --pastel-<tone>-strong.
export type Tone = 'sky' | 'rose' | 'mint' | 'butter' | 'peach' | 'aqua' | 'sand' | 'periwinkle';

// A meaningful category of boxes, shown in the legend.
export type NodeKind = { id: string; label: string; tone: Tone };

// A kind of exchange between boxes (instructions, data, funds, goods), shown in the legend.
// Ink is the neutral text tone, kept for data so it never competes with the colored flows.
export type FlowKind = { id: string; label: string; tone: Tone | 'ink' };

export type MapNode = {
  id: string;
  title: string;
  subtitle?: string;
  kind: string;
  // Grid cell: columns run left to right inside a process, rows are layers from top to bottom.
  col: number;
  row: number;
  // Source domain number, kept as written in the source documents.
  ref?: string;
};

export type MapEdge = {
  from: string;
  to: string;
  flow: string;
  label?: string;
  // Where the relationship is written down, for example "INT-04" or "Master 8".
  source?: string;
  // Inferred from the documents rather than stated in them.
  conceptual?: boolean;
};

export type MapView = {
  // One label per row, top to bottom.
  layers: string[];
  nodes: MapNode[];
  edges: MapEdge[];
};

export type SystemMap = {
  area: SystemArea;
  kinds: NodeKind[];
  flows: FlowKind[];
  // System shows one overview per area; there are no further views.
  overview: MapView;
};
