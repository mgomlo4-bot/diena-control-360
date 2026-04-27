'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { Course } from '../../lib/courseMilestones';
import { ManualTaskSeed } from '../../lib/courseTasks';
import { backupToJson, createBackup, parseBackupJson } from '../../lib/backup';
import { readStoredCourses, readStoredManualTasks, writeStoredCourses, writeStoredManualTasks } from '../../lib/localStorage';
import { mockCourses } from '../../lib/mockCourses';
import { mockManualTasks } from '../../lib/mockTasks';

export default function RespaldoPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [manualTasks, setManualTasks] = useState<ManualTaskSeed[]>(mockManualTasks);
  const [status, setStatus] = useState('Preparado para exportar o importar datos locales.');

  useEffect(() => {
    setCourses(readStoredCourses());
    setManualTasks(readStoredManualTasks());
  }, []);

  function refreshLocalData(): void {
    setCourses(readStoredCourses());
    setManualTasks(readStoredManualTasks());
    setStatus('Datos locales actualizados desde el navegador.');
  }

  function exportBackup(): void {
    const backup = createBackup(courses, manualTasks);
    const json = backupToJson(backup);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `diena-control-360-backup-${date}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Backup JSON exportado correctamente.');
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rawText = String(reader.result ?? '');
        const backup = parseBackupJson(rawText);
        writeStoredCourses(backup.courses);
        writeStoredManualTasks(backup.manualTasks);
        setCourses(backup.courses);
        setManualTasks(backup.manualTasks);
        setStatus(`Backup importado correctamente. Exportado originalmente el ${new Date(backup.exportedAt).toLocaleString('es-ES')}.`);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'No se pudo importar el backup.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function restoreDemo(): void {
    writeStoredCourses(mockCourses);
    writeStoredManualTasks(mockManualTasks);
    setCourses(mockCourses);
    setManualTasks(mockManualTasks);
    setStatus('Datos demo restaurados correctamente.');
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Respaldo local</p>
        <h1 className="mt-3 text-3xl font-bold">Importar y exportar datos</h1>
        <p className="mt-3 max-w-4xl text-slate-300">
          Descarga una copia JSON de los cursos, hitos y tareas manuales guardados en el navegador, o restaura una copia previa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Cursos locales" value={courses.length} />
        <Kpi label="Tareas manuales" value={manualTasks.length} />
        <Kpi label="Hitos totales" value={courses.reduce((sum, course) => sum + course.milestones.length, 0)} />
        <Kpi label="Hitos completados" value={courses.reduce((sum, course) => sum + course.milestones.filter((milestone) => milestone.completed).length, 0)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Acciones</p>
          <h2 className="mt-2 text-2xl font-bold">Gestión de backup</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={exportBackup} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
              Exportar backup JSON
            </button>
            <label className="cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
              Importar backup JSON
              <input type="file" accept="application/json,.json" onChange={importBackup} className="hidden" />
            </label>
            <button type="button" onClick={refreshLocalData} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">
              Recargar datos locales
            </button>
            <button type="button" onClick={restoreDemo} className="rounded-xl border border-red-800 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-950/40">
              Restaurar demo
            </button>
          </div>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
            {status}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contenido del backup</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Cursos editados.</li>
              <li>Hitos y checks completados.</li>
              <li>Observaciones de hitos.</li>
              <li>Tareas manuales.</li>
              <li>Vínculos de tareas con cursos, instancias o documentos.</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-yellow-800 bg-yellow-950/30 p-5 text-yellow-100 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">Aviso</p>
            <p className="mt-3 text-sm opacity-90">
              Este respaldo es local y provisional. Cuando se conecte base de datos real, esta pantalla servirá como exportación/importación auxiliar.
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
