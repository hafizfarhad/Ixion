import "./globals.css";
import type { Metadata } from 'next';

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
        {children}
      </body>
    </html>
  );
}