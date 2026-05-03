'use client';

import { useMemo, useState } from 'react';
import { createTask, saveCourses } from '../../lib/dataRepository';
import { Course } from '../../lib/courseMilestones';
import { buildInstanceFromRow, buildTaskFromRow, parseDelimitedText, previewCourseImport } from '../../lib/importEngine';
import { readStoredInstances, writeStoredInstances } from '../../lib/localStorage';

const sampleCsv = `Codigo;Nombre;Estado;Tipo;Modalidad;Escuela;Inicio;Fin;Activo;Alumnos nombrados;Bajas;Egresados;Mujeres egresadas;Reconocimiento medico
60046 2026 001;ECOM TCI para Suboficiales;ACTIVADO;ECOM;Mixto;Escuela Antonio de Escaño;14/09/2026;09/10/2026;SI;24;1;0;0;NO`;

type ImportMode = 'courses' | 'tasks' | 'instances';

export default function ImportPage() {
  const [mode, setMode] = useState<ImportMode>('courses');
  const [rawText, setRawText] = useState(sampleCsv);
  const [message, setMessage] = useState<string | null>(null);
  const rows = useMemo(() => parseDelimitedText(rawText), [rawText]);
  const coursePreview = useMemo(() => previewCourseImport(rows), [rows]);

  async function importCourses(): Promise<void> {
    if (coursePreview.invalidRows > 0) {
      setMessage('Importación bloqueada: hay filas con errores. Corrige el CSV antes de volcar.');
      return;
    }
    await saveCourses(coursePreview.rows as Course[]);
    setMessage(`Cursos importados correctamente: ${coursePreview.rows.length}.`);
  }

  async function importTasks(): Promise<void> {
    const tasks = rows.map(buildTaskFromRow).filter((task) => task.title && task.dueDate);
    await Promise.all(tasks.map((task) => createTask(task)));
    setMessage(`Tareas importadas correctamente: ${tasks.length}.`);
  }

  function importInstances(): void {
    const instances = rows.map(buildInstanceFromRow).filter((item) => item.reference && item.subject);
    writeStoredInstances([...instances, ...readStoredInstances()]);
    setMessage(`Instancias importadas correctamente: ${instances.length}.`);
  }

  async function executeImport(): Promise<void> {
    setMessage(null);
    if (!rows.length) {
      setMessage('No hay filas para importar.');
      return;
    }
    if (mode === 'courses') return importCourses();
    if (mode === 'tasks') return importTasks();
    return importInstances();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Importación 2.0</p>
        <h1 className="mt-3 text-3xl font-bold">Volcado asistido de datos</h1>
        <p className="mt-3 max-w-4xl text-slate-400">Pega un CSV separado por punto y coma o coma. El sistema normaliza cabeceras, valida campos críticos y muestra una previsualización antes de guardar datos.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <label className="block text-sm"><span className="mb-2 block font-medium text-slate-300">Tipo de volcado</span><select value={mode} onChange={(event) => setMode(event.target.value as ImportMode)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-blue-500"><option value="courses">Cursos</option><option value="tasks">Tareas</option><option value="instances">Instancias</option></select></label>
          <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300"><p className="font-semibold text-slate-100">Lectura detectada</p><p className="mt-2">Filas: {rows.length}</p>{mode === 'courses' ? <><p>Válidas: {coursePreview.validRows}</p><p>Con error: {coursePreview.invalidRows}</p><p>Incidencias: {coursePreview.issues.length}</p></> : null}</div>
          <button onClick={executeImport} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Ejecutar volcado validado</button>
          {message ? <div className="mt-4 rounded-2xl border border-blue-800 bg-blue-950/30 p-4 text-sm text-blue-100">{message}</div> : null}
        </aside>

        <main className="space-y-6">
          <textarea value={rawText} onChange={(event) => setRawText(event.target.value)} rows={12} className="w-full rounded-3xl border border-slate-800 bg-slate-950 p-5 font-mono text-sm text-slate-100 outline-none focus:border-blue-500" />

          {mode === 'courses' ? <div className="rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"><div className="border-b border-slate-800 p-5"><h2 className="text-xl font-bold">Previsualización de cursos</h2><p className="mt-1 text-sm text-slate-400">La importación se bloquea si hay errores críticos.</p></div><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-800 text-sm"><thead className="bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Inicio</th><th className="px-4 py-3">Fin</th><th className="px-4 py-3">Hitos</th></tr></thead><tbody className="divide-y divide-slate-800">{coursePreview.rows.slice(0, 20).map((course) => <tr key={course.id}><td className="px-4 py-3 font-semibold text-blue-200">{course.code}</td><td className="px-4 py-3">{course.name}</td><td className="px-4 py-3">{course.status}</td><td className="px-4 py-3">{course.startDate}</td><td className="px-4 py-3">{course.endDate}</td><td className="px-4 py-3">{course.milestones.length}</td></tr>)}</tbody></table></div>{coursePreview.issues.length ? <div className="border-t border-slate-800 p-5"><h3 className="font-semibold text-red-100">Incidencias detectadas</h3><div className="mt-3 space-y-2">{coursePreview.issues.slice(0, 20).map((issue, index) => <p key={`${issue.row}-${issue.field}-${index}`} className={`rounded-xl border p-3 text-sm ${issue.severity === 'error' ? 'border-red-800 bg-red-950/40 text-red-100' : 'border-yellow-800 bg-yellow-950/40 text-yellow-100'}`}>Fila {issue.row}{issue.field ? ` · ${issue.field}` : ''}: {issue.message}</p>)}</div></div> : null}</div> : <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-300">Previsualización simple: {rows.length} filas preparadas para {mode === 'tasks' ? 'tareas' : 'instancias'}. El volcado omitirá filas sin campos mínimos.</div>}
        </main>
      </div>
    </section>
  );
}
