/** @type {import('next').NextConfig} */

const nextConfig = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: process.env.API_URL + '/:path*',
    },
  ],
  redirects: async () => {
    return [
      {
        source: '/users',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
