'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/** Avatar del usuario con menú contextual: Ajustes y Cerrar sesión. */
export function AvatarMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('pointerdown', onOutside);
    return () => window.removeEventListener('pointerdown', onOutside);
  }, [open]);

  if (!user) return null;
  const initial = (user.displayName ?? user.email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Menú de usuario"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-ink-soft/20 bg-seal font-serif text-base text-paper transition-shadow hover:shadow-[var(--shadow-paper)]"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="paper-surface absolute right-0 top-11 z-50 w-52 rounded-[4px] border border-ink-soft/15 py-1.5 shadow-[var(--shadow-paper)]"
          >
            <div className="border-b border-ink-soft/10 px-4 py-2.5">
              <p className="truncate text-sm font-medium text-ink">
                {user.displayName || 'Sin nombre'}
              </p>
              <p className="truncate text-xs text-ink-soft">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push('/ajustes');
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-paper-warm"
            >
              <Settings size={16} strokeWidth={1.5} className="text-ink-soft" />
              Ajustes
            </button>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.push('/');
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-paper-warm"
            >
              <LogOut size={16} strokeWidth={1.5} className="text-ink-soft" />
              Cerrar sesión
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
