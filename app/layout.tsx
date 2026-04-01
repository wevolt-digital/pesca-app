import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MobileNav from '@/components/MobileNav';
import ReportButton from '@/components/ReportButton';
import { Toaster } from '@/components/ui/toaster';
import 'maplibre-gl/dist/maplibre-gl.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://fishintel.com.br'),
  title: {
    default: 'Fishintel — Inteligência de Pesca',
    template: '%s | Fishintel',
  },
  description:
    'Registre capturas, descubra pontos de pesca e conecte-se com pescadores de todo o Brasil.',
  keywords: [
    'pesca', 'pescaria', 'pontos de pesca', 'captura', 'pescadores', 'fishintel',
    'pesca esportiva', 'pesca amadora', 'pesca de rio', 'pesca de lago', 'pesca em represa', 'fly fishing', 'pesca com isca artificial',
    'app de pesca', 'diário de pesca', 'mapa de pesca', 'registro de pesca', 'comunidade de pescadores', 'spots de pesca',
    'pesca no Brasil', 'pesca Pantanal', 'pesca Amazônia', 'pesca em rios',
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Fishintel',
    title: 'Fishintel — Inteligência de Pesca',
    description:
      'Registre capturas, descubra pontos de pesca e conecte-se com pescadores de todo o Brasil.',
    images: [
      {
        url: '/thumb-fishintel.webp',
        width: 1200,
        height: 630,
        alt: 'Fishintel — Inteligência de Pesca',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fishintel — Inteligência de Pesca',
    description:
      'Registre capturas, descubra pontos de pesca e conecte-se com pescadores de todo o Brasil.',
    images: ['/thumb-fishintel.webp'],
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
        <Toaster />
      </body>
    </html>
  );
}