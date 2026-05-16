import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: [
    'thread-stream',
    'pino-pretty',
    'lokijs',
    'encoding',
    'tape',
    'tap',
    'why-is-node-running',
    'fastbench',
    'desm',
    'pino-elasticsearch'
  ],
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
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Exclude problematic thread-stream files
    config.externals.push(/^thread-stream\/test\/.*$/);
    config.externals.push('thread-stream/bench.js');
    config.externals.push('thread-stream/LICENSE');
    // Fix MetaMask SDK React Native dependency issue
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": require.resolve("./__mocks__/@react-native-async-storage-async-storage.js"),
    };
    return config;
  },
};

export default nextConfig;
