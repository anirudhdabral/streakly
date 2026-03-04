"use client";

import { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { appThemeOptions } from "@/theme/theme";

const appTheme = createTheme(appThemeOptions);

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={appTheme}>
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
  );
}
