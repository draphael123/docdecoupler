import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doc Decoupler',
  description: 'Compare PDF documents and identify shared vs. unique content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

