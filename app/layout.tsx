import './globals.css';
import { LocationProvider } from '@/lib/LocationContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://hometownhub.app'),
  title: {
    default: 'Hometown Hub — Where Your Roots Stay Connected',
    template: '%s | Hometown Hub',
  },
  description: 'Reconnect with your hometown through local communities, oral histories, 3D interactive location dioramas, memory maps, alumni networks, and living cultural traditions.',
  keywords: [
    'hometown community',
    'local community',
    'hometown memories',
    'heritage landmarks',
    'local events',
    'community platform',
    'people from hometown',
    'local culture',
    'hometown stories',
    '3D hometown diorama',
    'Scrapbook Map',
  ],
  authors: [{ name: 'Hometown Hub Team' }],
  creator: 'Hometown Hub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hometownhub.app',
    title: 'Hometown Hub — Where Your Roots Stay Connected',
    description: 'Discover local communities, oral histories, 3D hometown dioramas, and alumni networks.',
    siteName: 'Hometown Hub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hometown Hub — Where Your Roots Stay Connected',
    description: 'Discover local communities, oral histories, 3D hometown dioramas, and alumni networks.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <LocationProvider>
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </LocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
