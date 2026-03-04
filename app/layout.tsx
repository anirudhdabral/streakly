import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import AppThemeProvider from "@/theme/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streakly",
  description: "Streakly is an offline-first habit tracker built with Next.js and Material UI.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieMode = cookieStore.get("streakly-theme-mode")?.value;
  const initialMode = cookieMode === "dark" || cookieMode === "light" ? cookieMode : "light";
  const initialThemeColor = initialMode === "dark" ? "#0c1413" : "#eef4f3";

  return (
    <html lang="en" data-theme={initialMode} style={{ colorScheme: initialMode }}>
      <head>
        <meta name="theme-color" content={initialThemeColor} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppThemeProvider initialMode={initialMode}>{children}</AppThemeProvider>
      </body>
    </html>
  );
}

