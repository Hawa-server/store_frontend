import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "announcementClosed";
const AnnouncementContext = createContext(null);

function readClosed() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeClosed(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    return false;
  }
  return true;
}

export function AnnouncementProvider({ children }) {
  const [announcement, setAnnouncement] = useState(null);
  const [closedId, setClosedId] = useState(readClosed);

  useEffect(() => {
    const controller = new AbortController();
    api("/api/announcement", { signal: controller.signal, authRedirect: false })
      .then((data) => setAnnouncement(data.announcement ?? null))
      .catch(() => setAnnouncement(null));
    return () => controller.abort();
  }, []);

  const close = useCallback(() => {
    if (!announcement) return;
    writeClosed(announcement.id);
    setClosedId(announcement.id);
  }, [announcement]);

  const value = useMemo(
    () => ({
      announcement,
      visible: Boolean(announcement && announcement.id !== closedId),
      close,
    }),
    [announcement, closedId, close],
  );

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
}

export function useAnnouncement() {
  return useContext(AnnouncementContext);
}
