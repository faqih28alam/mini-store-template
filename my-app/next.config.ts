import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jwrusmbikntjbjckdmqp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/products',
        permanent: true, // This makes it a 301 redirect
      },
    ]
  },
};

export default nextConfig;

// reference: https://nextjs.org/docs/app/api-reference/components/image#remotepatterns