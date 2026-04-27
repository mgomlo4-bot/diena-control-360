import Link from 'next/link';
import { mockCourses } from '../lib/mockCourses';
import { getCourseTasks, getTaskSummary, getTodayTasks, getUpcomingTasks } from '../lib/courseTasks';
import { formatCourseDate } from '../lib/courseUtils';

const tasks = getCourseTasks(mockCourses);
const todayTasks = getTodayTasks(tasks);
const upcomingTasks = getUpcomingTasks(tasks, 7);
const summary = getTaskSummary(tasks);

const kpis = [
  { label: 'Cursos activos', value: String(mockCourses.filter((course) => course.active).length) },
  { label: 'Tareas críticas', value: String(summary.critical) },
  { label: 'Tareas próximas', value: String(upcomingTasks.length) },
  { label: 'Total tareas pendientes', value: String(summary.total) },
];

function priorityClass(priority: string): string {
  if (priority === 'critica') return 'bg-red-900 text-red-100';
  if (priority === 'alta') return 'bg-orange-900 text-orange-100';
  if (priority === 'media') return 'bg-yellow-900 text-yellow-100';
  return 'bg-slate-800 text-slate-200';
}

export default function DashboardPage() {
  const mainTasks = [...todayTasks, ...upcomingTasks].slice(0, 8);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">DIENA CONTROL 360</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Panel operativo para controlar cursos, hitos administrativos, tareas derivadas, plazos, instancias y publicaciones de finalización.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/cursos"
            className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Ir al control de cursos
          </Link>
          <Link
            href="/tareas"
            className="inline-flex rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Ver tareas operativas
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">{kpi.label}</p>
            <p className="mt-3 text-3xl font-bold">{kpi.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Qué tengo que hacer hoy</p>
            <h2 className="mt-2 text-2xl font-bold">Acciones prioritarias</h2>
            <p className="mt-2 text-sm text-slate-400">Tareas generadas automáticamente desde hitos pendientes de los cursos.</p>
          </div>
          <div className="divide-y divide-slate-800">
            {mainTasks.map((task) => (
              <div key={task.id} className="grid gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(task.priority)}`}>{task.priority}</span>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-blue-200">{task.milestoneCode}</span>
                    <Link href={`/cursos/${task.courseId}`} className="text-sm font-semibold text-blue-300 hover:text-blue-200">
                      {task.courseCode}
                    </Link>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-100">{task.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{task.courseName}</p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Fecha límite</p>
                  <p className="mt-1 font-semibold text-slate-100">{formatCourseDate(task.dueDate)}</p>
                </div>
              </div>
            ))}
            {!mainTasks.length ? (
              <div className="p-8 text-center text-slate-400">No hay tareas críticas ni próximas en los próximos 7 días.</div>
            ) : null}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-3xl border border-red-800 bg-red-950/30 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-red-200">Crítico</p>
            <p className="mt-3 text-4xl font-bold">{summary.critical}</p>
            <p className="mt-2 text-sm text-red-100/80">Tareas vencidas o bloqueadas por hitos superados.</p>
          </article>
          <article className="rounded-3xl border border-orange-800 bg-orange-950/30 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Alta prioridad</p>
            <p className="mt-3 text-4xl font-bold">{summary.high}</p>
            <p className="mt-2 text-sm text-orange-100/80">Tareas con vencimiento inmediato.</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sistema</p>
            <p className="mt-3 text-sm text-slate-300">
              El dashboard ya se alimenta de los hitos de cursos y no de cifras fijas. Esto prepara la conexión futura con base de datos.
            </p>
          </article>
        </aside>
      </div>
    </section>
  );
}
