/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable experimental features if needed
  },
  images: {
    domains: ['localhost'],
    // Add your Supabase storage domain when configured
  },
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Enable strict mode
  reactStrictMode: true,
  // Optimize for production
  swcMinify: true,
}

module.exports = nextConfig