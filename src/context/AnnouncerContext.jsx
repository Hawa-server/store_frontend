import { createContext, useCallback, useContext, useRef, useState } from "react";

const AnnouncerContext = createContext(null);

export function AnnouncerProvider({ children }) {
  const [message, setMessage] = useState("");
  const timer = useRef(null);

  const announce = useCallback((text) => {
    clearTimeout(timer.current);
    setMessage("");
    timer.current = setTimeout(() => setMessage(text), 50);
  }, []);

  return (
    <AnnouncerContext.Provider value={announce}>
      {children}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {message}
      </p>
    </AnnouncerContext.Provider>
  );
}

export function useAnnounce() {
  return useContext(AnnouncerContext);
}
