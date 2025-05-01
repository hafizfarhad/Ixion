import "./globals.css";
import type { Metadata } from 'next';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Ixion - Identity and Access Management',
  description: 'Secure identity and access management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#1c1c1c] text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}