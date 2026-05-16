/**
 * MiniApp configuration object for Farcaster MiniApps.
 * Docs: https://miniapps.farcaster.xyz/docs/guides/publishing
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjEwMDEyMDYsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhiMWVDNUU3N0VkYzY0ZWE4QzdkMDczNDQ1NzA3ZDBFMzFiNTg3NjhmIn0",
    payload:
      "eyJkb21haW4iOiJtZW1lbWludC1jaGkudmVyY2VsLmFwcCJ9",
    signature:
      "ryYbA3uwYs1+xxB4I19HB/J5wgIv15/FRzhK+R329tBWI4LskyTfOPlGNqUTzuPk8TXe0H94X7tHOF2b4rypqRs="
  },

  baseBuilder: {
    allowedAddresses: ["0xEbd001b69E71Df928a7581157eE41F7e2F56d685"],
    noindex: false
  },

  frame: {
    version: "1",
    name: "Mememint",
    buttonTitle: "Generate Meme",
    subtitle: "A beautiful generator",
    description: "A beautiful meme generator for Farcaster",
    screenshotUrls: [
      "https://mememint-chi.vercel.app/screenshot.jpeg",
      "https://mememint-chi.vercel.app/hero.png",
      "https://mememint-chi.vercel.app/splash.png"
    ],
    iconUrl: "https://mememint-chi.vercel.app/icon.png",
    splashImageUrl: "https://mememint-chi.vercel.app/uploads/the-emerald-degenerate.png",
    splashBackgroundColor: "#0f172a",
    homeUrl: "https://mememint-chi.vercel.app",
    aspectRatio: "square",
    webhookUrl: "https://mememint-chi.vercel.app/api/webhook",
    tags: ["social", "generator", "meme"],
    imageUrl: "https://mememint-chi.vercel.app/uploads/the-emerald-degenerate.png",
    tagline: "Position text anywhere",
    primaryCategory: "social",
    heroImageUrl: "https://mememint-chi.vercel.app/uploads/the-emerald-degenerate.png",
    ogTitle: "Mememint - Generate Epic Memes",
    ogDescription: "Position text anywhere on images. Easy and fun!",
    ogImageUrl: "https://mememint-chi.vercel.app/uploads/the-emerald-degenerate.png",
    castShareUrl: "https://mememint-chi.vercel.app",
    noindex: false // ✅ ensures your app appears in Farcaster search
  }
};


