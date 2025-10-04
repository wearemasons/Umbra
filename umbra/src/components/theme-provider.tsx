"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type Coords = { x: number; y: number };

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: (coords?: Coords) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client
    setMounted(true);
    const storedTheme =
      typeof window !== "undefined"
        ? (localStorage.getItem(storageKey) as Theme)
        : null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      setTheme(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  const applyTheme = (newTheme: Theme) => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    let appliedTheme = newTheme;
    if (newTheme === "system") {
      appliedTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    root.classList.add(appliedTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme, mounted, storageKey]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleThemeToggle = (coords?: Coords) => {
    const newTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // If no view transitions support or reduced motion, just change theme
    if (!document.startViewTransition || prefersReducedMotion) {
      handleThemeChange(newTheme);
      return;
    }

    // Set coordinates for the radar animation
    if (coords) {
      root.style.setProperty("--x", `${coords.x}px`);
      root.style.setProperty("--y", `${coords.y}px`);
    }

    // Start the view transition with radar effect
    document.startViewTransition(() => {
      handleThemeChange(newTheme);
    });
  };

  const value = {
    theme,
    setTheme: handleThemeChange,
    toggleTheme: handleThemeToggle,
  };

  // Prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
