// Whether the topic panel beside the sidebar is open, kept in a cookie so the server
// renders the same state and the panel never jumps after load.
export const PANEL_COOKIE_NAME = 'stride_panel';
export const PANEL_COOKIE_MAX_AGE = 31536000;

export function parsePanelOpen(value: string | undefined): boolean {
  return value !== 'closed';
}

export function serializePanelOpen(open: boolean): string {
  return open ? 'open' : 'closed';
}

// Width of the open topic panel in pixels, dragged by the person and kept in its own cookie.
export const PANEL_WIDTH_COOKIE_NAME = 'stride_panel_width';
export const PANEL_WIDTH_MIN = 192;
export const PANEL_WIDTH_MAX = 448;
export const PANEL_WIDTH_DEFAULT = 240;

export function clampPanelWidth(width: number): number {
  if (!Number.isFinite(width)) return PANEL_WIDTH_DEFAULT;
  return Math.min(PANEL_WIDTH_MAX, Math.max(PANEL_WIDTH_MIN, Math.round(width)));
}

export function parsePanelWidth(value: string | undefined): number {
  if (!value || !/^\d{1,4}$/.test(value)) return PANEL_WIDTH_DEFAULT;
  return clampPanelWidth(Number(value));
}

export function serializePanelWidth(width: number): string {
  return String(clampPanelWidth(width));
}
