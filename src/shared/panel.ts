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
