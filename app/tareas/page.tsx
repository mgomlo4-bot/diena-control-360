'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CourseTask,
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

const allTasks = getCourseTasks(mockCourses, mockManualTasks);

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
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'todas'>('todas');
  const [sourceFilter, setSourceFilter] = useState<TaskSource | 'todas'>('todas');
  const [query, setQuery] = useState('');

  const filteredTasks = useMemo(() => {
    const byStatus = filterTasksByStatus(allTasks, statusFilter);
    const bySource = filterTasksBySource(byStatus, sourceFilter);
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return bySource;

    return bySource.filter((task) =>
      [
        task.title,
        task.description,
        task.courseCode ?? '',
        task.courseName ?? '',
        task.responsible,
        task.relatedLabel,
        task.linkType,
        task.priority,
        task.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(cleanQuery),
    );
  }, [query, sourceFilter, statusFilter]);

  const summary = getTaskSummary(filteredTasks);
  const todayTasks = getTodayTasks(filteredTasks);
  const upcomingTasks = getUpcomingTasks(filteredTasks, 15);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Ejecución</p>
        <h1 className="mt-3 text-3xl font-bold">Tareas operativas</h1>
        <p className="mt-3 max-w-4xl text-slate-300">
          Bandeja unificada de tareas automáticas derivadas de hitos y tareas manuales vinculadas a cursos, instancias, documentos o asuntos generales.
        </p>
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
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por curso, tarea, responsable, vínculo, instancia, documento..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'todas')}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"
          >
            <option value="todas">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En curso</option>
            <option value="bloqueada">Bloqueada</option>
            <option value="finalizada">Finalizada</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as TaskSource | 'todas')}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500"
          >
            <option value="todas">Todos los orígenes</option>
            <option value="hito_automatico">Hitos automáticos</option>
            <option value="manual">Manuales</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Bandeja principal</p>
            <h2 className="mt-2 text-2xl font-bold">Qué hay que ejecutar</h2>
            <p className="mt-2 text-sm text-slate-400">Cada tarea conserva su origen, vínculo y trazabilidad operativa.</p>
          </div>
          <div className="divide-y divide-slate-800">
            {filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)}
            {!filteredTasks.length ? (
              <div className="p-8 text-center text-slate-400">No hay tareas que coincidan con los filtros aplicados.</div>
            ) : null}
          </div>
        </article>

        <aside className="space-y-5">
          <Panel title="Hoy o vencidas" value={todayTasks.length} description="Tareas cuya fecha límite ya ha llegado o está vencida." tone="red" />
          <Panel title="Próximos 15 días" value={upcomingTasks.length} description="Tareas que conviene anticipar antes de que bloqueen el curso." tone="blue" />
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Crear tarea manual</p>
            <p className="mt-3 text-sm text-slate-300">
              El modelo ya admite tareas manuales vinculadas a curso, hito, instancia, documento o asunto general. El siguiente paso será convertir este bloque en formulario persistente.
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4 text-sm text-slate-400">
              Formulario preparado para base de datos: título, vínculo, responsable, prioridad, estado y fecha límite.
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function TaskCard({ task }: { task: CourseTask }) {
  return (
    <div className="p-5">
      <div className={`rounded-2xl border p-5 ${priorityClass(task.priority)}`}>
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityBadge(task.priority)}`}>{task.priority}</span>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{sourceLabel(task.source)}</span>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">{statusLabel(task.status)}</span>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">{task.linkType}</span>
              {task.milestoneCode ? <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{task.milestoneCode}</span> : null}
            </div>
            <h3 className="mt-3 text-lg font-semibold">{task.title}</h3>
            <p className="mt-2 text-sm opacity-85">{task.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {task.courseId ? (
                <Link href={`/cursos/${task.courseId}`} className="font-semibold text-blue-200 hover:text-blue-100">
                  {task.courseCode} · {task.courseName}
                </Link>
              ) : (
                <span className="font-semibold text-slate-200">{task.relatedLabel}</span>
              )}
              <span className="text-slate-400">Responsable: {task.responsible}</span>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left xl:text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fecha límite</p>
            <p className="mt-1 whitespace-nowrap font-bold text-slate-100">{formatCourseDate(task.dueDate)}</p>
            {task.courseId ? (
              <Link href={`/cursos/${task.courseId}`} className="mt-3 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200">
                Abrir curso
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </article>
  );
}

function Panel({ title, value, description, tone }: { title: string; value: number; description: string; tone: 'red' | 'blue' }) {
  const toneClass = tone === 'red' ? 'border-red-800 bg-red-950/30 text-red-100' : 'border-blue-800 bg-blue-950/30 text-blue-100';
  return (
    <article className={`rounded-2xl border p-5 shadow-xl ${toneClass}`}>
      <p className="text-sm uppercase tracking-[0.3em] opacity-80">{title}</p>
      <p className="mt-3 text-4xl font-bold">{value}</p>
      <p className="mt-2 text-sm opacity-85">{description}</p>
    </article>
  );
}
