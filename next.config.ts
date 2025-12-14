import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/templets/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/templets/:path*',
        destination: '/api/static/:path*',
      },
    ];
  },
  turbopack: {},
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Fix MetaMask SDK React Native dependency issue
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": require.resolve("./__mocks__/@react-native-async-storage-async-storage.js"),
    };
    return config;
  },
};

export default nextConfig;
