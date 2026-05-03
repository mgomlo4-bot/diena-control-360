'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdministrativeInstance, instanceStatusLabels } from '../lib/instances';
import { readStoredInstances } from '../lib/localStorage';
import { formatCourseDate } from '../lib/courseUtils';

function priorityClass(priority: string): string {
  if (priority === 'critica') return 'border-red-700 bg-red-950/40 text-red-100';
  if (priority === 'alta') return 'border-orange-700 bg-orange-950/40 text-orange-100';
  if (priority === 'media') return 'border-yellow-700 bg-yellow-950/40 text-yellow-100';
  return 'border-slate-700 bg-slate-950 text-slate-200';
}

export default function InstanceDetailClient({ instanceId }: { instanceId: string }) {
  const [instances, setInstances] = useState<AdministrativeInstance[]>([]);

  useEffect(() => {
    setInstances(readStoredInstances());
  }, []);

  const instance = useMemo(() => instances.find((item) => item.id === instanceId), [instances, instanceId]);

  if (!instance) {
    return <section className="rounded-3xl border border-red-800 bg-red-950/30 p-8 text-red-100"><Link href="/instancias" className="text-sm font-semibold text-red-200 hover:text-red-100">← Volver a instancias</Link><h1 className="mt-4 text-3xl font-bold">Instancia no encontrada</h1><p className="mt-3 text-red-100/80">No existe una instancia con el identificador indicado en la capa de datos.</p></section>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link href="/instancias" className="text-sm font-semibold text-blue-300 hover:text-blue-200">← Volver al listado de instancias</Link>
          <p className="mt-5 text-sm uppercase tracking-[0.3em] text-blue-300">Ficha completa de instancia</p>
          <h1 className="mt-2 text-3xl font-bold">{instance.subject}</h1>
          <p className="mt-2 text-xl text-slate-300">{instance.reference}</p>
        </div>
        <div className="flex flex-wrap gap-2"><span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{instanceStatusLabels[instance.status]}</span><span className={`rounded-full border px-4 py-2 text-sm ${priorityClass(instance.priority)}`}>{instance.priority}</span></div>
      </div>

      <div className="grid gap-5 md:grid-cols-4"><InfoCard label="Interesado" value={instance.applicant} /><InfoCard label="Unidad/Destino" value={instance.unit ?? 'No informado'} /><InfoCard label="Entrada" value={formatCourseDate(instance.entryDate)} /><InfoCard label="Vencimiento" value={instance.dueDate ? formatCourseDate(instance.dueDate) : 'No informado'} /></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Seguimiento</p><h2 className="mt-2 text-2xl font-bold">Actuación administrativa</h2><div className="mt-5 space-y-4"><Block title="Última actuación" value={instance.lastAction || 'No informada'} /><Block title="Siguiente paso" value={instance.nextAction || 'No informado'} /><Block title="Observaciones" value={instance.observations || 'Sin observaciones'} /></div></article>
        <aside className="space-y-5"><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-slate-500">Vínculos</p><div className="mt-4 space-y-3 text-sm"><Row label="Curso" value={instance.courseCode ?? 'No vinculado'} />{instance.courseId ? <Link href={`/cursos/${instance.courseId}`} className="block rounded-xl border border-blue-800 bg-blue-950/30 px-4 py-3 text-center text-sm font-semibold text-blue-100 hover:bg-blue-900">Abrir ficha del curso</Link> : null}</div></article><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-slate-500">Datos internos</p><div className="mt-4 space-y-3 text-sm"><Row label="ID" value={instance.id} /><Row label="Responsable" value={instance.responsible} /><Row label="Estado" value={instanceStatusLabels[instance.status]} /></div></article></aside>
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-semibold text-slate-100">{value}</p></article>; }
function Block({ title, value }: { title: string; value: string }) { return <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5"><p className="text-xs uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">{value}</p></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-slate-800 pb-2 last:border-b-0"><span className="text-slate-400">{label}</span><span className="font-semibold text-slate-100">{value}</span></div>; }
