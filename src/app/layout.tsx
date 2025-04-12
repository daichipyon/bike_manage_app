import '@/styles/globals.css';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'マンション共同駐輪場管理システム',
  description: 'マンションの駐輪場管理のための管理者システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.className} h-full bg-gray-100`}>{children}</body>
    </html>
  );
}