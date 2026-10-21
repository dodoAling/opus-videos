import { useCallback, useEffect, useState } from 'react';
import type { Ops, OpsStatus } from './types';

const KEY = 'opus-videos-ops';

function read(): Ops {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function useOps() {
  const [ops, setOps] = useState<Ops>(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(ops));
  }, [ops]);

  const setStatus = useCallback((slug: string, status?: OpsStatus) => {
    setOps(prev => {
      const next = { ...prev };
      if (!status) delete next[slug];
      else next[slug] = { ...next[slug], status, ts: Date.now() };
      return next;
    });
  }, []);

  const setNote = useCallback((slug: string, note: string) => {
    setOps(prev => ({
      ...prev,
      [slug]: { ...prev[slug], note, ts: Date.now() },
    }));
  }, []);

  const exportOps = useCallback(() => {
    const blob = new Blob([JSON.stringify(ops, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `opus-videos-ops-${Object.keys(ops).length}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [ops]);

  return { ops, setStatus, setNote, exportOps };
}
