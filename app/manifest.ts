import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JotterBlog',
    short_name: 'JotterBlog',
    description: 'Student writing platform and assessment hub',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1B242D',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png', 
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}