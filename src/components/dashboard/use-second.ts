'use client';

import { useSyncExternalStore } from 'react';

const SECOND = 1000;

function subscribe(onChange: () => void): () => void {
  let interval: ReturnType<typeof setInterval> | undefined;
  // Align ticks to whole seconds so every countdown changes together.
  const timeout = setTimeout(
    () => {
      onChange();
      interval = setInterval(onChange, SECOND);
    },
    SECOND - (Date.now() % SECOND),
  );
  return () => {
    clearTimeout(timeout);
    if (interval) clearInterval(interval);
  };
}

const getSnapshot = () => Math.floor(Date.now() / SECOND) * SECOND;

// null on the server and during hydration, so no clock value is rendered twice.
const getServerSnapshot = () => null;

export function useSecond(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
