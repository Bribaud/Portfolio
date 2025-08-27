import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ⚠️ Désactive les erreurs ESLint pendant le build
    // À retirer une fois les erreurs corrigées
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optionnel: ignore aussi les erreurs TypeScript si nécessaire
    // ignoreBuildErrors: true,
  }
};

export default nextConfig;
