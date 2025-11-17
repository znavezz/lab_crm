import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle optional dependencies for Apollo Server
    // Mark as external so webpack doesn't try to bundle it
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('@yaacovcr/transform');
      } else {
        config.externals = [config.externals, '@yaacovcr/transform'];
      }
    }
    return config;
  },
};

export default nextConfig;
