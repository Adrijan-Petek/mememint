import { Metadata } from 'next';
import { minikitConfig } from '../../minikit.config';
import { toAbsoluteUrl } from '../utils/mediaUrls';
import MintClient from './MintClient';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    minikitConfig.frame.homeUrl ||
    "http://localhost:3000";
  const frameImageUrl = toAbsoluteUrl(minikitConfig.frame.heroImageUrl, baseUrl);
  const splashImageUrl = toAbsoluteUrl(minikitConfig.frame.splashImageUrl, baseUrl);

  return {
    title: "Mint NFTs - " + minikitConfig.frame.name,
    description: "Discover and mint unique NFTs from our exclusive drops.",
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: frameImageUrl,
        button: {
          title: `🎨 Mint`,
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

export default function Mint() {
  return <MintClient />;
}
