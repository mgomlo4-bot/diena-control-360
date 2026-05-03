'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Course, getLastCompletedMilestone, getNextPendingMilestone, isMilestoneOverdue } from '../../lib/courseMilestones';
import { ManualTaskSeed, TaskPriority } from '../../lib/courseTasks';
import { mockCourses } from '../../lib/mockCourses';
import { createTask, getCourses, getManualTasks } from '../../lib/dataRepository';
import { formatCourseDate } from '../../lib/courseUtils';
import { readStoredInstances } from '../../lib/localStorage';
import { AdministrativeInstance, instanceStatusLabels } from '../../lib/instances';

const taskTypes = ['Consultar estado global', 'Consultar curso', 'Consultar instancias', 'Crear tarea'];

type TaskDraft = {
  title: string;
  description: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  dueDate: string;
  priority: TaskPriority;
  responsible: string;
  linkType: 'curso' | 'general';
  relatedLabel: string;
};

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function norm(text: string): string {
  return text.toLowerCase().trim();
}

function findCourse(courses: Course[], text: string): Course | undefined {
  const query = norm(text);
  return courses.find((course) => norm([course.code, course.name, course.status, course.type, course.school].join(' ')).includes(query) || query.includes(norm(course.code)) || query.includes(norm(course.name)));
}

function courseStatusText(course: Course): string {
  const next = getNextPendingMilestone(course.milestones);
  const last = getLastCompletedMilestone(course.milestones);
  const overdue = isMilestoneOverdue(next);
  return [`${course.code} - ${course.name}`, `Estado: ${course.status}`, `Inicio: ${formatCourseDate(course.startDate)} · Fin: ${formatCourseDate(course.endDate)}`, `Nombrados: ${course.appointedStudents} · Bajas: ${course.droppedStudents} · Egresados: ${course.graduatedStudents}`, `Último hito: ${last?.name ?? 'sin hitos completados'}`, `Siguiente hito: ${next ? `${next.name} (${formatCourseDate(next.calculatedDate)})${overdue ? ' · VENCIDO' : ''}` : 'seguimiento completado'}`].join('\n');
}

function globalStatusText(courses: Course[], tasks: ManualTaskSeed[]): string {
  if (!courses.length) return 'No hay cursos cargados. No puedo devolver estado real hasta que existan datos.';
  const active = courses.filter((course) => course.active).length;
  const overdue = courses.filter((course) => isMilestoneOverdue(getNextPendingMilestone(course.milestones))).length;
  const pendingActa = courses.filter((course) => course.milestones.some((milestone) => milestone.id === 'acta-receive' && !milestone.completed)).length;
  const pendingBod = courses.filter((course) => course.status.toLowerCase().includes('bod') || getNextPendingMilestone(course.milestones)?.name.toLowerCase().includes('bod')).length;
  const nextItems = [...courses].map((course) => ({ course, next: getNextPendingMilestone(course.milestones) })).filter((item) => item.next).sort((a, b) => String(a.next?.calculatedDate).localeCompare(String(b.next?.calculatedDate))).slice(0, 5);
  return ['Estado global real:', `Cursos cargados: ${courses.length}`, `Cursos activos: ${active}`, `Cursos con hito vencido: ${overdue}`, `Cursos con acta pendiente: ${pendingActa}`, `Cursos con BOD pendiente/próximo: ${pendingBod}`, `Tareas manuales cargadas: ${tasks.length}`, '', 'Próximos hitos:', ...nextItems.map((item) => `- ${item.course.code}: ${item.next?.name} (${formatCourseDate(item.next?.calculatedDate ?? '')})`)].join('\n');
}

function instancesText(instances: AdministrativeInstance[], prompt: string): string {
  if (!instances.length) return 'No hay instancias cargadas. No voy a inventar datos: cuando se registren, podré consultar estado, responsable, vencimiento, última actuación y siguiente paso.';
  const query = norm(prompt);
  const matched = instances.find((item) => norm([item.reference, item.subject, item.applicant, item.courseCode, item.courseName, item.status].filter(Boolean).join(' ')).includes(query));
  if (matched) return [`Referencia: ${matched.reference}`, `Asunto: ${matched.subject}`, `Interesado: ${matched.applicant}`, `Estado: ${instanceStatusLabels[matched.status]}`, `Prioridad: ${matched.priority}`, `Entrada: ${formatCourseDate(matched.entryDate)}${matched.dueDate ? ` · Vencimiento: ${formatCourseDate(matched.dueDate)}` : ''}`, `Responsable: ${matched.responsible}`, `Última actuación: ${matched.lastAction}`, `Siguiente paso: ${matched.nextAction}`].join('\n');
  return ['Estado global de instancias:', `Instancias cargadas: ${instances.length}`, ...instances.slice(0, 8).map((item) => `- ${item.reference}: ${item.subject} · ${instanceStatusLabels[item.status]}`)].join('\n');
}

function createDraft(prompt: string, courses: Course[]): TaskDraft {
  const course = findCourse(courses, prompt);
  const priority: TaskPriority = norm(prompt).includes('urgente') || norm(prompt).includes('critica') ? 'critica' : 'media';
  return { title: prompt.trim().slice(0, 100) || 'Nueva tarea DIENA', description: prompt.trim() || 'Tarea creada desde el asistente.', courseId: course?.id, courseCode: course?.code, courseName: course?.name, dueDate: addDaysIso(priority === 'critica' ? 1 : 3), priority, responsible: 'DIENA - Sección de Perfeccionamiento', linkType: course ? 'curso' : 'general', relatedLabel: course ? `${course.code} · Asistente` : 'Asistente' };
}

