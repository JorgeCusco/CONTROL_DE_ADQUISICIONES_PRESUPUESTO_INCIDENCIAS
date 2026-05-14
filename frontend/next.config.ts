import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow other computers on the WiFi to fetch data from Next.js server
  allowedDevOrigins: ['192.168.3.64', 'http://192.168.3.64:3000', '192.168.3.64:3000', 'localhost:3000', '169.254.16.1', 'http://169.254.16.1:3000', '169.254.16.1:3000'],
  
  // Configure Turbopack root to fix Windows path length issues
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
