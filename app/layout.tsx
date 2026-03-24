import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MobileNav from '@/components/MobileNav';
import ReportButton from '@/components/ReportButton';
import 'maplibre-gl/dist/maplibre-gl.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fishintel - Inteligência de Pesca',
  description:
    'Plataforma colaborativa para pescadores brasileiros. Registre suas pescas, descubra novos pontos e conecte-se com outros pescadores.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <main className="pb-24 md:pb-0">{children}</main>
        <MobileNav />
        <ReportButton />
      </body>
    </html>
  );
}