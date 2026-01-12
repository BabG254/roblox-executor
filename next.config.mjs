/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel specific optimizations
  output: 'standalone',
  serverExternalPackages: ['@prisma/client'],
  // Inject Vercel Postgres URL as DATABASE_URL fallback
  env: {
    DATABASE_URL: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL,
  },
  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ]
      }
    ]
  }
}

export default nextConfig
