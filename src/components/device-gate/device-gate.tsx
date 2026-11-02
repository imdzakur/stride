'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { BlockedMessage } from './blocked-message';

type GateStatus = 'pending' | 'allowed' | 'blocked';

const GateContext = createContext<GateStatus>('pending');

const NARROW_QUERY = '(max-width: 1023.98px)';
const TOUCH_ONLY_QUERY = '(pointer: coarse) and (hover: none)';

function evaluate(): GateStatus {
  const narrow = window.matchMedia(NARROW_QUERY).matches;
  const touchOnly = window.matchMedia(TOUCH_ONLY_QUERY).matches;
  return narrow || touchOnly ? 'blocked' : 'allowed';
}

export function useGateAllowed(): boolean {
  return useContext(GateContext) === 'allowed';
}

// The initial status is pending on both server and client, so no data loads
// before the browser checks screen width and pointer type.
export function DeviceGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GateStatus>('pending');

  useEffect(() => {
    const queries = [window.matchMedia(NARROW_QUERY), window.matchMedia(TOUCH_ONLY_QUERY)];
    const update = () => setStatus(evaluate());
    update();
    queries.forEach((query) => query.addEventListener('change', update));
    return () => queries.forEach((query) => query.removeEventListener('change', update));
  }, []);

  // When blocked, children unmount so in-flight requests are cancelled by cleanup.
  if (status === 'blocked') return <BlockedMessage />;
  return <GateContext.Provider value={status}>{children}</GateContext.Provider>;
}
