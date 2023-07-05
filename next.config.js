/** @type {import('next').NextConfig} */

const urlJoin = require("url-join");

const nextConfig = {
  rewrites: async () => [
    {
      source: "/api/:path*",
      destination: urlJoin(process.env.API_URL + ":path*"),
    },
  ],
};

module.exports = nextConfig;
