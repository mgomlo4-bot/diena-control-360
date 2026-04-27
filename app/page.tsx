import Link from 'next/link';

const kpis = [
  { label: 'Cursos activos', value: '18' },
  { label: 'Pendientes de nombramiento', value: '5' },
  { label: 'Hitos vencidos', value: '3' },
  { label: 'Pendientes BOD finalización', value: '4' },
];

export default function DashboardPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">DIENA CONTROL 360</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Panel operativo para controlar cursos, hitos administrativos, plazos, instancias, tareas y publicaciones de finalización.
        </p>
        <Link
          href="/cursos"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          Ir al control de cursos
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{kpi.label}</p>
            <p className="mt-3 text-3xl font-bold">{kpi.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
