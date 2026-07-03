'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'login' | 'register';

/**
 * Popup de acceso: registro o login sin salir de la landing.
 * La plataforma requiere cuenta para usarse — este modal es la puerta.
 */
export function AuthModal({
  open,
  onClose,
  redirectTo = '/cartas',
  initialMode = 'register',
}: {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
  initialMode?: Mode;
}) {
  const { signInEmail, signUpEmail, signInGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(fn: () => Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await fn();
      onClose();
      router.push(redirectTo);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(
        code === 'auth/email-already-in-use'
          ? 'Ya existe una cuenta con ese email. Prueba a entrar.'
          : code === 'auth/weak-password'
            ? 'La contraseña debe tener al menos 6 caracteres.'
            : code === 'auth/invalid-credential' || code === 'auth/wrong-password'
              ? 'Email o contraseña incorrectos.'
              : 'No se pudo completar. Inténtalo de nuevo.',
      );
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5 text-center">
        <h2 className="font-serif text-2xl text-ink">
          {mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          {mode === 'register'
            ? 'Para que tus cartas sepan volver a ti.'
            : 'Tus cartas siguen viajando.'}
        </p>
      </div>

      <form
        className="flex flex-col gap-3.5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(() =>
            mode === 'register'
              ? signUpEmail(name, email, password)
              : signInEmail(email, password),
          );
        }}
      >
        {mode === 'register' && (
          <Input
            label="Tu nombre"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <Input
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy
            ? 'Un momento…'
            : mode === 'register'
              ? 'Crear cuenta'
              : 'Entrar'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={() => void submit(signInGoogle)}
        >
          Continuar con Google
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {mode === 'register' ? (
          <>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-seal underline-offset-4 hover:underline"
            >
              Entra
            </button>
          </>
        ) : (
          <>
            ¿Primera vez?{' '}
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-seal underline-offset-4 hover:underline"
            >
              Crea tu cuenta
            </button>
          </>
        )}
      </p>
    </Modal>
  );
}
