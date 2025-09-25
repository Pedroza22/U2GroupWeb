/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  reactStrictMode: true,
  async rewrites() {
    // En desarrollo: apunta a localhost
    // En producción: apunta a Render
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://u2-group-backend.onrender.com'
      : 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*/',
        destination: `${backendUrl}/api/:path*/`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
