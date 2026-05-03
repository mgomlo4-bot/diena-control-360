'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Course,
  CourseMilestone,
  generateCourseMilestones,
  getLastCompletedMilestone,
  getNextPendingMilestone,
  isMilestoneOverdue,
} from '../../lib/courseMilestones';
import { mockCourses } from '../../lib/mockCourses';
import { applyCourseFilters, QuickFilter } from '../../lib/courseSearch';
import { coursesToCsv } from '../../lib/courseExport';
import { getHighestAlertLevel } from '../../lib/courseAlerts';
import { formatCourseDate } from '../../lib/courseUtils';
import { getCourses, resetCourses as resetCoursesRepository, saveCourses } from '../../lib/dataRepository';
import {
  CourseStatus,
  courseStatusOptions,
  getCoursePhase,
  getCourseStatusLabel,
  hasPendingActa,
  hasPendingFinalizationPublication,
  inferAutomaticCourseStatus,
} from '../../lib/courseStatus';

const quickFilters: { id: QuickFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'enCurso', label: 'En curso' },
  { id: 'vencidos', label: 'Hitos vencidos' },
  { id: 'proximos30', label: 'Próximos 30 días' },
  { id: 'pendienteActa', label: 'Pendiente acta' },
  { id: 'finalizacionPendiente', label: 'Finalización pendiente' },
  { id: 'pendienteBod', label: 'Pendientes BOD' },
  { id: 'reconocimientoMedico', label: 'Reconocimiento médico' },
  { id: 'cerrados', label: 'Cerrados' },
  { id: 'incidencias', label: 'Incidencias' },
  { id: 'seguimientoCompletado', label: 'Seguimiento completado' },
];

function statusClass(milestone: CourseMilestone, isNext: boolean): string {
  if (milestone.completed) return 'border-emerald-700 bg-emerald-950/40 text-emerald-200';
  if (isMilestoneOverdue(milestone)) return 'border-red-700 bg-red-950/40 text-red-200';
  if (isNext) return 'border-blue-500 bg-blue-950/60 text-blue-100 ring-1 ring-blue-500/60';
  if (milestone.reference === 'FIN_CURSO') return 'border-violet-700 bg-violet-950/30 text-violet-100';
  return 'border-slate-700 bg-slate-900 text-slate-300';
}

