import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import { SplashScreenProvider } from "./components/SplashScreenContext";
import { NetworkChecker } from "./components/NetworkChecker";
import { MiniAppLoader } from "./components/MiniAppLoader";
import AppWrapper from "./components/AppWrapper";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  other: {
    "base:app_id": "68d0be1c1aaf9981934f89a8",
    "talentapp:project_verification":
      "6ce2499a4805221f8a498bf2a01a258554515a2b5845adc2dc007c189d607d1222d5a5d7b3ecaa2d7179e16fd9da5a3a37efb316d8ebc42b5653b4b2fcd7c02d",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-dark" suppressHydrationWarning>
      <head>
        <meta name="base:app_id" content="68d0be1c1aaf9981934f89a8" />
        <meta
          name="talentapp:project_verification"
          content="6ce2499a4805221f8a498bf2a01a258554515a2b5845adc2dc007c189d607d1222d5a5d7b3ecaa2d7179e16fd9da5a3a37efb316d8ebc42b5653b4b2fcd7c02d"
        />
      </head>
      <body className={`${inter.variable} ${sourceCodePro.variable}`}>
        <RootProvider>
          <SplashScreenProvider>
            <Script id="mememint-theme-init" strategy="beforeInteractive">{`
(() => {
  try {
    const key = "mememint:theme";
    const stored = localStorage.getItem(key);
    const theme = (stored === "light" || stored === "dark") ? stored : "dark";
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    root.style.colorScheme = theme;
  } catch (e) {}
})();`}</Script>
            <ThemeProvider>
              <MiniAppLoader />
              <NetworkChecker />
              <AppWrapper>{children}</AppWrapper>
            </ThemeProvider>
          </SplashScreenProvider>
        </RootProvider>
      </body>
    </html>
  );
}
