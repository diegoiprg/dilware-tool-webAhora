import type { Metadata } from 'next';

import Script from 'next/script';
import './globals.css';
import { SettingsProvider } from '@/context/SettingsContext';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@/components/Analytics';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';



export const metadata: Metadata = {
  title: 'Chronos Dashboard',
  description: 'A premium full-screen clock and weather dashboard.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chronos',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-body antialiased">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <SettingsProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <Analytics />
              {children}
              <Toaster />
            </ErrorBoundary>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
