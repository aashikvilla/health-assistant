import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nuskha',
    short_name: 'Nuskha',
    description: 'Upload, understand, and manage your family\'s prescriptions with AI',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f7f9ff',
    theme_color: '#0058bd',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      {
        src: '/icons/icon-72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/icons/icon-128.png',
        sizes: '128x128',
        type: 'image/png',
      },
      {
        src: '/icons/icon-144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/icons/icon-152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-384.png',
        sizes: '384x384',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Family Hub',
        url: '/dashboard',
        description: 'Open your family hub',
      },
      {
        name: 'Upload Prescription',
        url: '/upload',
        description: 'Add a new prescription or lab report',
      },
    ],
  }
}
