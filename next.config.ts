import type { NextConfig } from "next";

/**
 * GitHub project Pages serves the site at /KuscuogluHafriyat.
 * Local `next dev` leaves the prefix empty. Set NEXT_PUBLIC_BASE_PATH
 * only for the static export that Pages will host.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: { position: "top-right" },
  ...(basePath
    ? {
        basePath,
      }
    : {}),
};

export default nextConfig;
