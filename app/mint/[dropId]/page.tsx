import { Metadata } from 'next';
import { minikitConfig } from '../../../minikit.config';
import { toAbsoluteUrl } from '../../utils/mediaUrls';

function formatPrice(priceWei: string) {
  try {
    const s = (BigInt(priceWei) / BigInt(10 ** 18)).toString();
    const n = parseFloat(s);
    if (n === 0) return '0';
    if (n >= 0.001) return n.toFixed(3);
    return n.toFixed(6).replace(/\.0+$|(?<=\.[0-9]*?)0+$/,'').replace(/\.$/, '');
  } catch (e) {
    return '0';
  }
}

export async function generateMetadata({ params }: { params: { dropId: string } }): Promise<Metadata> {
  const baseUrl =
    process.env.NEXT_PUBLIC_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    minikitConfig.frame.homeUrl ||
    "http://localhost:3000";
  const frameImageUrl = toAbsoluteUrl(minikitConfig.frame.heroImageUrl, baseUrl);
  const splashImageUrl = toAbsoluteUrl(minikitConfig.frame.splashImageUrl, baseUrl);

  try {

    const response = await fetch(`${baseUrl}/api/db/drops`, { next: { revalidate: 10 } });
    const data = await response.json();
    const drop = data.drops?.find((d: any) => d.drop_id === parseInt(params.dropId));

    if (!drop) {
      return {
        title: 'NFT Not Found',
        description: 'The requested NFT drop was not found.',
        openGraph: {
          title: 'NFT Not Found',
          description: 'The requested NFT drop was not found.',
          images: [frameImageUrl],
        },
        twitter: {
          card: "summary_large_image",
          title: 'NFT Not Found',
          description: 'The requested NFT drop was not found.',
          images: [frameImageUrl],
        },
        other: {
          "fc:miniapp": JSON.stringify({
            version: "1",
            imageUrl: frameImageUrl,
            button: {
              title: `🎨 Mint NFTs`,
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

    const description = drop.description + " Price: " + formatPrice(drop.price_wei) + " ETH";

    return {
      title: drop.name,
      description,
      openGraph: {
        title: drop.name,
        description,
        images: [frameImageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title: drop.name,
        description,
        images: [frameImageUrl],
      },
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
          },        }),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'Failed to load NFT metadata.',
      openGraph: {
        title: 'Error',
        description: 'Failed to load NFT metadata.',
        images: [frameImageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title: 'Error',
        description: 'Failed to load NFT metadata.',
        images: [frameImageUrl],
      },
      other: {
        "fc:miniapp": JSON.stringify({
          version: "1",
          imageUrl: frameImageUrl,
          button: {
            title: `🎨 Mint NFTs`,
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
}

export default function NFTPage({ params }: { params: { dropId: string } }) {
  return (
    <div className="min-h-screen bg-app-bg font-sans relative before:absolute before:inset-0 before:bg-hero-bg before:pointer-events-none before:opacity-80 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-lg md:text-xl font-extrabold bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
          NFT Drop #{params.dropId}
        </h1>
        <p className="text-white/70 text-lg">
          This NFT is shareable as a frame. Visit the mint page to purchase.
        </p>
        <a href="/mint" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go to Mint Page
        </a>
      </div>
    </div>
  );
}
