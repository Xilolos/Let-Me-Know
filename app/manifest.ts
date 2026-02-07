
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Let Me Know',
    short_name: 'LMK',
    description: 'Your personalized AI web watcher',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0b14',
    theme_color: '#0d0b14',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}
