import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   remotePatterns: [
  //     'lh3.googleusercontent.com',
  //     'unfinished-pages.s3.us-east-2.amazonaws.com',
  //     'profile.yahoo.com',
  //     's.yimg.com',
  //     'aol.com',
  //     'profile.aol.com',
  //     'apple.com',
  //     'icloud.com',
  //     'outlook.com',
  //     'hotmail.com',
  //     'profile.live.com',
  //   ],
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '', 
        pathname: '**', // This defines the URL pattern you want to allow
      },
      {
        protocol: 'https',
        hostname: 'unfinished-pages.s3.us-east-2.amazonaws.com',
        port: '',
        pathname: '/**', // Allow all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'profile.yahoo.com',
        port: '',
        pathname: '/**', // Allow all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 's.yimg.com',
        port: '',
        pathname: '/**', // Allow all paths under this hostname
      },
      {
        protocol: 'https',
        hostname: 'aol.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'profile.aol.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'apple.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'icloud.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'outlook.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hotmail.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'profile.live.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
