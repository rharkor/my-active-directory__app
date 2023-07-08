/** @type {import('next').NextConfig} */

const nextConfig = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: process.env.API_URL + '/:path*',
    },
  ],
};

module.exports = nextConfig;
