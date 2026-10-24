import { Suspense, lazy, useEffect, useState } from 'react';

// The chat window is only downloaded for visitors, and only when the assistant is switched on: this small gate asks the server
// once the page has settled, and renders nothing at all when the answer is no.
const Assistant = lazy(() => import('./AssistantChat'));

export default function AssistantGate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ask = () => {
      fetch('/api/assistant')
        .then(r => (r.ok ? (r.json() as Promise<{ enabled?: boolean }>) : null))
        .then(d => { if (!cancelled && d?.enabled === true) setEnabled(true); })
        .catch(() => null);
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    const handle = idle ? idle(ask, { timeout: 4000 }) : window.setTimeout(ask, 2000);
    return () => { cancelled = true; if (!idle) window.clearTimeout(handle); };
  }, []);

  if (!enabled) return null;
  return <Suspense fallback={null}><Assistant /></Suspense>;
}
