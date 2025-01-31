/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bxdxvaioiunezestlkri.supabase.co",
      },
      {
        protocol: "https",
        hostname: "letsenhance.io",
      },
      {
        protocol: "https",
        hostname: "img.taste.com.au",
      },
      {
        protocol: "https",
        hostname: "joinposter.com",
      },
      {
        protocol: "https",
        hostname: "joinposter.comnull",
      },
    ],
  },
};

export default nextConfig;
