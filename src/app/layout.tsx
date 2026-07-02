import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Newsreader } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: {
    default: 'Cartas al Futuro — Escríbele a quien serás',
    template: '%s · Cartas al Futuro',
  },
  description:
    'Escribe una carta hoy. Se entregará en el futuro, cuando llegue su momento. A tu futuro yo, o a alguien que quieres.',
};

export const viewport: Viewport = {
  themeColor: '#f7f3ec',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${newsreader.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-dvh bg-paper text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
