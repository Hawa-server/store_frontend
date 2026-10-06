import { createContext, useCallback, useContext, useState } from "react";

const ThemeContext = createContext(null);

function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function saveTheme(theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    return false;
  }
  return true;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(currentTheme);

  const toggleTheme = useCallback(() => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    saveTheme(next);
    setTheme(next);
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
