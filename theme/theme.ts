import type { PaletteMode, ThemeOptions } from "@mui/material/styles";

export function getAppThemeOptions(mode: PaletteMode): ThemeOptions {
  const isDark = mode === "dark";

  return {
    palette: {
      mode,
      primary: {
        main: isDark ? "#2bb4a7" : "#0f766e",
        dark: isDark ? "#1f9d91" : "#0b5f59",
        light: isDark ? "#57c8be" : "#2b8f88",
        contrastText: "#ffffff",
      },
      secondary: {
        main: isDark ? "#fb923c" : "#ea580c",
      },
      background: {
        default: isDark ? "#0c1413" : "#eef4f3",
        paper: isDark ? "#121d1b" : "#ffffff",
      },
      text: {
        primary: isDark ? "#e5f1ef" : "#102320",
        secondary: isDark ? "#9eb3af" : "#4b635f",
      },
      divider: isDark ? "#263836" : "#d7e4e2",
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: "var(--font-geist-sans), sans-serif",
      h4: {
        fontWeight: 750,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
      },
      h6: {
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      body2: {
        lineHeight: 1.45,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? "#263836" : "#d7e4e2"}`,
            boxShadow: isDark
              ? "0 4px 22px rgba(0, 0, 0, 0.28)"
              : "0 4px 22px rgba(11, 35, 31, 0.06)",
            borderRadius: 10,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${isDark ? "#263836" : "#d7e4e2"}`,
            boxShadow: isDark
              ? "0 2px 12px rgba(0, 0, 0, 0.24)"
              : "0 2px 12px rgba(11, 35, 31, 0.05)",
            borderRadius: 10,
          },
        },
      },
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#1a2926" : "#f5f9f8",
            borderRadius: 12,
            padding: 2,
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: "0",
            borderRadius: 10,
            paddingInline: 12,
            color: isDark ? "#b4c7c3" : "#4b635f",
            "&.Mui-selected": {
              color: isDark ? "#d9f1ec" : "#0b5f59",
              backgroundColor: isDark ? "#21413c" : "#d8ebe8",
            },
            "&.Mui-selected:hover": {
              backgroundColor: isDark ? "#29524b" : "#cae4e0",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  };
}
