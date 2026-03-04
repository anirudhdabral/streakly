"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { PaletteMode, ThemeProvider, createTheme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { getAppThemeOptions } from "@/theme/theme";

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const COLOR_MODE_STORAGE_KEY = "streakly-theme-mode";

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "light",
  toggleMode: () => undefined,
});

export function useColorMode(): ColorModeContextValue {
  return useContext(ColorModeContext);
}

export default function AppThemeProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode: PaletteMode;
}) {
  const [mode, setMode] = useState<PaletteMode>(initialMode);

  useEffect(() => {
    const themeColor = mode === "dark" ? "#0f1a18" : "#f7fcfb";
    window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
    document.cookie = `${COLOR_MODE_STORAGE_KEY}=${mode}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.style.colorScheme = mode;
    document.body.setAttribute("data-theme", mode);
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute("content", themeColor);
  }, [mode]);

  const colorModeValue = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const appTheme = useMemo(() => createTheme(getAppThemeOptions(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorModeValue}>
      <ThemeProvider theme={appTheme} key={mode}>
        <CssBaseline />
        <ConfirmProvider
          defaultOptions={{
            cancellationText: "Cancel",
            confirmationText: "Delete",
            confirmationButtonProps: { color: "error", variant: "contained" },
          }}
        >
          {children}
        </ConfirmProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
