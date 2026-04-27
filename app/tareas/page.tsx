'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Course } from '../../lib/courseMilestones';
import {
  CourseTask,
  ManualTaskSeed,
  TaskLinkType,
  TaskPriority,
  TaskSource,
  TaskStatus,
  filterTasksBySource,
  filterTasksByStatus,
  getCourseTasks,
  getTaskSummary,
  getTodayTasks,
  getUpcomingTasks,
} from '../../lib/courseTasks';
import { mockCourses } from '../../lib/mockCourses';
import { mockManualTasks } from '../../lib/mockTasks';
import { formatCourseDate } from '../../lib/courseUtils';
import {
  createTask,
  deleteTask,
  getCourses,
  getManualTasks,
  resetManualTasks as resetManualTasksRepository,
  saveManualTasks,
} from '../../lib/dataRepository';

type ManualTaskFormState = {
  title: string;
  description: string;
  courseId: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  responsible: string;
  linkType: TaskLinkType;
  relatedLabel: string;
};

const initialForm: ManualTaskFormState = {
  title: '',
  description: '',
  courseId: mockCourses[0]?.id ?? '',
  dueDate: new Date().toISOString().slice(0, 10),
  priority: 'media',
  status: 'pendiente',
  responsible: 'DIENA - Sección de Perfeccionamiento',
  linkType: 'curso',
  relatedLabel: '',
};

function priorityClass(priority: string): string {
  if (priority === 'critica') return 'border-red-700 bg-red-950/40 text-red-100';
  if (priority === 'alta') return 'border-orange-700 bg-orange-950/40 text-orange-100';
  if (priority === 'media') return 'border-yellow-700 bg-yellow-950/40 text-yellow-100';
  return 'border-slate-700 bg-slate-950 text-slate-200';
}

function priorityBadge(priority: string): string {
  if (priority === 'critica') return 'bg-red-900 text-red-100';
  if (priority === 'alta') return 'bg-orange-900 text-orange-100';
  if (priority === 'media') return 'bg-yellow-900 text-yellow-100';
  return 'bg-slate-800 text-slate-200';
}

function sourceLabel(source: TaskSource): string {
  return source === 'hito_automatico' ? 'Hito automático' : 'Manual';
}

function statusLabel(status: TaskStatus): string {
  if (status === 'en_curso') return 'En curso';
  return status;
}

