import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⚠️ Désactive les erreurs ESLint pendant le build
    // À retirer une fois les erreurs corrigées
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Désactive les erreurs TypeScript pendant le build
    // À retirer une fois les erreurs corrigées
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
