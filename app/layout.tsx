import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import { SplashScreenProvider } from "./components/SplashScreenContext";
import { NetworkChecker } from "./components/NetworkChecker";
import { MiniAppLoader } from "./components/MiniAppLoader";
import AppWrapper from "./components/AppWrapper";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: minikitConfig.frame.heroImageUrl,
        button: {
          title: `🎨 Generate Memes`,
          action: {
            type: "launch_frame",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl: minikitConfig.frame.splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <SplashScreenProvider>
        <html lang="en">
          <body className={`${inter.variable} ${sourceCodePro.variable}`}>
            <MiniAppLoader />
            <NetworkChecker />
            <AppWrapper>{children}</AppWrapper>
          </body>
        </html>
      </SplashScreenProvider>
    </RootProvider>
  );
}
