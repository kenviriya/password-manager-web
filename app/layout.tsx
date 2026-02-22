import type {Metadata} from 'next';
import './globals.css';
import {AppProviders} from '@/components/providers/app-providers';

export const metadata: Metadata = {
  title: 'VaultFlow',
  description: 'Session-based password manager frontend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
