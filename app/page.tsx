import { Metadata } from 'next';
import { minikitConfig } from '../minikit.config';
import { toAbsoluteUrl } from './utils/mediaUrls';
import HomeClient from './HomeClient';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    minikitConfig.frame.homeUrl ||
    "http://localhost:3000";
  const frameImageUrl = toAbsoluteUrl(minikitConfig.frame.heroImageUrl, baseUrl);
  const splashImageUrl = toAbsoluteUrl(minikitConfig.frame.splashImageUrl, baseUrl);

  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    other: {
      "base:app_id": "68d0be1c1aaf9981934f89a8",
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: frameImageUrl,
        button: {
          title: `🎨 Generate Memes`,
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

export default function Home() {
  return <HomeClient />;
}
