/** @type {import('next').NextConfig} */
const nextConfig = {
  // Control plane API URL — used for SSR data fetching
  env: {
    PLATFORM_URL: process.env.PLATFORM_URL ?? "http://localhost:9090",
    PLATFORM_API_KEY: process.env.PLATFORM_API_KEY ?? "change-me-in-production",
  },
};

export default nextConfig;
