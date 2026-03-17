import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FlappyStar - Win €10,000 Playing FlappyStar',
    template: '%s | FlappyStar',
  },
  description:
    'Enter the tournament for just €0.50. Play FlappyStar, score high, win €10,000. Free play available.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://flappystar.com'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'FlappyStar',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
