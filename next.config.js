/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // No ESLint config is bundled with this starter; avoid next build
    // trying to prompt for one in a non-interactive environment.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
