'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Course, getLastCompletedMilestone, getNextPendingMilestone, isMilestoneOverdue } from '../lib/courseMilestones';
import { getCourseAlerts } from '../lib/courseAlerts';
import { mockCourses } from '../lib/mockCourses';
import { formatCourseDate } from '../lib/courseUtils';
import { getCourses, saveCourses } from '../lib/dataRepository';

function alertClass(level: string): string {
  if (level === 'critica') return 'border-red-700 bg-red-950/40 text-red-100';
  if (level === 'alta') return 'border-orange-700 bg-orange-950/40 text-orange-100';
  if (level === 'media') return 'border-yellow-700 bg-yellow-950/40 text-yellow-100';
  return 'border-emerald-700 bg-emerald-950/40 text-emerald-100';
}

function percent(part: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export default function CourseDetailClient({ courseId }: { courseId: string }) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setCourses(await getCourses());
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudo cargar la ficha del curso.');
      } finally {
        setHasLoaded(true);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      saveCourses(courses).catch((error) => setLoadError(error instanceof Error ? error.message : 'No se pudieron guardar los cambios del curso.'));
    }
  }, [courses, hasLoaded]);

  const course = useMemo(() => courses.find((item) => item.id === courseId), [courses, courseId]);

  if (!course) {
    return (
      <section className="rounded-3xl border border-red-800 bg-red-950/30 p-8 text-red-100">
        <Link href="/cursos" className="text-sm font-semibold text-red-200 hover:text-red-100">← Volver al listado</Link>
        <h1 className="mt-4 text-3xl font-bold">Curso no encontrado</h1>
        <p className="mt-3 text-red-100/80">No existe un curso con el identificador indicado en la capa de datos.</p>
      </section>
    );
  }

  function updateCourse(updater: (course: Course) => Course): void {
    setCourses((current) => current.map((item) => (item.id === courseId ? updater(item) : item)));
  }

  function toggleMilestone(milestoneId: string): void {
    updateCourse((currentCourse) => ({
      ...currentCourse,
      milestones: currentCourse.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone),
    }));
  }

  function updateMilestoneObservation(milestoneId: string, observations: string): void {
    updateCourse((currentCourse) => ({
      ...currentCourse,
      milestones: currentCourse.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, observations } : milestone),
    }));
  }

  const next = getNextPendingMilestone(course.milestones);
  const last = getLastCompletedMilestone(course.milestones);
  const alerts = getCourseAlerts(course);
  const appointedWomen = course.appointedWomen ?? 0;
  const activeStudents = Math.max(course.appointedStudents - course.droppedStudents, 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link href="/cursos" className="text-sm font-semibold text-blue-300 hover:text-blue-200">← Volver al listado de cursos</Link>
          <p className="mt-5 text-sm uppercase tracking-[0.3em] text-blue-300">Ficha completa de curso</p>
          <h1 className="mt-2 text-3xl font-bold">{course.code}</h1>
          <p className="mt-2 max-w-4xl text-xl text-slate-300">{course.name}</p>
          <p className="mt-2 text-sm text-slate-500">Datos cargados mediante dataRepository.</p>
          {loadError ? <p className="mt-3 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{loadError}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{course.status}</span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{course.type}</span>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{course.modality}</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className={`rounded-3xl border p-6 shadow-xl ${next && isMilestoneOverdue(next) ? 'border-red-700 bg-red-950/30' : 'border-blue-700 bg-blue-950/30'}`}>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Siguiente acción</p>
          <h2 className="mt-3 text-2xl font-bold">{next?.name ?? 'Seguimiento completado'}</h2>
          {next ? <div className="mt-4 grid gap-3 md:grid-cols-3"><Info label="Código relativo" value={next.relativeCode} /><Info label="Fecha prevista" value={formatCourseDate(next.calculatedDate)} /><Info label="Estado" value={isMilestoneOverdue(next) ? 'Vencido' : 'Pendiente'} /></div> : <p className="mt-4 text-slate-300">Todos los hitos automáticos constan completados.</p>}
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-slate-500">Último avance</p><h2 className="mt-3 text-lg font-semibold">{last?.name ?? 'Sin hitos completados'}</h2><p className="mt-2 text-sm text-slate-400">{last ? `Completado según la checklist del curso. Fecha prevista: ${formatCourseDate(last.calculatedDate)}.` : 'Todavía no se ha marcado ningún hito como completado.'}</p></article>
      </div>

      <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Estadística del curso</p>
            <h2 className="mt-2 text-2xl font-bold">Alumnos, bajas y egresos</h2>
            <p className="mt-2 text-sm text-slate-400">Resumen numérico para control de nombramientos, seguimiento durante el curso y cierre estadístico final.</p>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-300">Permanecen en curso: <span className="font-bold text-slate-100">{activeStudents}</span></div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Alumnos nombrados" value={course.appointedStudents} detail="Total nombrado" />
          <StatCard label="Mujeres nombradas" value={appointedWomen} detail={`${percent(appointedWomen, course.appointedStudents)} del nombramiento`} />
          <StatCard label="Bajas durante el curso" value={course.droppedStudents} detail={`${percent(course.droppedStudents, course.appointedStudents)} del total nombrado`} />
          <StatCard label="Alumnos egresados" value={course.graduatedStudents} detail={`${percent(course.graduatedStudents, course.appointedStudents)} del total nombrado`} />
          <StatCard label="Mujeres egresadas" value={course.graduatedWomen} detail={`${percent(course.graduatedWomen, course.graduatedStudents)} del egreso`} />
        </div>
      </article>

      <div className="grid gap-5 md:grid-cols-4"><InfoCard label="Escuela / centro" value={course.school} /><InfoCard label="Inicio" value={formatCourseDate(course.startDate)} /><InfoCard label="Fin" value={formatCourseDate(course.endDate)} /><InfoCard label="Alumnos nombrados" value={String(course.appointedStudents)} /></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"><div className="border-b border-slate-800 p-5"><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Seguimiento</p><h2 className="mt-2 text-2xl font-bold">Checklist editable de hitos del curso</h2></div><div className="divide-y divide-slate-800">{course.milestones.map((milestone) => { const isNext = next?.id === milestone.id; const overdue = isMilestoneOverdue(milestone); return <div key={milestone.id} className={`p-4 ${isNext ? 'bg-blue-950/20' : ''}`}><div className={`rounded-2xl border p-4 ${milestone.completed ? 'border-emerald-700 bg-emerald-950/40' : overdue ? 'border-red-700 bg-red-950/40' : isNext ? 'border-blue-500 bg-blue-950/60' : 'border-slate-700 bg-slate-950'}`}><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><label className="flex min-w-0 flex-1 cursor-pointer items-start gap-4"><input type="checkbox" checked={milestone.completed} onChange={() => toggleMilestone(milestone.id)} className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-950" /><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{milestone.relativeCode}</span>{isNext ? <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">Próximo hito</span> : null}<span className="rounded-full bg-slate-950 px-2 py-1 text-xs font-semibold text-slate-300">{milestone.completed ? 'Completado' : overdue ? 'Vencido' : 'Pendiente'}</span></span><h3 className="mt-3 font-semibold text-slate-100">{milestone.name}</h3><p className="mt-2 text-sm text-slate-400">Referencia: {milestone.reference === 'INICIO_CURSO' ? 'inicio del curso' : 'fin del curso'} · Desplazamiento: {milestone.offsetDays} días.</p></span></label><p className="whitespace-nowrap rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-200">{formatCourseDate(milestone.calculatedDate)}</p></div><input className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" placeholder="Observaciones del hito" value={milestone.observations ?? ''} onChange={(event) => updateMilestoneObservation(milestone.id, event.target.value)} /></div></div>; })}</div></article>
        <aside className="space-y-6"><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Alertas</p><h2 className="mt-2 text-xl font-bold">Control operativo</h2><div className="mt-4 space-y-3">{alerts.map((alert) => <div key={alert.id} className={`rounded-2xl border p-4 ${alertClass(alert.level)}`}><p className="text-xs uppercase tracking-wide opacity-80">{alert.level}</p><h3 className="mt-1 font-semibold">{alert.title}</h3><p className="mt-2 text-sm opacity-90">{alert.description}</p></div>)}</div></article><article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-slate-500">Datos administrativos</p><div className="mt-4 space-y-3 text-sm"><Row label="Activo" value={course.active ? 'Sí' : 'No'} /><Row label="Reconocimiento médico" value={course.requiresMedicalAndPhysical ? 'Sí' : 'No'} /><Row label="Bajas" value={String(course.droppedStudents)} /><Row label="Egresados" value={String(course.graduatedStudents)} /><Row label="Mujeres egresadas" value={String(course.graduatedWomen)} /></div></article></aside>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-blue-800/60 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-wide text-blue-200/80">{label}</p><p className="mt-2 font-semibold text-white">{value}</p></div>; }
function InfoCard({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 font-semibold text-slate-100">{value}</p></article>; }
function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) { return <article className="rounded-2xl border border-slate-700 bg-slate-950 p-5"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-3 text-4xl font-bold text-slate-100">{value}</p><p className="mt-2 text-sm text-slate-400">{detail}</p></article>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 border-b border-slate-800 pb-2 last:border-b-0"><span className="text-slate-400">{label}</span><span className="font-semibold text-slate-100">{value}</span></div>; }
