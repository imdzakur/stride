import type { MapNode, SystemMap } from './types';

// Source: Logistics Systems master (00_Master_Logistics.md, edition 1.0) and the internal
// contracts (INT-01 to INT-40) in document 27. Each operations box groups the domains named
// in its subtitle, so all 26 domains are covered; links not written in the documents are
// marked conceptual.

const GROUP_LABELS: Record<string, string> = {
  planning: 'Planning and orders',
  warehouse: 'Warehouse and inventory',
  transport: 'Transport and delivery',
  controls: 'Trade and cargo controls',
  returns: 'Returns and public programs',
  oversight: 'Finance and oversight',
};

// A group of logistics domains, listed by number in the subtitle.
function group(id: string, col: number, row: number, subtitle: string): MapNode {
  return { id, title: GROUP_LABELS[id] ?? id, subtitle, kind: 'operations', col, row };
}

export const LOGISTICS_MAP: SystemMap = {
  area: 'logistics',
  kinds: [
    { id: 'party', label: 'Parties and outside systems', tone: 'periwinkle' },
    { id: 'operations', label: 'Operations', tone: 'sand' },
    { id: 'commercial', label: 'Commercial and finance', tone: 'aqua' },
    { id: 'control', label: 'Holds and safety', tone: 'rose' },
    { id: 'oversight', label: 'Oversight and shared services', tone: 'mint' },
  ],
  flows: [
    { id: 'goods', label: 'Physical goods', tone: 'peach' },
    { id: 'instruction', label: 'Instruction', tone: 'sky' },
    { id: 'data', label: 'Data and evidence', tone: 'ink' },
    { id: 'authority', label: 'Authority decision', tone: 'rose' },
    { id: 'finance', label: 'Financial flow', tone: 'mint' },
  ],
  overview: {
    layers: ['Parties', 'Operations', 'Controls and finance', 'Outside systems', 'Shared services'],
    nodes: [
      { id: 'suppliers', title: 'Suppliers', kind: 'party', col: 0, row: 0 },
      { id: 'customers', title: 'Customers and shippers', kind: 'party', col: 1, row: 0 },
      {
        id: 'carriers',
        title: 'Carriers and terminals',
        subtitle: 'Road, ocean, air',
        kind: 'party',
        col: 2,
        row: 0,
      },
      { id: 'recipients', title: 'Recipients', kind: 'party', col: 3, row: 0 },
      {
        id: 'authorities',
        title: 'Authorities',
        subtitle: 'Customs, safety, health',
        kind: 'party',
        col: 3,
        row: 2,
      },
      group('warehouse', 0, 1, 'Domains 04-06, 19, 20'),
      group('planning', 1, 1, 'Domains 01-03, 21'),
      group('transport', 2, 1, 'Domains 07-13, 17'),
      group('returns', 3, 1, 'Domains 18, 22'),
      { ...group('controls', 2, 2, 'Domains 14-16, 25'), kind: 'control' },
      { ...group('oversight', 1, 2, 'Domains 23, 24, 26'), kind: 'commercial' },
      {
        id: 'finance-systems',
        title: 'Finance Systems',
        subtitle: 'Ledger, tax, payments',
        kind: 'party',
        col: 1,
        row: 3,
      },
      {
        id: 'hr',
        title: 'HR systems',
        subtitle: 'Employment and training',
        kind: 'party',
        col: 2,
        row: 3,
      },
      {
        id: 'identity',
        title: 'Identity and access',
        subtitle: 'Scoped for every flow',
        kind: 'oversight',
        col: 0,
        row: 4,
      },
      {
        id: 'integration',
        title: 'Integration and evidence',
        subtitle: 'Acknowledge and retry',
        kind: 'oversight',
        col: 1,
        row: 4,
      },
      {
        id: 'offline',
        title: 'Offline capture',
        subtitle: 'Queue and conflict rules',
        kind: 'oversight',
        col: 2,
        row: 4,
      },
      {
        id: 'ai',
        title: 'Decision support',
        subtitle: 'AI, needs approval',
        kind: 'oversight',
        col: 3,
        row: 4,
      },
    ],
    edges: [
      {
        from: 'suppliers',
        to: 'warehouse',
        flow: 'goods',
        label: 'Inbound goods',
        source: 'Master 11',
      },
      {
        from: 'customers',
        to: 'planning',
        flow: 'instruction',
        label: 'Orders',
        conceptual: true,
      },
      {
        from: 'carriers',
        to: 'transport',
        flow: 'data',
        label: 'Carrier events',
        source: 'Doc 27, section 3',
      },
      {
        from: 'authorities',
        to: 'controls',
        flow: 'authority',
        label: 'Official responses',
        source: 'Master 13',
      },
      {
        from: 'planning',
        to: 'warehouse',
        flow: 'data',
        label: 'Expected inbound',
        source: 'INT-03',
      },
      {
        from: 'warehouse',
        to: 'transport',
        flow: 'goods',
        label: 'Dispatch ready',
        source: 'INT-08',
      },
      {
        from: 'planning',
        to: 'transport',
        flow: 'instruction',
        label: 'Partner assignment',
        source: 'INT-31',
      },
      {
        from: 'transport',
        to: 'planning',
        flow: 'data',
        label: 'Delivery outcome',
        source: 'INT-12',
      },
      {
        from: 'transport',
        to: 'recipients',
        flow: 'goods',
        label: 'Delivery',
        conceptual: true,
      },
      {
        from: 'recipients',
        to: 'returns',
        flow: 'goods',
        label: 'Returned goods',
        conceptual: true,
      },
      {
        from: 'returns',
        to: 'warehouse',
        flow: 'data',
        label: 'Disposition',
        source: 'INT-15',
      },
      {
        from: 'controls',
        to: 'transport',
        flow: 'authority',
        label: 'Release eligibility',
        source: 'INT-26',
      },
      {
        from: 'transport',
        to: 'oversight',
        flow: 'data',
        label: 'Service evidence',
        source: 'INT-35',
      },
      {
        from: 'oversight',
        to: 'finance-systems',
        flow: 'data',
        label: 'Charge entitlement',
        source: 'Doc 27, section 6',
      },
      {
        from: 'finance-systems',
        to: 'oversight',
        flow: 'finance',
        label: 'Invoice, settlement refs',
        source: 'Doc 27, section 3',
      },
      {
        from: 'hr',
        to: 'controls',
        flow: 'data',
        label: 'Training refs',
        source: 'Doc 27, section 3',
      },
      {
        from: 'offline',
        to: 'transport',
        flow: 'data',
        label: 'Field events',
        conceptual: true,
      },
      {
        from: 'ai',
        to: 'oversight',
        flow: 'data',
        label: 'Recommendations',
        conceptual: true,
      },
    ],
  },
};
