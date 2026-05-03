'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ setupToken: '', username: '', displayName: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'No se pudo crear el administrador inicial.');
      setMessage('Administrador inicial creado correctamente. Ya puede iniciar sesión.');
      setTimeout(() => router.replace('/login'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el administrador inicial.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <section className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Instalación inicial</p>
        <h1 className="mt-3 text-3xl font-bold">Crear administrador</h1>
        <p className="mt-3 text-sm text-slate-400">Esta pantalla solo sirve para crear el primer administrador. Requiere `INITIAL_ADMIN_TOKEN`. Cuando ya exista un administrador, quedará bloqueada.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input value={form.setupToken} onChange={(event) => setForm((current) => ({ ...current, setupToken: event.target.value }))} placeholder="Token inicial" className="input" />
          <input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} placeholder="Usuario administrador" autoComplete="username" className="input" />
          <input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Nombre visible" className="input" />
          <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Contraseña, mínimo 10 caracteres" autoComplete="new-password" className="input" />
          {error ? <div className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{error}</div> : null}
          {message ? <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-100">{message}</div> : null}
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Creando...' : 'Crear administrador inicial'}</button>
        </form>
        <style jsx>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(51 65 85); background: rgb(15 23 42); padding: 0.75rem 0.875rem; color: rgb(226 232 240); outline: none; } .input:focus { border-color: rgb(59 130 246); }`}</style>
      </section>
    </main>
  );
}
