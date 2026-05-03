'use client';

import { FormEvent, useEffect, useState } from 'react';

type AppUser = {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function UsuariosPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ username: '', displayName: '', password: '', role: 'USER' as 'ADMIN' | 'USER' });

  async function loadUsers() {
    const response = await fetch('/api/users');
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'No se pudieron cargar los usuarios.');
    setUsers(payload.data);
  }

  useEffect(() => {
    loadUsers().catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.'));
  }, []);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'No se pudo crear el usuario.');
      setMessage('Usuario creado correctamente.');
      setForm({ username: '', displayName: '', password: '', role: 'USER' });
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.');
    }
  }

  async function patchUser(id: string, data: Partial<AppUser> & { password?: string }) {
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'No se pudo actualizar el usuario.');
      setMessage('Usuario actualizado correctamente.');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el usuario.');
    }
  }

  async function deleteUser(id: string) {
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error ?? 'No se pudo eliminar el usuario.');
      setMessage('Usuario eliminado correctamente.');
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el usuario.');
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Administración</p>
        <h1 className="mt-3 text-3xl font-bold">Usuarios y accesos</h1>
        <p className="mt-3 max-w-4xl text-slate-300">Alta, baja y control de acceso mediante usuario y contraseña. No existe registro público.</p>
        {error ? <p className="mt-3 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{error}</p> : null}
        {message ? <p className="mt-3 rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-100">{message}</p> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={createUser} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Nuevo usuario</p>
          <div className="mt-5 space-y-4">
            <input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} placeholder="Usuario" className="input" />
            <input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Nombre visible" className="input" />
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="Contraseña inicial" className="input" />
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as 'ADMIN' | 'USER' }))} className="input"><option value="USER">Usuario</option><option value="ADMIN">Administrador</option></select>
            <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Crear usuario</button>
          </div>
          <style jsx>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(51 65 85); background: rgb(15 23 42); padding: 0.75rem 0.875rem; color: rgb(226 232 240); outline: none; } .input:focus { border-color: rgb(59 130 246); }`}</style>
        </form>

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-5"><h2 className="text-xl font-bold">Usuarios autorizados</h2><p className="mt-1 text-sm text-slate-400">Desactivar un usuario cierra sus sesiones y le impide acceder.</p></div>
          <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-800 text-sm"><thead className="bg-slate-950/70 text-left text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Usuario</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3">Acceso</th><th className="px-4 py-3">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800">{users.map((user) => <tr key={user.id}><td className="px-4 py-3 font-semibold text-blue-200">{user.username}</td><td className="px-4 py-3">{user.displayName}</td><td className="px-4 py-3"><select value={user.role} onChange={(event) => patchUser(user.id, { role: event.target.value as 'ADMIN' | 'USER' })} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"><option value="USER">Usuario</option><option value="ADMIN">Administrador</option></select></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.active ? 'bg-emerald-900 text-emerald-100' : 'bg-red-900 text-red-100'}`}>{user.active ? 'Activo' : 'Sin acceso'}</span></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => patchUser(user.id, { active: !user.active })} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800">{user.active ? 'Quitar acceso' : 'Dar acceso'}</button><button onClick={() => { const password = window.prompt('Nueva contraseña, mínimo 8 caracteres'); if (password) patchUser(user.id, { password }); }} className="rounded-lg border border-blue-700 px-3 py-2 text-xs font-semibold text-blue-200 hover:bg-blue-950">Cambiar contraseña</button><button onClick={() => deleteUser(user.id)} className="rounded-lg border border-red-700 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-950">Eliminar</button></div></td></tr>)}{!users.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No hay usuarios cargados o no dispone de permisos.</td></tr> : null}</tbody></table></div>
        </div>
      </div>
    </section>
  );
}
