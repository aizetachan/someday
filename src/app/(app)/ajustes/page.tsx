'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import {
  subscribeUser,
  updateDisplayNameDoc,
  updateUserSettings,
} from '@/lib/firestore';
import type { AppUser } from '@/lib/types';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function AjustesPage() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!user) return;
    return subscribeUser(user.uid, (p) => {
      setProfile(p);
      if (p) setName((prev) => prev || p.displayName);
    });
  }, [user]);

  if (!user || !profile) return <Spinner label="Cargando ajustes…" />;

  async function toggle(key: 'reminderBeforeDelivery' | 'marketingEmails') {
    if (!user || !profile) return;
    await updateUserSettings(user.uid, { [key]: !profile.settings[key] });
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <h1 className="font-serif text-3xl text-ink">Ajustes</h1>

      <section className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">
          Perfil
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          <Input label="Email" value={profile.email} disabled />
          <Input
            label="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <Button
              size="sm"
              variant="secondary"
              onClick={async () => {
                await updateDisplayNameDoc(user.uid, name.trim());
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }}
            >
              {saved ? 'Guardado ✓' : 'Guardar'}
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10 border-t border-ink-soft/15 pt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-soft">
          Avisos
        </h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={profile.settings.reminderBeforeDelivery}
            onChange={() => void toggle('reminderBeforeDelivery')}
            className="mt-1 accent-[#8C2F1B]"
          />
          <span className="text-sm text-ink">
            Avísame el día antes de que se entregue una carta mía
            <span className="block text-ink-soft">
              «Mañana llega una carta que escribiste el…» — sin spoilers.
            </span>
          </span>
        </label>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={profile.settings.marketingEmails}
            onChange={() => void toggle('marketingEmails')}
            className="mt-1 accent-[#8C2F1B]"
          />
          <span className="text-sm text-ink">
            Novedades del producto
            <span className="block text-ink-soft">Muy de vez en cuando.</span>
          </span>
        </label>
      </section>

      <section className="mt-10 border-t border-ink-soft/15 pt-8">
        <div className="flex flex-col items-start gap-4">
          <Button variant="secondary" onClick={() => void signOut()}>
            Cerrar sesión
          </Button>
          <button
            type="button"
            onClick={() => setDeleteModal(true)}
            className="text-sm text-error underline-offset-4 hover:underline"
          >
            Borrar mi cuenta
          </button>
        </div>
      </section>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Borrar tu cuenta"
      >
        <div className="text-sm leading-relaxed text-ink-soft">
          <p>Esto es lo que pasará:</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5">
            <li>Tus cartas a ti mismo — también las selladas — se eliminarán.</li>
            <li>
              Las cartas selladas para otras personas <strong>se entregarán
              igualmente</strong>: son un compromiso con quien las espera.
            </li>
            <li>Tu cuenta y tus datos se borrarán de forma definitiva.</li>
          </ul>
        </div>
        {deleteError && <p className="mt-4 text-sm text-error">{deleteError}</p>}
        <div className="mt-6 flex gap-3">
          <Button
            variant="danger"
            disabled={deleting}
            onClick={async () => {
              setDeleting(true);
              setDeleteError('');
              try {
                const fn = httpsCallable(getFunctions(undefined, 'europe-west1'), 'deleteAccount');
                await fn();
                await signOut();
              } catch {
                setDeleteError('No se pudo borrar la cuenta. Inténtalo más tarde.');
                setDeleting(false);
              }
            }}
          >
            {deleting ? 'Borrando…' : 'Borrar definitivamente'}
          </Button>
          <Button variant="ghost" onClick={() => setDeleteModal(false)}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