export default function TareasPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [manualTasks, setManualTasks] = useState<ManualTaskSeed[]>(mockManualTasks);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<ManualTaskFormState>(initialForm);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'todas'>('todas');
  const [sourceFilter, setSourceFilter] = useState<TaskSource | 'todas'>('todas');
  const [query, setQuery] = useState('');

  useEffect(() => {
    async function loadTasks() {
      try {
        const [loadedCourses, loadedManualTasks] = await Promise.all([getCourses(), getManualTasks()]);
        setCourses(loadedCourses);
        setManualTasks(loadedManualTasks);
        if (loadedCourses[0]?.id) setForm((current) => ({ ...current, courseId: loadedCourses[0].id }));
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar las tareas.');
      } finally {
        setHasLoaded(true);
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      saveManualTasks(manualTasks).catch((error) => setLoadError(error instanceof Error ? error.message : 'No se pudieron guardar las tareas.'));
    }
  }, [hasLoaded, manualTasks]);

  const allTasks = useMemo(() => getCourseTasks(courses, manualTasks), [courses, manualTasks]);

  const filteredTasks = useMemo(() => {
    const byStatus = filterTasksByStatus(allTasks, statusFilter);
    const bySource = filterTasksBySource(byStatus, sourceFilter);
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return bySource;

    return bySource.filter((task) =>
      [task.title, task.description, task.courseCode ?? '', task.courseName ?? '', task.responsible, task.relatedLabel, task.linkType, task.priority, task.status]
        .join(' ')
        .toLowerCase()
        .includes(cleanQuery),
    );
  }, [allTasks, query, sourceFilter, statusFilter]);

  const summary = getTaskSummary(filteredTasks);
  const todayTasks = getTodayTasks(filteredTasks);
  const upcomingTasks = getUpcomingTasks(filteredTasks, 15);

  function updateForm<K extends keyof ManualTaskFormState>(field: K, value: ManualTaskFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function createManualTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const course = courses.find((item) => item.id === form.courseId);
    const generatedId = `manual-${Date.now()}`;

    const newTask: ManualTaskSeed = {
      id: generatedId,
      title: form.title.trim() || 'Tarea manual sin título',
      description: form.description.trim() || 'Tarea creada manualmente desde la bandeja operativa.',
      courseId: form.linkType === 'general' ? undefined : course?.id,
      courseCode: form.linkType === 'general' ? undefined : course?.code,
      courseName: form.linkType === 'general' ? undefined : course?.name,
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
      responsible: form.responsible.trim() || 'DIENA - Sección de Perfeccionamiento',
      linkType: form.linkType,
      relatedLabel: form.relatedLabel.trim() || course?.code || 'Tarea general',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      await createTask(newTask);
      setManualTasks((current) => [newTask, ...current]);
      setForm((current) => ({ ...initialForm, courseId: current.courseId }));
      setSourceFilter('manual');
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo crear la tarea.');
    }
  }

  async function deleteManualTask(taskId: string): Promise<void> {
    try {
      await deleteTask(taskId);
      setManualTasks((current) => current.filter((task) => task.id !== taskId));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudo eliminar la tarea.');
    }
  }

  async function resetManualTasks(): Promise<void> {
    try {
      const resetTasks = await resetManualTasksRepository();
      setManualTasks(resetTasks);
      setSourceFilter('manual');
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudieron restaurar las tareas demo.');
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Ejecución</p>
        <h1 className="mt-3 text-3xl font-bold">Tareas operativas</h1>
        <p className="mt-3 max-w-4xl text-slate-300">Bandeja unificada de tareas automáticas derivadas de los cursos cargados por dataRepository y tareas manuales.</p>
        {loadError ? <p className="mt-3 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{loadError}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-7">
        <Kpi label="Total" value={summary.total} />
        <Kpi label="Automáticas" value={summary.automatic} />
        <Kpi label="Manuales" value={summary.manual} />
        <Kpi label="Críticas" value={summary.critical} />
        <Kpi label="Alta" value={summary.high} />
        <Kpi label="Bloqueadas" value={summary.blocked} />
        <Kpi label="Finalizadas" value={summary.completed} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-center">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por curso, tarea, responsable, vínculo, instancia, documento..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'todas')} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"><option value="todas">Todos los estados</option><option value="pendiente">Pendiente</option><option value="en_curso">En curso</option><option value="bloqueada">Bloqueada</option><option value="finalizada">Finalizada</option></select>
          <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as TaskSource | 'todas')} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"><option value="todas">Todos los orígenes</option><option value="hito_automatico">Hitos automáticos</option><option value="manual">Manuales</option></select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl"><div className="border-b border-slate-800 p-5"><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Bandeja principal</p><h2 className="mt-2 text-2xl font-bold">Qué hay que ejecutar</h2><p className="mt-2 text-sm text-slate-400">Cada tarea conserva su origen, vínculo y trazabilidad operativa.</p></div><div className="divide-y divide-slate-800">{filteredTasks.map((task) => <TaskCard key={task.id} task={task} onDelete={deleteManualTask} />)}{!filteredTasks.length ? <div className="p-8 text-center text-slate-400">No hay tareas que coincidan con los filtros aplicados.</div> : null}</div></article>
        <aside className="space-y-5"><Panel title="Hoy o vencidas" value={todayTasks.length} description="Tareas cuya fecha límite ya ha llegado o está vencida." tone="red" /><Panel title="Próximos 15 días" value={upcomingTasks.length} description="Tareas que conviene anticipar antes de que bloqueen el curso." tone="blue" /><ManualTaskForm courses={courses} form={form} onChange={updateForm} onSubmit={createManualTask} onReset={resetManualTasks} /></aside>
      </div>
    </section>
  );
}