function alertBadgeClass(level: string): string {
  if (level === 'critica') return 'bg-red-900 text-red-100';
  if (level === 'alta') return 'bg-orange-900 text-orange-100';
  if (level === 'media') return 'bg-yellow-900 text-yellow-100';
  return 'bg-emerald-900 text-emerald-100';
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState(mockCourses[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('todos');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'todos'>('todos');
  const [compactView, setCompactView] = useState(false);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];

  useEffect(() => {
    async function loadCourses() {
      try {
        const loadedCourses = await getCourses();
        setCourses(loadedCourses);
        if (loadedCourses[0]?.id) setSelectedCourseId(loadedCourses[0].id);
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los cursos.');
      } finally {
        setHasLoaded(true);
      }
    }

    loadCourses();
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      saveCourses(courses).catch((error) => setLoadError(error instanceof Error ? error.message : 'No se pudieron guardar los cursos.'));
    }
  }, [courses, hasLoaded]);

  const filteredCourses = useMemo(() => applyCourseFilters(courses, { query, quickFilter, status: statusFilter }), [courses, query, quickFilter, statusFilter]);

  const totals = useMemo(() => ({
    active: courses.filter((course) => course.active).length,
    appointed: courses.reduce((sum, course) => sum + course.appointedStudents, 0),
    pendingMilestones: courses.reduce((sum, course) => sum + course.milestones.filter((milestone) => !milestone.completed).length, 0),
    visible: filteredCourses.length,
    pendingActa: courses.filter(hasPendingActa).length,
    pendingFinalizationPublication: courses.filter(hasPendingFinalizationPublication).length,
  }), [courses, filteredCourses.length]);

  function updateSelectedCourse(updater: (course: Course) => Course): void {
    setCourses((currentCourses) => currentCourses.map((course) => (course.id === selectedCourse.id ? updater(course) : course)));
  }

  function updateCourseField(field: keyof Course, value: string | boolean): void {
    updateSelectedCourse((course) => {
      const updated = { ...course, [field]: value } as Course;
      if (field === 'startDate' || field === 'endDate' || field === 'requiresMedicalAndPhysical') {
        updated.milestones = generateCourseMilestones(updated.startDate, updated.endDate, updated.requiresMedicalAndPhysical, course.milestones);
      }
      return updated;
    });
  }

  function inferStatus(): void {
    updateSelectedCourse((course) => ({ ...course, status: inferAutomaticCourseStatus(course) }));
  }

  function toggleMilestone(milestoneId: string): void {
    updateSelectedCourse((course) => ({
      ...course,
      milestones: course.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone),
    }));
  }

  function updateMilestoneObservation(milestoneId: string, observations: string): void {
    updateSelectedCourse((course) => ({
      ...course,
      milestones: course.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, observations } : milestone),
    }));
  }

  function regenerateMilestones(): void {
    updateSelectedCourse((course) => ({
      ...course,
      milestones: generateCourseMilestones(course.startDate, course.endDate, course.requiresMedicalAndPhysical, course.milestones),
    }));
  }

  async function resetCourses(): Promise<void> {
    try {
      const resetCoursesValue = await resetCoursesRepository();
      setCourses(resetCoursesValue);
      setSelectedCourseId(resetCoursesValue[0]?.id ?? '');
      setQuickFilter('todos');
      setStatusFilter('todos');
      setQuery('');
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo restaurar la demo.');
    }
  }

  function exportVisibleCourses(): void {
    const csv = coursesToCsv(filteredCourses);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diena-control-360-cursos-v2.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  const selectedNext = getNextPendingMilestone(selectedCourse.milestones);
  const selectedLast = getLastCompletedMilestone(selectedCourse.milestones);
  const finalizationMilestones = selectedCourse.milestones.filter((milestone) => milestone.reference === 'FIN_CURSO');
  const pendingFinalizationMilestones = finalizationMilestones.filter((milestone) => !milestone.completed);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Módulo operativo 2.0</p>
          <h1 className="mt-2 text-3xl font-bold">Control de cursos</h1>
          <p className="mt-2 max-w-4xl text-slate-400">Filtros por estado de curso, automatización de fechas y control de finalización, acta y publicación BOD vinculados a la fecha fin.</p>
          {loadError ? <p className="mt-3 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{loadError}</p> : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <Kpi label="Activos" value={totals.active} />
          <Kpi label="Visibles" value={totals.visible} />
          <Kpi label="Nombrados" value={totals.appointed} />
          <Kpi label="Hitos pendientes" value={totals.pendingMilestones} />
          <Kpi label="Pendiente acta" value={totals.pendingActa} />
          <Kpi label="Pendiente BOD fin" value={totals.pendingFinalizationPublication} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <div className="grid gap-4 xl:grid-cols-[1fr_280px_auto_auto_auto] xl:items-end">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por código, nombre, estado, escuela, tipo, acta, BOD o siguiente hito..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span className="mb-2 block">Estado de curso</span>
            <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-blue-500" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CourseStatus | 'todos')}>
              <option value="todos">Todos los estados</option>
              {courseStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => setCompactView((current) => !current)} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">{compactView ? 'Vista normal' : 'Vista compacta'}</button>
          <button type="button" onClick={exportVisibleCourses} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Exportar filtrados</button>
          <button type="button" onClick={resetCourses} className="rounded-xl border border-red-800 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-950/40">Restaurar demo</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((filter) => <button key={filter.id} type="button" onClick={() => setQuickFilter(filter.id)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${quickFilter === filter.id ? 'bg-blue-600 text-white' : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'}`}>{filter.label}</button>)}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold">Listado general 2.0</h2><p className="text-sm text-slate-400">Pulsa la fila para previsualizar. Pulsa el código para abrir la ficha completa.</p></div>
        <div className="overflow-x-auto"><table className={`min-w-full divide-y divide-slate-800 text-sm ${compactView ? 'text-xs' : ''}`}><thead className="bg-slate-950/70 text-left text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Curso</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Fase</th><th className="px-4 py-3">Inicio</th><th className="px-4 py-3">Fin</th><th className="px-4 py-3">Siguiente hito</th><th className="px-4 py-3">Fecha hito</th><th className="px-4 py-3">Acta</th><th className="px-4 py-3">BOD fin</th><th className="px-4 py-3">Alerta</th></tr></thead><tbody className="divide-y divide-slate-800">{filteredCourses.map((course) => { const next = getNextPendingMilestone(course.milestones); const overdue = isMilestoneOverdue(next); const isSelected = course.id === selectedCourse.id; const alertLevel = getHighestAlertLevel(course); return <tr key={course.id} onClick={() => setSelectedCourseId(course.id)} className={`cursor-pointer transition hover:bg-slate-800/70 ${isSelected ? 'bg-blue-950/40' : ''}`}><td className={`whitespace-nowrap px-4 font-semibold text-blue-200 ${compactView ? 'py-2' : 'py-3'}`}><Link href={`/cursos/${course.id}`} className="rounded-lg px-2 py-1 text-blue-200 underline-offset-4 hover:bg-blue-950 hover:text-blue-100 hover:underline" onClick={(event) => event.stopPropagation()}>{course.code}</Link></td><td className="min-w-72 px-4 py-3">{course.name}</td><td className="min-w-56 px-4 py-3"><span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">{getCourseStatusLabel(course.status)}</span></td><td className="px-4 py-3"><span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">{getCoursePhase(course.status)}</span></td><td className="whitespace-nowrap px-4 py-3">{formatCourseDate(course.startDate)}</td><td className="whitespace-nowrap px-4 py-3">{formatCourseDate(course.endDate)}</td><td className="min-w-72 px-4 py-3 font-medium text-slate-100">{next?.name ?? 'Seguimiento completado'}</td><td className="whitespace-nowrap px-4 py-3">{next ? formatCourseDate(next.calculatedDate) : '-'}</td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasPendingActa(course) ? 'bg-violet-900 text-violet-100' : 'bg-emerald-900 text-emerald-100'}`}>{hasPendingActa(course) ? 'Pendiente' : 'OK'}</span></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${hasPendingFinalizationPublication(course) ? 'bg-yellow-900 text-yellow-100' : 'bg-emerald-900 text-emerald-100'}`}>{hasPendingFinalizationPublication(course) ? 'Pendiente' : 'OK'}</span></td><td className="px-4 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${overdue ? 'bg-red-900 text-red-100' : alertBadgeClass(alertLevel)}`}>{next ? (overdue ? 'Vencido' : alertLevel) : 'Completado'}</span></td></tr>; })}{!filteredCourses.length ? <tr><td colSpan={11} className="px-4 py-10 text-center text-slate-400">No hay cursos que coincidan con la búsqueda o el filtro aplicado.</td></tr> : null}</tbody></table></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><h2 className="text-lg font-semibold">Datos del curso</h2><p className="mt-1 text-sm text-slate-400">Al cambiar fechas, se recalculan los hitos automáticos conservando lo marcado.</p><div className="mt-5 space-y-4"><Field label="Código del curso"><input className="input" value={selectedCourse.code} onChange={(event) => updateCourseField('code', event.target.value)} /></Field><Field label="Nombre del curso"><input className="input" value={selectedCourse.name} onChange={(event) => updateCourseField('name', event.target.value)} /></Field><Field label="Estado operativo"><select className="input" value={selectedCourse.status} onChange={(event) => updateCourseField('status', event.target.value)}>{courseStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button type="button" onClick={inferStatus} className="mt-2 w-full rounded-xl border border-violet-700 bg-violet-950 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-900">Inferir estado desde fechas e hitos</button></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Fecha inicio"><input className="input" type="date" value={selectedCourse.startDate} onChange={(event) => updateCourseField('startDate', event.target.value)} /></Field><Field label="Fecha fin"><input className="input" type="date" value={selectedCourse.endDate} onChange={(event) => updateCourseField('endDate', event.target.value)} /></Field></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm"><input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900" checked={selectedCourse.requiresMedicalAndPhysical} onChange={(event) => updateCourseField('requiresMedicalAndPhysical', event.target.checked)} /><span><span className="block font-semibold text-slate-100">Requiere pruebas físicas y reconocimiento médico</span><span className="mt-1 block text-slate-400">Al activarlo se inserta el hito T-5 de recepción de resultados antes de la propuesta de nombramiento.</span></span></label><button type="button" onClick={regenerateMilestones} className="w-full rounded-xl border border-blue-700 bg-blue-950 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-900">Regenerar hitos desde fechas del curso</button><Link href={`/cursos/${selectedCourse.id}`} className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-white">Abrir ficha completa del curso</Link></div></aside>
        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"><div className="border-b border-slate-800 p-5"><p className="text-sm uppercase tracking-[0.25em] text-blue-300">Vista rápida</p><h2 className="mt-2 text-2xl font-bold">Seguimiento de hitos del curso</h2><div className="mt-4 grid gap-3 md:grid-cols-4"><SummaryCard label="Estado" value={getCourseStatusLabel(selectedCourse.status)} /><SummaryCard label="Fase" value={getCoursePhase(selectedCourse.status)} /><SummaryCard label="Último hito completado" value={selectedLast?.name ?? 'Sin hitos completados'} /><SummaryCard label="Siguiente hito pendiente" value={selectedNext?.name ?? 'Seguimiento completado'} alert={isMilestoneOverdue(selectedNext)} /></div><div className="mt-4 rounded-2xl border border-violet-800 bg-violet-950/20 p-4"><p className="text-sm font-semibold text-violet-100">Cadena posterior a fecha fin</p><p className="mt-1 text-sm text-violet-100/80">Pendientes: {pendingFinalizationMilestones.length}. Controla fin del curso, novedad, acta, publicación BOD de finalización y cierre administrativo.</p><div className="mt-3 flex flex-wrap gap-2">{finalizationMilestones.map((milestone) => <span key={milestone.id} className={`rounded-full px-3 py-1 text-xs font-semibold ${milestone.completed ? 'bg-emerald-900 text-emerald-100' : isMilestoneOverdue(milestone) ? 'bg-red-900 text-red-100' : 'bg-violet-900 text-violet-100'}`}>{milestone.relativeCode} · {milestone.completed ? 'OK' : 'Pendiente'}</span>)}</div></div></div><div className="divide-y divide-slate-800">{selectedCourse.milestones.map((milestone) => { const isNext = selectedNext?.id === milestone.id; return <div key={milestone.id} className={`p-4 ${isNext ? 'bg-blue-950/20' : ''}`}><div className={`rounded-2xl border p-4 ${statusClass(milestone, isNext)}`}><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><label className="flex min-w-0 flex-1 cursor-pointer items-start gap-4"><input type="checkbox" checked={milestone.completed} onChange={() => toggleMilestone(milestone.id)} className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-950" /><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{milestone.relativeCode}</span><span className="font-semibold">{milestone.name}</span>{milestone.reference === 'FIN_CURSO' ? <span className="rounded-full bg-violet-700 px-2 py-1 text-xs font-semibold text-white">Cadena fin</span> : null}{isNext && !milestone.completed ? <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">Próximo hito</span> : null}</span><span className="mt-2 block text-sm opacity-80">Referencia: {milestone.reference === 'INICIO_CURSO' ? 'inicio del curso' : 'fin del curso'} · Desplazamiento: {milestone.offsetDays} días · Fecha: {formatCourseDate(milestone.calculatedDate)}</span></span></label><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold">{milestone.completed ? 'Completado' : isMilestoneOverdue(milestone) ? 'Vencido' : 'Pendiente'}</span></div><input className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500" placeholder="Observaciones del hito" value={milestone.observations ?? ''} onChange={(event) => updateMilestoneObservation(milestone.id, event.target.value)} /></div></div>; })}</div></article>
      </div>
      <style jsx>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(51 65 85); background: rgb(15 23 42); padding: 0.75rem 0.875rem; color: rgb(226 232 240); outline: none; } .input:focus { border-color: rgb(59 130 246); }`}</style>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) { return <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4"><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm"><span className="mb-2 block font-medium text-slate-300">{label}</span>{children}</label>; }
function SummaryCard({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) { return <div className={`rounded-2xl border p-4 ${alert ? 'border-red-700 bg-red-950/40' : 'border-slate-700 bg-slate-950'}`}><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-slate-100">{value}</p></div>; }
