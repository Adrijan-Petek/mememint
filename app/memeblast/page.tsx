import type { Metadata } from "next";
import { minikitConfig } from "../../minikit.config";
import { toAbsoluteUrl } from "../utils/mediaUrls";
import GameClient from "../game/GameClient";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    minikitConfig.frame.homeUrl ||
    "http://localhost:3000";
  const frameImageUrl = toAbsoluteUrl(minikitConfig.frame.heroImageUrl, baseUrl);
  const splashImageUrl = toAbsoluteUrl(minikitConfig.frame.splashImageUrl, baseUrl);

  return {
    title: "MemeBlast - " + minikitConfig.frame.name,
    description: "Dodge falling objects and auto-shoot your way to a high score.",
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: frameImageUrl,
        button: {
          title: "Play MemeBlast",
          action: {
            type: "launch_frame",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
    },
  };
}

export default function MemeBlastPage() {
  return <GameClient />;
}
