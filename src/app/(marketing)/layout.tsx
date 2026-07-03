import Link from 'next/link';
import type { ReactNode } from 'react';
import { AuthCta } from '@/components/auth/AuthCta';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="desk-bg flex min-h-dvh flex-col">
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-5 pb-2 pt-[calc(18px+env(safe-area-inset-top))]">
        <Link
          href="/"
          className="shrink-0 text-[13px] font-medium uppercase tracking-[0.22em] text-gris-postal transition-colors hover:text-ink"
        >
          Cartas al Futuro
        </Link>
        <nav className="flex items-center gap-4 sm:gap-5">
          <AuthCta
            redirectTo="/cartas"
            mode="login"
            className="text-sm text-[#6f6455] transition-colors hover:text-ink"
          >
            Entrar
          </AuthCta>
          <AuthCta
            redirectTo="/escribir"
            mode="register"
            className="whitespace-nowrap rounded-full bg-gradient-to-b from-[#3a3226] to-[#241e15] px-5 pb-2.5 pt-2 font-hand text-lg font-semibold leading-none text-[#f6f1e6] shadow-[0_1px_3px_rgba(36,30,21,0.3),0_6px_14px_rgba(36,30,21,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5"
          >
            <span className="sm:hidden">✎ Escribir</span>
            <span className="hidden sm:inline">✎ Escribir una carta</span>
          </AuthCta>
        </nav>
      </header>
      <main className="relative z-[1] flex-1">{children}</main>
      <footer className="relative z-[1] mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-5 py-8 text-xs text-[#6f6455]">
        <p>© {new Date().getFullYear()} Cartas al Futuro · Nadie lee tus cartas selladas, ni siquiera nosotros.</p>
        <Link href="/privacidad" className="hover:text-ink">Privacidad</Link>
        <Link href="/terminos" className="hover:text-ink">Términos</Link>
      </footer>
    </div>
  );
}
