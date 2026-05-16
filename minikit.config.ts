/**
 * MiniApp configuration object for Farcaster MiniApps.
 * Docs: https://miniapps.farcaster.xyz/docs/guides/publishing
 */
export const minikitConfig = {
  accountAssociation: {
    header:
      "eyJmaWQiOjEwMDEyMDYsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhCMkRCZTdkQUI2ZEUzMGRiYzYyNjc0MzA4RUQ2MEYyMTVjNWMxRkNCIn0",
    payload:
      "eyJkb21haW4iOiJtZW1lbWludC1vbmUudmVyY2VsLmFwcCJ9",
    signature:
      "MHhjZDU3NDk3OWEzNDE1YTFiMWFlY2ZhMmZhOGYwYjIxYjQzNTAyYjIwYjdmZjEwYzI5MWJlYzUzZTVkMjJiOWNjNDY3Zjk2ZGQ3OWRhNjU2ZTIzZjlhY2Y4N2Y1ZGRmOWQwMDdjMzkyOWEzYzU2MjAyNjMwYjBmNWYzMzI5MWJhOTFi"
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


