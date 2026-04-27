'use client';

import { useState } from 'react';
import { mockCourses } from '../../lib/mockCourses';

const taskTypes = [
  'Redactar correo',
  'Redactar oficio',
  'Analizar instancia',
  'Preparar índice de expediente',
  'Crear tarea',
  'Consultar estado de curso',
  'Preparar comunicación a escuela',
];

export default function AsistentePage() {
  const [taskType, setTaskType] = useState(taskTypes[0]);
  const [courseId, setCourseId] = useState(mockCourses[0]?.id ?? '');
  const selectedCourse = mockCourses.find((course) => course.id === courseId);

  return (
    <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Asistente DIENA</p>
        <h1 className="mt-3 text-2xl font-bold">Contexto de trabajo</h1>
        <p className="mt-3 text-sm text-slate-400">
          Interfaz preparada para conectar el asistente con cursos, instancias, documentos y tareas.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-300">Tipo de tarea</span>
            <select
              value={taskType}
              onChange={(event) => setTaskType(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500"
            >
              {taskTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-2 block font-medium text-slate-300">Curso asociado</span>
            <select
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500"
            >
              {mockCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
            <p className="font-semibold text-slate-100">Curso seleccionado</p>
            <p className="mt-2">{selectedCourse?.code}</p>
            <p>{selectedCourse?.name}</p>
            <p className="mt-2 text-slate-400">Estado: {selectedCourse?.status}</p>
          </div>
        </div>
      </aside>

      <main className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Copiloto administrativo</p>
          <h2 className="mt-3 text-2xl font-bold">{taskType}</h2>
          <p className="mt-3 text-slate-400">
            Esta pantalla deja preparada la futura conexión con IA. De momento muestra una respuesta mock con botones de acción.
          </p>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Solicitud preparada</p>
            <p className="mt-2 text-slate-100">
              Trabajar sobre el curso {selectedCourse?.code}, tarea: {taskType.toLowerCase()}.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-800 bg-blue-950/30 p-5">
            <p className="text-sm uppercase tracking-wide text-blue-200">Respuesta simulada</p>
            <p className="mt-3 text-slate-100">
              Se ha identificado el contexto del curso y se prepararía un borrador administrativo vinculado al expediente o tarea correspondiente.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">Guardar como borrador</button>
              <button className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">Crear tarea vinculada</button>
              <button className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">Vincular al curso</button>
              <button className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200">Copiar texto</button>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
