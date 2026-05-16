const DEFAULT_IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

function normalizeIpfsGateway(gateway: string) {
  // Ensure the gateway ends with `/ipfs/` so we can safely append the CID/path.
  if (!gateway) return "https://ipfs.io/ipfs/";
  if (gateway.endsWith("/ipfs/")) return gateway;
  if (gateway.endsWith("/ipfs")) return `${gateway}/`;
  if (gateway.endsWith("/")) return `${gateway}ipfs/`;
  return `${gateway}/ipfs/`;
}

function stripIpfsPrefix(uri: string) {
  // ipfs://<cid>/<path>
  // ipfs://ipfs/<cid>/<path>
  let rest = uri.replace(/^ipfs:\/\//i, "");
  if (rest.toLowerCase().startsWith("ipfs/")) rest = rest.slice("ipfs/".length);
  return rest;
}

export function resolveMediaUrl(uri: string) {
  const value = (uri || "").trim();
  if (!value) return "";

  if (value.startsWith("data:")) return value;
  if (value.startsWith("blob:")) return value;
  if (/^https?:\/\//i.test(value)) return value;

  if (/^ipfs:\/\//i.test(value)) {
    const gateway = normalizeIpfsGateway(DEFAULT_IPFS_GATEWAY);
    return `${gateway}${stripIpfsPrefix(value)}`;
  }

  if (/^ar:\/\//i.test(value)) {
    return `https://arweave.net/${value.slice("ar://".length)}`;
  }

  // Common case: saved paths like `uploads/foo.png` in DB.
  if (!value.startsWith("/") && (value.startsWith("uploads/") || value.startsWith("public/uploads/"))) {
    return `/${value.replace(/^public\//, "")}`;
  }

  return value;
}

export function toAbsoluteUrl(maybeRelativeUrl: string, baseUrl: string) {
  const value = (maybeRelativeUrl || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

