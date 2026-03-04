import type { ThemeOptions } from "@mui/material/styles";

export const appThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      dark: "#0b5f59",
      light: "#2b8f88",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ea580c",
    },
    background: {
      default: "#eef4f3",
      paper: "#ffffff",
    },
    text: {
      primary: "#102320",
      secondary: "#4b635f",
    },
    divider: "#d7e4e2",
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
          border: "1px solid #d7e4e2",
          boxShadow: "0 4px 22px rgba(11, 35, 31, 0.06)",
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #d7e4e2",
          boxShadow: "0 2px 12px rgba(11, 35, 31, 0.05)",
          borderRadius: 10,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f9f8",
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
          color: "#4b635f",
          "&.Mui-selected": {
            color: "#0b5f59",
            backgroundColor: "#d8ebe8",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#cae4e0",
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