export default function AsistentePage() {
  const [taskType, setTaskType] = useState(taskTypes[0]);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [manualTasks, setManualTasks] = useState<ManualTaskSeed[]>([]);
  const [instances, setInstances] = useState<AdministrativeInstance[]>([]);
  const [courseId, setCourseId] = useState(mockCourses[0]?.id ?? '');
  const [prompt, setPrompt] = useState('Dame el estado global de los cursos');
  const [answer, setAnswer] = useState('');
  const [draft, setDraft] = useState<TaskDraft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const selectedCourse = courses.find((course) => course.id === courseId);

  useEffect(() => {
    async function loadData() {
      const [loadedCourses, loadedTasks] = await Promise.all([getCourses(), getManualTasks()]);
      setCourses(loadedCourses);
      setManualTasks(loadedTasks);
      setInstances(readStoredInstances());
      if (loadedCourses[0]?.id) setCourseId(loadedCourses[0].id);
    }
    loadData().catch((error) => setNotice(error instanceof Error ? error.message : 'No se pudieron cargar los datos.'));
  }, []);

  const contextSummary = useMemo(() => ({ courses: courses.length, tasks: manualTasks.length, instances: instances.length }), [courses.length, manualTasks.length, instances.length]);

  function runAssistant(): void {
    setNotice(null);
    setDraft(null);
    const text = norm(prompt);
    if (text.includes('tarea') && (text.includes('crea') || text.includes('crear') || text.includes('apunta') || text.includes('programa'))) {
      const nextDraft = createDraft(prompt, courses);
      setDraft(nextDraft);
      setAnswer(['He preparado una tarea real para guardar.', `Título: ${nextDraft.title}`, `Vencimiento: ${formatCourseDate(nextDraft.dueDate)}`, `Prioridad: ${nextDraft.priority}`, nextDraft.courseCode ? `Curso vinculado: ${nextDraft.courseCode} - ${nextDraft.courseName}` : 'Curso vinculado: ninguno detectado'].join('\n'));
      return;
    }
    if (text.includes('instancia') || text.includes('recurso') || text.includes('expediente')) {
      setAnswer(instancesText(instances, prompt));
      return;
    }
    const matched = findCourse(courses, prompt) ?? selectedCourse;
    if ((text.includes('curso') || text.includes('estado')) && matched && !text.includes('global') && !text.includes('general')) {
      setAnswer(courseStatusText(matched));
      return;
    }
    setAnswer(globalStatusText(courses, manualTasks));
  }

  async function saveDraftAsTask(): Promise<void> {
    if (!draft) return;
    const created = await createTask({ ...draft, status: 'pendiente', createdAt: new Date().toISOString().slice(0, 10) });
    setManualTasks((current) => [created as ManualTaskSeed, ...current]);
    setNotice('Tarea creada y guardada correctamente.');
    setDraft(null);
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Asistente DIENA 2.0</p>
        <h1 className="mt-3 text-2xl font-bold">Copiloto con datos reales</h1>
        <p className="mt-3 text-sm text-slate-400">Consulta cursos, hitos, tareas e instancias cargadas. Puede crear tareas persistentes cuando se lo ordenes.</p>
        <div className="mt-5 grid gap-3 text-sm text-slate-300"><div className="rounded-2xl border border-slate-700 bg-slate-950 p-4">Cursos: {contextSummary.courses} · Tareas: {contextSummary.tasks} · Instancias: {contextSummary.instances}</div></div>
        <div className="mt-6 space-y-4">
          <label className="block text-sm"><span className="mb-2 block font-medium text-slate-300">Modo</span><select value={taskType} onChange={(event) => setTaskType(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500">{taskTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="block text-sm"><span className="mb-2 block font-medium text-slate-300">Curso de referencia</span><select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500">{courses.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}</select></label>
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300"><p className="font-semibold text-slate-100">Curso seleccionado</p><p className="mt-2">{selectedCourse?.code}</p><p>{selectedCourse?.name}</p><p className="mt-2 text-slate-400">Estado: {selectedCourse?.status}</p></div>
        </div>
      </aside>
      <main className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 p-6"><p className="text-sm uppercase tracking-[0.3em] text-blue-300">Respuesta operativa</p><h2 className="mt-3 text-2xl font-bold">{taskType}</h2><p className="mt-3 text-slate-400">Escribe una consulta natural: estado global, estado de un curso, instancias o creación de tarea.</p></div>
        <div className="space-y-4 p-6">
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={5} className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100 outline-none focus:border-blue-500" />
          <div className="flex flex-wrap gap-3"><button onClick={runAssistant} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Ejecutar asistente</button>{draft ? <button onClick={saveDraftAsTask} className="rounded-xl border border-emerald-700 bg-emerald-950 px-4 py-3 text-sm font-semibold text-emerald-100">Guardar tarea real</button> : null}<Link href="/tareas" className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">Ver tareas</Link></div>
          {notice ? <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-100">{notice}</div> : null}
          <div className="rounded-2xl border border-blue-800 bg-blue-950/30 p-5"><p className="text-sm uppercase tracking-wide text-blue-200">Respuesta</p><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-100">{answer || 'Todavía no hay respuesta. Ejecuta una consulta.'}</pre></div>
        </div>
      </main>
    </section>
  );
}
