import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NightBiteProvider } from '@/context/NightBiteContext';
import { Navbar } from '@/components/Navbar';
import { RejectionBanner } from '@/components/RejectionBanner';
import { StockConflictModal } from '@/components/StockConflictModal';
import { StockFreedToast } from '@/components/StockFreedToast';
import { UpiPaymentSheet } from '@/components/UpiPaymentSheet';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { AdminLoginModal } from '@/components/AdminLoginModal';

export const metadata: Metadata = {
  title: 'NightBite • University Hostel Night Mess (10:30 PM - 12:00 AM IST)',
  description: 'Mobile-first PWA for late-night university hostel mess orders. Real-time stock counters, atomic race-condition prevention, instant UPI payments, and digital token tracking.',
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
  themeColor: '#09090B',
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
      <body className="bg-night-black text-zinc-100 min-h-screen selection:bg-amber-electric selection:text-black">
        <AuthProvider>
          <NightBiteProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 max-w-4xl w-full mx-auto pt-3">
                <RejectionBanner />
                {children}
              </main>
            </div>

            {/* Overlays & Modals */}
            <StockConflictModal />
            <StockFreedToast />
            <UpiPaymentSheet />
            <AdminLoginModal />
            <PwaInstallPrompt />
          </NightBiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
