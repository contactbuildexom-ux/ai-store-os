import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: false,

  // Speed aur SEO
  compress: true,
  poweredByHeader: false, // "X-Powered-By: Next.js" header hata deta hai

  images: {
    // Modern, halke formats (Core Web Vitals / LCP behtar hota hai)
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // optimized images 30 din cache
  },

  async headers() {
    return [
      {
        // Saari pages par basic safety headers
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // public/ folder ki images ke liye cache (repeat visits fast honge)
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|ico)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;