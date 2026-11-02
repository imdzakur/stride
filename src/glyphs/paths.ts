// Every glyph is drawn on a 24 x 24 grid with a 1.5 stroke in currentColor.
export const GLYPHS = {
  // rising stairs: app identity
  mark: '<path d="M3 20H9V14H15V8H21"/>',
  // two square brackets with a dot in the middle: structure and architecture
  se: '<path d="M9 5H5V19H9"/><path d="M15 5H19V19H15"/><path d="M11 11H13V13H11Z"/>',
  // a center node linked to four corner nodes: connected AI concepts
  ai: '<circle cx="12" cy="12" r="2"/><path d="M3 3H7V7H3Z"/><path d="M17 3H21V7H17Z"/><path d="M3 17H7V21H3Z"/><path d="M17 17H21V21H17Z"/><path d="M10.6 10.6L7 7"/><path d="M13.4 10.6L17 7"/><path d="M10.6 13.4L7 17"/><path d="M13.4 13.4L17 17"/>',
  // an axis and three rows of different length: tables and data
  data: '<path d="M3 3V21"/><path d="M7 6H21"/><path d="M7 12H16"/><path d="M7 18H11"/>',
  // plus, minus, and a slash: operations
  math: '<path d="M4 9H10"/><path d="M7 6V12"/><path d="M14 17H20"/><path d="M20 4L4 20"/>',
  // a bell curve with a mean line: distribution
  stats: '<path d="M3 19H21"/><path d="M3 19C8 19 9 5 12 5C15 5 16 19 21 19"/><path d="M12 5V19"/>',

  // status: empty box, box half filled from the bottom, and full box with a cut-out check
  'box-empty': '<rect x="4" y="4" width="16" height="16" rx="2"/>',
  'box-half':
    '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12H20V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18Z" fill="currentColor"/>',
  'box-full':
    '<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/><path d="M8 12.5L11 15.5L16 9" style="stroke: var(--color-bg)"/>',

  // actions
  plus: '<path d="M12 5V19"/><path d="M5 12H19"/>',
  minus: '<path d="M5 12H19"/>',
  // four corners pulled inward: fit the view to the frame
  fit: '<path d="M4 9V4H9"/><path d="M15 4H20V9"/><path d="M20 15V20H15"/><path d="M9 20H4V15"/>',
  close: '<path d="M6 6L18 18"/><path d="M18 6L6 18"/>',
  // a baseline and a slanted stylus: rewriting on a line
  edit: '<path d="M4 20H20"/><path d="M7 16L16 7"/><path d="M14 5L18 9"/>',
  trash: '<path d="M5 7H19"/><path d="M10 7V4H14V7"/><path d="M7 7L8 20H16L17 7"/>',
  check: '<path d="M5 12.5L10 17.5L19 7"/>',
  chevron: '<path d="M9 6L15 12L9 18"/>',
  // an open bracket with a line leaving to the right
  logout: '<path d="M10 4H5V20H10"/><path d="M14 8L18 12L14 16"/><path d="M18 12H9"/>',
  // an almond outline with a round pupil: show password
  eye: '<path d="M2 12C5 7 8.5 5 12 5C15.5 5 19 7 22 12C19 17 15.5 19 12 19C8.5 19 5 17 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  // the same eye crossed by a slash: hide password
  'eye-off':
    '<path d="M2 12C5 7 8.5 5 12 5C15.5 5 19 7 22 12C19 17 15.5 19 12 19C8.5 19 5 17 2 12Z"/><circle cx="12" cy="12" r="3"/><path d="M4 4L20 20"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8C8 5.8 9.8 4 12 4C14.2 4 16 5.8 16 8V11"/>',
  desktop:
    '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M12 16V20"/><path d="M8 20H16"/>',

  // navigation
  // three rising bars on a baseline: progress overview
  dashboard: '<path d="M4 20H20"/><path d="M7 20V14"/><path d="M12 20V10"/><path d="M17 20V6"/>',
  // two tracks with position markers: settings
  system:
    '<path d="M4 8H7"/><path d="M11 8H20"/><path d="M4 16H13"/><path d="M17 16H20"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="16" r="2"/>',
  // system areas
  // a coin with a vertical bar through its center: money and markets
  finance:
    '<circle cx="12" cy="12" r="8"/><path d="M12 6.5V17.5"/><path d="M9 10H15"/><path d="M9 14H15"/>',
  // an isometric parcel: goods on the move
  logistics:
    '<path d="M4 8L12 4L20 8V16L12 20L4 16Z"/><path d="M4 8L12 12L20 8"/><path d="M12 12V20"/>',
  // a shopping bag with a handle: buying and selling
  retail: '<path d="M5 8H19L18 20H6Z"/><path d="M9 8V6.5C9 4.6 10.3 3.5 12 3.5S15 4.6 15 6.5V8"/>',
  // a heartbeat line: care and medicine
  health: '<path d="M3 12H7.5L9.5 7L14.5 17L16.5 12H21"/>',
  // a map pin over a dot: places and stays
  travel:
    '<path d="M12 20.5C12 20.5 5.5 14.5 5.5 9.75C5.5 6.2 8.4 3.5 12 3.5S18.5 6.2 18.5 9.75C18.5 14.5 12 20.5 12 20.5Z"/><circle cx="12" cy="9.75" r="2.5"/>',

  // two stacked sheets: grouping
  category: '<rect x="3" y="8" width="12" height="12" rx="1"/><path d="M8 8V4H21V16H15"/>',
} as const;

export type GlyphName = keyof typeof GLYPHS;
