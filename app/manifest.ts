// {
//   "name": "MyWebSite",
//   "short_name": "MySite",
//   "icons": [
//     {
//       "src": "/web-app-manifest-192x192.png",
//       "sizes": "192x192",
//       "type": "image/png",
//       "purpose": "maskable"
//     },
//     {
//       "src": "/web-app-manifest-512x512.png",
//       "sizes": "512x512",
//       "type": "image/png",
//       "purpose": "maskable"
//     }
//   ],
//   "theme_color": "#ffffff",
//   "background_color": "#ffffff",
//   "display": "standalone"
// }

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
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}