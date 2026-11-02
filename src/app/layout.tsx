import type { Metadata, Viewport } from 'next';
import { Google_Sans_Flex } from 'next/font/google';
import type { ReactNode } from 'react';
import { BackgroundShapes } from '@/components/shape/background-shapes';
import '@/styles/global.css';

// Self-hosted at build time by next/font; the browser never calls Google Fonts.
const googleSansFlex = Google_Sans_Flex({
  subsets: ['latin'],
  variable: '--font-google-sans-flex',
  display: 'swap',
  // Next has no fallback metrics for this family yet; the system fallback is close enough.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: { default: 'Stride', template: '%s | Stride' },
  icons: {
    icon: [
      { url: '/stride-brand-kit/stride-app-icon-blue.svg', type: 'image/svg+xml' },
      { url: '/stride-brand-kit/stride-app-icon-blue.png', type: 'image/png' },
    ],
    apple: '/stride-brand-kit/stride-app-icon-blue.png',
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={googleSansFlex.variable}>
      <body>
        <BackgroundShapes />
        {children}
      </body>
    </html>
  );
}
