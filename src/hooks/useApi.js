import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [attempt, setAttempt] = useState(0);
  const lastPath = useRef(path);

  useEffect(() => {
    if (!path) return;
    const samePath = lastPath.current === path;
    lastPath.current = path;
    const controller = new AbortController();
    setState((current) => ({ data: samePath ? current.data : null, error: null, loading: true }));
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState({ data: null, error, loading: false });
      });
    return () => controller.abort();
  }, [path, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, reload };
}
