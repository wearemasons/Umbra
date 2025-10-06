import type { Metadata } from 'next';
import { Geist, Geist_Mono, Lobster } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const lobster = Lobster({
  variable: '--font-lobster',
  subsets: ['latin'],
  weight: ['400'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Umbra',
  description:
    'Umbra is a research knowledge management platform that uses AI to collect, summarize, and organize scientific papers into a structured database. Visualize connections, discover hidden patterns, and build a deeper understanding of the scientific landscape with our interactive graph.',

  icons: {
    icon: '/umbraicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${lobster.variable} antialiased  vsc-initialized`}>
        <ThemeProvider defaultTheme="system">
          <ConvexClientProvider>
            {children}
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
