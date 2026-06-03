import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow other computers on the WiFi to fetch data from Next.js server
  allowedDevOrigins: ['192.168.3.25', 'http://192.168.3.25:3000', '192.168.3.25:3000', 'localhost:3000', '192.168.3.64', 'http://192.168.3.64:3000', '192.168.3.64:3000', '169.254.16.1', 'http://169.254.16.1:3000', '169.254.16.1:3000'],
  
  // Restrict build to a single CPU to prevent EAGAIN (max processes exceeded) errors on shared hosting
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  
  // Configure Turbopack root to fix Windows path length issues
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