function ManualTaskForm({ courses, form, onChange, onSubmit, onReset }: { courses: Course[]; form: ManualTaskFormState; onChange: <K extends keyof ManualTaskFormState>(field: K, value: ManualTaskFormState[K]) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onReset: () => void; }) {
  return <form onSubmit={onSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Crear tarea manual</p><p className="mt-2 text-xs text-slate-400">Las tareas manuales se gestionan mediante la capa común de datos.</p><div className="mt-4 space-y-3"><input value={form.title} onChange={(event) => onChange('title', event.target.value)} placeholder="Título de la tarea" className="input" /><textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} placeholder="Descripción" rows={3} className="input" /><select value={form.courseId} onChange={(event) => onChange('courseId', event.target.value)} className="input">{courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}</select><div className="grid gap-3 sm:grid-cols-2"><select value={form.linkType} onChange={(event) => onChange('linkType', event.target.value as TaskLinkType)} className="input"><option value="curso">Curso</option><option value="hito">Hito</option><option value="instancia">Instancia</option><option value="documento">Documento</option><option value="general">General</option></select><input value={form.relatedLabel} onChange={(event) => onChange('relatedLabel', event.target.value)} placeholder="Etiqueta vínculo" className="input" /></div><div className="grid gap-3 sm:grid-cols-2"><input type="date" value={form.dueDate} onChange={(event) => onChange('dueDate', event.target.value)} className="input" /><select value={form.priority} onChange={(event) => onChange('priority', event.target.value as TaskPriority)} className="input"><option value="critica">Crítica</option><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></div><div className="grid gap-3 sm:grid-cols-2"><select value={form.status} onChange={(event) => onChange('status', event.target.value as TaskStatus)} className="input"><option value="pendiente">Pendiente</option><option value="en_curso">En curso</option><option value="bloqueada">Bloqueada</option><option value="finalizada">Finalizada</option></select><input value={form.responsible} onChange={(event) => onChange('responsible', event.target.value)} placeholder="Responsable" className="input" /></div><button type="submit" className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Crear tarea manual</button><button type="button" onClick={onReset} className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">Restaurar tareas manuales demo</button></div><style jsx>{`.input { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(51 65 85); background: rgb(15 23 42); padding: 0.75rem 0.875rem; color: rgb(226 232 240); outline: none; font-size: 0.875rem; } .input:focus { border-color: rgb(59 130 246); }`}</style></form>;
}

function TaskCard({ task, onDelete }: { task: CourseTask; onDelete: (taskId: string) => void }) { return <div className="p-5"><div className={`rounded-2xl border p-5 ${priorityClass(task.priority)}`}><div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityBadge(task.priority)}`}>{task.priority}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{sourceLabel(task.source)}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">{statusLabel(task.status)}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">{task.linkType}</span>{task.milestoneCode ? <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{task.milestoneCode}</span> : null}</div><h3 className="mt-3 text-lg font-semibold">{task.title}</h3><p className="mt-2 text-sm opacity-85">{task.description}</p><div className="mt-4 flex flex-wrap gap-3 text-sm">{task.courseId ? <Link href={`/cursos/${task.courseId}`} className="font-semibold text-blue-200 hover:text-blue-100">{task.courseCode} · {task.courseName}</Link> : <span className="font-semibold text-slate-200">{task.relatedLabel}</span>}<span className="text-slate-400">Responsable: {task.responsible}</span></div></div><div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left xl:text-right"><p className="text-xs uppercase tracking-wide text-slate-500">Fecha límite</p><p className="mt-1 whitespace-nowrap font-bold text-slate-100">{formatCourseDate(task.dueDate)}</p>{task.courseId ? <Link href={`/cursos/${task.courseId}`} className="mt-3 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200">Abrir curso</Link> : null}{task.source === 'manual' ? <button type="button" onClick={() => onDelete(task.id)} className="mt-3 block text-sm font-semibold text-red-300 hover:text-red-200 xl:ml-auto">Eliminar</button> : null}</div></div></div></div>; }
function Kpi({ label, value }: { label: string; value: number }) { return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>; }
function Panel({ title, value, description, tone }: { title: string; value: number; description: string; tone: 'red' | 'blue' }) { const toneClass = tone === 'red' ? 'border-red-800 bg-red-950/30 text-red-100' : 'border-blue-800 bg-blue-950/30 text-blue-100'; return <article className={`rounded-2xl border p-5 shadow-xl ${toneClass}`}><p className="text-sm uppercase tracking-[0.3em] opacity-80">{title}</p><p className="mt-3 text-4xl font-bold">{value}</p><p className="mt-2 text-sm opacity-85">{description}</p></article>; }
