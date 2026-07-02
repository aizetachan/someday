'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

function RegisterForm() {
  const { signUpEmail, signInGoogle } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/escribir';

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
      router.push(next);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(
        code === 'auth/email-already-in-use'
          ? 'Ya existe una cuenta con ese email.'
          : code === 'auth/weak-password'
            ? 'La contraseña debe tener al menos 6 caracteres.'
            : 'No se pudo crear la cuenta. Inténtalo de nuevo.',
      );
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-10 font-serif text-xl text-ink">
        Cartas al Futuro
      </Link>
      <h1 className="font-serif text-3xl text-ink">Crear cuenta</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Para que tu carta sepa volver a ti.
      </p>
      <form
        className="mt-8 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(() => signUpEmail(name, email, password));
        }}
      >
        <Input
          label="Tu nombre"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Creando cuenta…' : 'Crear cuenta'}
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
        ¿Ya tienes cuenta?{' '}
        <Link
          href={`/auth/login?next=${encodeURIComponent(next)}`}
          className="text-seal underline-offset-4 hover:underline"
        >
          Entra
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
