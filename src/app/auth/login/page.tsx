'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { signInEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/cartas';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(fn: () => Promise<void>) {
    setError('');
    setBusy(true);
    try {
      await fn();
      router.push(next);
    } catch {
      setError('No se pudo iniciar sesión. Revisa el email y la contraseña.');
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-10 font-serif text-xl text-ink">
        Cartas al Futuro
      </Link>
      <h1 className="font-serif text-3xl text-ink">Entrar</h1>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(() => signInEmail(email, password));
        }}
      >
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
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
      <p className="mt-6 text-sm text-ink-soft">
        ¿No tienes cuenta?{' '}
        <Link
          href={`/auth/registro?next=${encodeURIComponent(next)}`}
          className="text-seal underline-offset-4 hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
