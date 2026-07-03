import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthCta } from '@/components/auth/AuthCta';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-5 sm:py-5">
        <Link href="/" className="shrink-0 font-serif text-lg text-ink sm:text-xl">
          Cartas al Futuro
        </Link>
        <nav className="flex items-center gap-3 sm:gap-4">
          <AuthCta
            redirectTo="/cartas"
            mode="login"
            className="text-sm text-ink-soft transition-colors hover:text-ink"
          >
            Entrar
          </AuthCta>
          <AuthCta
            redirectTo="/escribir"
            mode="register"
            className="whitespace-nowrap rounded-[4px] bg-seal px-3.5 py-2 text-sm font-medium text-paper transition-colors hover:bg-seal-hover sm:px-4"
          >
            <span className="sm:hidden">Escribir</span>
            <span className="hidden sm:inline">Escribir una carta</span>
          </AuthCta>
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
