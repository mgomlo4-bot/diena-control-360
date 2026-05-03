'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'No se pudo iniciar sesión.');
      router.replace(searchParams.get('next') || '/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <p className="text-sm uppercase tracking-[0.3em] text-blue-300">DIENA</p>
      <h1 className="mt-3 text-3xl font-bold">CONTROL 360</h1>
      <p className="mt-3 text-sm text-slate-400">Acceso interno mediante usuario y contraseña. El acceso debe haber sido autorizado por un administrador.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm"><span className="mb-2 block font-medium text-slate-300">Usuario</span><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" /></label>
        <label className="block text-sm"><span className="mb-2 block font-medium text-slate-300">Contraseña</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500" /></label>
        {error ? <div className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{error}</div> : null}
        <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Comprobando...' : 'Entrar'}</button>
      </form>
    </section>
  );
}

function LoginFallback() {
  return (
    <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
      <p className="text-sm uppercase tracking-[0.3em] text-blue-300">DIENA</p>
      <h1 className="mt-3 text-3xl font-bold">CONTROL 360</h1>
      <p className="mt-3 text-sm text-slate-400">Cargando acceso interno...</p>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
