'use client';

import { useMemo, useState } from 'react';
import {
  Course,
  CourseMilestone,
  generateCourseMilestones,
  getLastCompletedMilestone,
  getNextPendingMilestone,
  isMilestoneOverdue,
} from '../../lib/courseMilestones';

const initialCourses: Course[] = [
  buildCourse({
    id: 'ecom-tci-2026',
    code: '60046 2026 001',
    name: 'ECOM TCI para Suboficiales',
    status: 'ACTIVADO',
    type: 'ECOM',
    modality: 'Mixto',
    school: 'Escuela Antonio de Escaño',
    startDate: '2026-09-14',
    endDate: '2026-10-09',
    active: true,
    requiresMedicalAndPhysical: false,
    appointedStudents: 24,
    droppedStudents: 1,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
  buildCourse({
    id: 'ecom-seg-2026',
    code: '60181 2026 001',
    name: 'ECOM SEG para Suboficiales',
    status: 'PENDIENTE PRUEBAS FISICAS Y RECONOCIMIENTO MEDICO',
    type: 'ECOM',
    modality: 'Presencial',
    school: 'CESUPAR',
    startDate: '2026-06-22',
    endDate: '2026-07-03',
    active: true,
    requiresMedicalAndPhysical: true,
    appointedStudents: 18,
    droppedStudents: 0,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
  buildCourse({
    id: 'e2t-tci-ciber-2026',
    code: '62T04 2026 001',
    name: 'E2T TCI-Ciber para Oficiales',
    status: 'PENDIENTE DE NOMBRAMIENTO DE ALUMNOS',
    type: 'E2T',
    modality: 'Mixto',
    school: 'DIENA / Defensa',
    startDate: '2026-11-02',
    endDate: '2026-12-18',
    active: true,
    requiresMedicalAndPhysical: false,
    appointedStudents: 12,
    droppedStudents: 0,
    graduatedStudents: 0,
    graduatedWomen: 0,
  }),
];

function buildCourse(course: Omit<Course, 'milestones'>): Course {
  return {
    ...course,
    milestones: generateCourseMilestones(course.startDate, course.endDate, course.requiresMedicalAndPhysical),
  };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES').format(new Date(`${date}T00:00:00`));
}

function statusClass(milestone: CourseMilestone, isNext: boolean): string {
  if (milestone.completed) return 'border-emerald-700 bg-emerald-950/40 text-emerald-200';
  if (isMilestoneOverdue(milestone)) return 'border-red-700 bg-red-950/40 text-red-200';
  if (isNext) return 'border-blue-500 bg-blue-950/60 text-blue-100 ring-1 ring-blue-500/60';
  return 'border-slate-700 bg-slate-900 text-slate-300';
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0]?.id ?? '');
  const selectedCourse = courses.find((course) => course.id === selectedCourseId) ?? courses[0];

  const totals = useMemo(() => {
    return {
      active: courses.filter((course) => course.active).length,
      appointed: courses.reduce((sum, course) => sum + course.appointedStudents, 0),
      pendingMilestones: courses.reduce(
        (sum, course) => sum + course.milestones.filter((milestone) => !milestone.completed).length,
        0,
      ),
    };
  }, [courses]);

  function updateSelectedCourse(updater: (course: Course) => Course): void {
    setCourses((currentCourses) =>
      currentCourses.map((course) => (course.id === selectedCourse.id ? updater(course) : course)),
    );
  }

  function updateCourseField(field: keyof Course, value: string | boolean): void {
    updateSelectedCourse((course) => {
      const updated = { ...course, [field]: value } as Course;
      if (field === 'startDate' || field === 'endDate' || field === 'requiresMedicalAndPhysical') {
        updated.milestones = generateCourseMilestones(
          updated.startDate,
          updated.endDate,
          updated.requiresMedicalAndPhysical,
          course.milestones,
        );
      }
      return updated;
    });
  }

  function toggleMilestone(milestoneId: string): void {
    updateSelectedCourse((course) => ({
      ...course,
      milestones: course.milestones.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone,
      ),
    }));
  }

  function updateMilestoneObservation(milestoneId: string, observations: string): void {
    updateSelectedCourse((course) => ({
      ...course,
      milestones: course.milestones.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, observations } : milestone,
      ),
    }));
  }

  function regenerateMilestones(): void {
    updateSelectedCourse((course) => ({
      ...course,
      milestones: generateCourseMilestones(
        course.startDate,
        course.endDate,
        course.requiresMedicalAndPhysical,
        course.milestones,
      ),
    }));
  }

  const selectedNext = getNextPendingMilestone(selectedCourse.milestones);
  const selectedLast = getLastCompletedMilestone(selectedCourse.milestones);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Módulo operativo</p>
          <h1 className="mt-2 text-3xl font-bold">Control de cursos</h1>
          <p className="mt-2 max-w-4xl text-slate-400">
            Cada curso genera automáticamente sus hitos administrativos a partir de la fecha de inicio y fin. Al marcar un hito, el sistema muestra el siguiente pendiente.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Kpi label="Cursos activos" value={totals.active} />
          <Kpi label="Alumnos nombrados" value={totals.appointed} />
          <Kpi label="Hitos pendientes" value={totals.pendingMilestones} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-lg font-semibold">Listado general</h2>
          <p className="text-sm text-slate-400">Vista resumida con último hito completado y siguiente hito pendiente.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-950/70 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3">Último hito</th>
                <th className="px-4 py-3">Siguiente hito</th>
                <th className="px-4 py-3">Fecha hito</th>
                <th className="px-4 py-3">Aviso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {courses.map((course) => {
                const last = getLastCompletedMilestone(course.milestones);
                const next = getNextPendingMilestone(course.milestones);
                const overdue = isMilestoneOverdue(next);
                const isSelected = course.id === selectedCourse.id;
                return (
                  <tr
                    key={course.id}
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`cursor-pointer transition hover:bg-slate-800/70 ${isSelected ? 'bg-blue-950/40' : ''}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-blue-200">{course.code}</td>
                    <td className="min-w-72 px-4 py-3">{course.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">
                        {course.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(course.startDate)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(course.endDate)}</td>
                    <td className="min-w-56 px-4 py-3 text-slate-300">{last?.name ?? 'Sin hitos completados'}</td>
                    <td className="min-w-72 px-4 py-3 font-medium text-slate-100">{next?.name ?? 'Seguimiento completado'}</td>
                    <td className="whitespace-nowrap px-4 py-3">{next ? formatDate(next.calculatedDate) : '-'}</td>
                    <td className="px-4 py-3">
                      {next ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overdue ? 'bg-red-900 text-red-100' : 'bg-blue-900 text-blue-100'}`}>
                          {overdue ? 'Vencido' : 'Pendiente'}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-emerald-100">
                          Completado
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <h2 className="text-lg font-semibold">Datos del curso</h2>
          <p className="mt-1 text-sm text-slate-400">Al cambiar fechas, se recalculan los hitos automáticos conservando lo marcado.</p>

          <div className="mt-5 space-y-4">
            <Field label="Código del curso">
              <input className="input" value={selectedCourse.code} onChange={(event) => updateCourseField('code', event.target.value)} />
            </Field>
            <Field label="Nombre del curso">
              <input className="input" value={selectedCourse.name} onChange={(event) => updateCourseField('name', event.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fecha inicio">
                <input className="input" type="date" value={selectedCourse.startDate} onChange={(event) => updateCourseField('startDate', event.target.value)} />
              </Field>
              <Field label="Fecha fin">
                <input className="input" type="date" value={selectedCourse.endDate} onChange={(event) => updateCourseField('endDate', event.target.value)} />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900"
                checked={selectedCourse.requiresMedicalAndPhysical}
                onChange={(event) => updateCourseField('requiresMedicalAndPhysical', event.target.checked)}
              />
              <span>
                <span className="block font-semibold text-slate-100">Requiere pruebas físicas y reconocimiento médico</span>
                <span className="mt-1 block text-slate-400">
                  Al activarlo se inserta el hito T-5 de recepción de resultados antes de la propuesta de nombramiento.
                </span>
              </span>
            </label>

            <button
              type="button"
              onClick={regenerateMilestones}
              className="w-full rounded-xl border border-blue-700 bg-blue-950 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-900"
            >
              Regenerar hitos desde fechas del curso
            </button>
          </div>
        </aside>

        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-5">
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Ficha detalle</p>
            <h2 className="mt-2 text-2xl font-bold">Seguimiento de hitos del curso</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SummaryCard label="Último hito completado" value={selectedLast?.name ?? 'Sin hitos completados'} />
              <SummaryCard
                label="Siguiente hito pendiente"
                value={selectedNext?.name ?? 'Seguimiento completado'}
                alert={isMilestoneOverdue(selectedNext)}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-800">
            {selectedCourse.milestones.map((milestone) => {
              const isNext = selectedNext?.id === milestone.id;
              return (
                <div key={milestone.id} className={`p-4 ${isNext ? 'bg-blue-950/20' : ''}`}>
                  <div className={`rounded-2xl border p-4 ${statusClass(milestone, isNext)}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-4">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() => toggleMilestone(milestone.id)}
                          className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-950"
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-blue-200">{milestone.relativeCode}</span>
                            <span className="font-semibold">{milestone.name}</span>
                            {isNext && !milestone.completed ? (
                              <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">Próximo hito</span>
                            ) : null}
                          </span>
                          <span className="mt-2 block text-sm opacity-80">
                            Referencia: {milestone.reference === 'INICIO_CURSO' ? 'inicio del curso' : 'fin del curso'} · Desplazamiento: {milestone.offsetDays} días · Fecha: {formatDate(milestone.calculatedDate)}
                          </span>
                        </span>
                      </label>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold">
                        {milestone.completed ? 'Completado' : isMilestoneOverdue(milestone) ? 'Vencido' : 'Pendiente'}
                      </span>
                    </div>
                    <input
                      className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                      placeholder="Observaciones del hito"
                      value={milestone.observations ?? ''}
                      onChange={(event) => updateMilestoneObservation(milestone.id, event.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(51 65 85);
          background: rgb(15 23 42);
          padding: 0.75rem 0.875rem;
          color: rgb(226 232 240);
          outline: none;
        }
        .input:focus {
          border-color: rgb(59 130 246);
        }
      `}</style>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${alert ? 'border-red-700 bg-red-950/40' : 'border-slate-700 bg-slate-950'}`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}
