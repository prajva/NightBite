import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NightBiteProvider } from '@/context/NightBiteContext';
import { Navbar } from '@/components/Navbar';
import { StockConflictModal } from '@/components/StockConflictModal';
import { StockFreedToast } from '@/components/StockFreedToast';
import { UpiPaymentSheet } from '@/components/UpiPaymentSheet';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';

export const metadata: Metadata = {
  title: 'NightBite • VIT-AP University Hostel Night Mess (10:30 PM - 12:00 AM IST)',
  description: 'Uber-style mobile-first PWA for VIT-AP hostel night mess. Real-time stock counters, atomic race-condition prevention, instant UPI payments, and digital token tracking.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.svg',
    apple: '/icons/icon-192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NightBite',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="bg-black text-white min-h-screen selection:bg-peach selection:text-black">
        <AuthProvider>
          <NightBiteProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 max-w-4xl w-full mx-auto">
                {children}
              </main>
            </div>

            {/* Overlays & Modals */}
            <StockConflictModal />
            <StockFreedToast />
            <UpiPaymentSheet />
            <PwaInstallPrompt />
          </NightBiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
