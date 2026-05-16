/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '192.168.3.25',
    'http://192.168.3.25:3000',
    'localhost:3000',
    '169.254.16.1',
    '192.168.3.38',
    '192.168.3.64',
    '192.168.3.54',
    '192.168.3.99'
  ],
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  turbopack: {}
};

module.exports = nextConfig;
