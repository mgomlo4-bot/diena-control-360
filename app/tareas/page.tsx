import Link from 'next/link';
import { getCourseTasks, getTaskSummary, getTodayTasks, getUpcomingTasks } from '../../lib/courseTasks';
import { mockCourses } from '../../lib/mockCourses';
import { formatCourseDate } from '../../lib/courseUtils';

const tasks = getCourseTasks(mockCourses);
const todayTasks = getTodayTasks(tasks);
const upcomingTasks = getUpcomingTasks(tasks, 15);
const summary = getTaskSummary(tasks);

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

export default function TareasPage() {
  const criticalTasks = tasks.filter((task) => task.priority === 'critica');
  const operationalTasks = [...criticalTasks, ...todayTasks, ...upcomingTasks]
    .filter((task, index, array) => array.findIndex((item) => item.id === task.id) === index)
    .slice(0, 30);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Ejecución</p>
        <h1 className="mt-3 text-3xl font-bold">Tareas operativas</h1>
        <p className="mt-3 max-w-4xl text-slate-300">
          Bandeja de trabajo generada automáticamente a partir de los hitos pendientes de los cursos. Prioriza lo vencido, lo que vence hoy y lo próximo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Total pendientes" value={summary.total} />
        <Kpi label="Críticas" value={summary.critical} />
        <Kpi label="Alta prioridad" value={summary.high} />
        <Kpi label="Bloqueadas" value={summary.blocked} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Bandeja principal</p>
            <h2 className="mt-2 text-2xl font-bold">Qué hay que ejecutar</h2>
            <p className="mt-2 text-sm text-slate-400">Cada tarea conserva vínculo directo con su curso y su hito de origen.</p>
          </div>
          <div className="divide-y divide-slate-800">
            {operationalTasks.map((task) => (
              <div key={task.id} className="p-5">
                <div className={`rounded-2xl border p-5 ${priorityClass(task.priority)}`}>
                  <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${priorityBadge(task.priority)}`}>{task.priority}</span>
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{task.milestoneCode}</span>
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-slate-300">{task.status}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">{task.title}</h3>
                      <p className="mt-2 text-sm opacity-85">{task.description}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-sm">
                        <Link href={`/cursos/${task.courseId}`} className="font-semibold text-blue-200 hover:text-blue-100">
                          {task.courseCode} · {task.courseName}
                        </Link>
                        <span className="text-slate-400">Responsable: {task.responsible}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-left xl:text-right">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Fecha límite</p>
                      <p className="mt-1 whitespace-nowrap font-bold text-slate-100">{formatCourseDate(task.dueDate)}</p>
                      <Link href={`/cursos/${task.courseId}`} className="mt-3 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200">
                        Abrir curso
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-5">
          <Panel title="Hoy o vencidas" value={todayTasks.length} description="Tareas cuya fecha límite ya ha llegado o está vencida." tone="red" />
          <Panel title="Próximos 15 días" value={upcomingTasks.length} description="Tareas que conviene anticipar antes de que bloqueen el curso." tone="blue" />
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Regla operativa</p>
            <p className="mt-3 text-sm text-slate-300">
              Las tareas nacen de hitos pendientes. Cuando en el futuro se conecte a base de datos, marcar un hito como completado cerrará o actualizará su tarea asociada.
            </p>
          </article>
        </aside>
      </div>
    </section>
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
