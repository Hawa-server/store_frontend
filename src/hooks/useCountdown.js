import { useCallback, useEffect, useState } from "react";

export function useCountdown() {
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt <= now) return;
    const timer = setTimeout(() => setNow(Date.now()), 250);
    return () => clearTimeout(timer);
  }, [endsAt, now]);

  const start = useCallback((seconds) => {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
  }, []);

  return { secondsLeft: Math.max(0, Math.ceil((endsAt - now) / 1000)), start };
}

export function waitSeconds(message) {
  const match = /wait (\d+) seconds?/i.exec(message ?? "");
  return match ? Number(match[1]) : null;
}
