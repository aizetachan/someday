import Link from 'next/link';
import type { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="font-serif text-xl text-ink">
          Cartas al Futuro
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Entrar
          </Link>
          <Link
            href="/escribir"
            className="rounded-[4px] bg-seal px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-seal-hover"
          >
            Escribir una carta
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-5 py-8 text-xs text-ink-soft">
        <p>© {new Date().getFullYear()} Cartas al Futuro · Nadie lee tus cartas selladas, ni siquiera nosotros.</p>
        <Link href="/privacidad" className="hover:text-ink">Privacidad</Link>
        <Link href="/terminos" className="hover:text-ink">Términos</Link>
      </footer>
    </div>
  );
}
