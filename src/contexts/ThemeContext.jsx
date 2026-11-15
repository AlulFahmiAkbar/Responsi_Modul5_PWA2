import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Permanently clean, pure bright white light theme
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      localStorage.removeItem("temubarang:theme");
      localStorage.removeItem("temubarang:theme_mode");
      localStorage.removeItem("temubarang:theme_v3");
      localStorage.setItem("temubarang:theme_v4", "light");
    } catch {}
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  const toggle = () => {
    // Keep it light
    setTheme("light");
    document.documentElement.setAttribute("data-theme", "light");
  };

  return <ThemeContext.Provider value={{ theme: "light", toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
