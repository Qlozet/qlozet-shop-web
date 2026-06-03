import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import { AppProvider } from '@/context/AppContext';
import { CustomerShell } from '@/components/CustomerShell';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Qlozet | Luxury Tailored E-Commerce & AI Virtual try-on',
  description: 'Experience bespoke traditional agbadas, custom clothing, fabric yardage, accessories, and AI measurement prediction try-on models at Qlozet.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="bg-[#F0F0F0] text-[#1a1a1a]">
        <AppProvider>
          <CustomerShell>
            {children}
          </CustomerShell>
        </AppProvider>
      </body>
    </html>
  );
}
