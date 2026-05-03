'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdministrativeInstance, instanceStatusLabels } from '../../lib/instances';
import { readStoredInstances } from '../../lib/localStorage';
import { formatCourseDate } from '../../lib/courseUtils';

type InstanceFilter = 'todas' | AdministrativeInstance['status'];

function priorityClass(priority: string): string {
  if (priority === 'critica') return 'bg-red-900 text-red-100';
  if (priority === 'alta') return 'bg-orange-900 text-orange-100';
  if (priority === 'media') return 'bg-yellow-900 text-yellow-100';
  return 'bg-slate-800 text-slate-200';
}

export default function InstanciasPage() {
  const [instances, setInstances] = useState<AdministrativeInstance[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InstanceFilter>('todas');

  useEffect(() => {
    setInstances(readStoredInstances());
  }, []);

  const filteredInstances = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();
    return instances.filter((item) => {
      const matchesStatus = statusFilter === 'todas' || item.status === statusFilter;
      const matchesQuery = !cleanQuery || [item.reference, item.subject, item.applicant, item.unit ?? '', item.courseCode ?? '', item.courseName ?? '', item.status, item.nextAction, item.lastAction].join(' ').toLowerCase().includes(cleanQuery);
      return matchesStatus && matchesQuery;
    });
  }, [instances, query, statusFilter]);

  const totals = useMemo(() => ({
    total: instances.length,
    pendingReport: instances.filter((item) => item.status === 'pendiente_informe' || item.status === 'informe_solicitado').length,
    appeals: instances.filter((item) => item.status === 'recurso_alzada').length,
    visible: filteredInstances.length,
  }), [instances, filteredInstances.length]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Expedientes</p>
        <h1 className="mt-3 text-3xl font-bold">Instancias y expedientes</h1>
        <p className="mt-3 max-w-4xl text-slate-300">Listado operativo de instancias persistidas. Pulsa el nombre/asunto de la instancia para abrir su ficha completa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4"><Kpi label="Total" value={totals.total} /><Kpi label="Visibles" value={totals.visible} /><Kpi label="Pendiente informe" value={totals.pendingReport} /><Kpi label="Recursos" value={totals.appeals} /></div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por referencia, nombre, asunto, curso, unidad, estado..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InstanceFilter)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"><option value="todas">Todos los estados</option>{Object.entries(instanceStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div></div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold">Listado de instancias</h2><p className="text-sm text-slate-400">El enlace principal es el asunto/nombre de la instancia. Si tiene curso asociado, el código del curso abre la ficha del curso.</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-800 text-sm"><thead className="bg-slate-950/70 text-left text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Referencia</th><th className="px-4 py-3">Instancia</th><th className="px-4 py-3">Interesado</th><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Prioridad</th><th className="px-4 py-3">Vencimiento</th><th className="px-4 py-3">Siguiente paso</th></tr></thead><tbody className="divide-y divide-slate-800">{filteredInstances.map((item) => <tr key={item.id} className="transition hover:bg-slate-800/70"><td className="whitespace-nowrap px-4 py-3 text-slate-300">{item.reference}</td><td className="min-w-80 px-4 py-3"><Link href={`/instancias/${item.id}`} className="font-semibold text-blue-200 underline-offset-4 hover:text-blue-100 hover:underline">{item.subject}</Link></td><td className="px-4 py-3 text-slate-300">{item.applicant}</td><td className="px-4 py-3">{item.courseId ? <Link href={`/cursos/${item.courseId}`} className="font-semibold text-blue-200 hover:text-blue-100">{item.courseCode ?? 'Abrir curso'}</Link> : item.courseCode ?? '-'}</td><td className="px-4 py-3"><span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">{instanceStatusLabels[item.status]}</span></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(item.priority)}`}>{item.priority}</span></td><td className="whitespace-nowrap px-4 py-3">{item.dueDate ? formatCourseDate(item.dueDate) : '-'}</td><td className="min-w-72 px-4 py-3 text-slate-300">{item.nextAction || '-'}</td></tr>)}{!filteredInstances.length ? <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No hay instancias cargadas o no coinciden con el filtro aplicado. Puedes cargarlas desde /importar.</td></tr> : null}</tbody></table></div></div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) { return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>; }
