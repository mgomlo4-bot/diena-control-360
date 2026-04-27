import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DIENA CONTROL 360',
  description: 'Control operativo de cursos, hitos, instancias y tareas de DIENA.',
};

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/hitos', label: 'Hitos' },
  { href: '/instancias', label: 'Instancias' },
  { href: '/tareas', label: 'Tareas' },
  { href: '/documentos', label: 'Documentos' },
  { href: '/asistente', label: 'Asistente' },
  { href: '/respaldo', label: 'Respaldo' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-800 bg-slate-950/95 p-6 lg:block">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">DIENA</p>
              <h1 className="mt-2 text-2xl font-bold">CONTROL 360</h1>
              <p className="mt-2 text-sm text-slate-400">Seguimiento operativo de cursos</p>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="lg:pl-72">
            <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 px-6 py-4 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Aplicación interna</p>
                  <h2 className="text-lg font-semibold">Control integral de cursos</h2>
                </div>
                <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">Modo prototipo funcional</div>
              </div>
            </header>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
