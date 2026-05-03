'use client';

import { useEffect, useMemo, useState } from 'react';
import { Course } from '../../lib/courseMilestones';
import { mockCourses } from '../../lib/mockCourses';
import { AdministrativeInstance } from '../../lib/instances';
import { getCourses } from '../../lib/dataRepository';
import { readStoredInstances } from '../../lib/localStorage';
import { buildCourseStatisticsRows, buildCoursesStatusRows, buildInstanceRows, buildSummaryRows, exportDienaWorkbook } from '../../lib/excelExport';

export default function ExportPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [instances, setInstances] = useState<AdministrativeInstance[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadExportData() {
      try {
        const loadedCourses = await getCourses();
        setCourses(loadedCourses);
        setInstances(readStoredInstances());
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los datos para exportación.');
      }
    }
    loadExportData();
  }, []);

  const summary = useMemo(() => buildSummaryRows(courses, instances), [courses, instances]);
  const courseRows = useMemo(() => buildCoursesStatusRows(courses), [courses]);
  const statisticsRows = useMemo(() => buildCourseStatisticsRows(courses), [courses]);
  const instanceRows = useMemo(() => buildInstanceRows(instances), [instances]);

  function handleExport(): void {
    exportDienaWorkbook(courses, instances);
    setExportMessage('Excel generado correctamente con los datos cargados.');
  }

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Exportación</p>
        <h1 className="mt-3 text-3xl font-bold">Excel automático DIENA Control 360</h1>
        <p className="mt-3 max-w-4xl text-slate-300">Genera un archivo Excel con el estado real de cursos, estadísticas de alumnado e instancias cargadas en la aplicación.</p>
        {loadError ? <p className="mt-3 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{loadError}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Cursos" value={courses.length} />
        <Kpi label="Filas estado cursos" value={courseRows.length} />
        <Kpi label="Filas estadísticas" value={statisticsRows.length} />
        <Kpi label="Instancias" value={instanceRows.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Archivo generado</p>
          <h2 className="mt-3 text-2xl font-bold">DIENA_CONTROL_360</h2>
          <p className="mt-3 text-sm text-slate-400">El Excel se genera con cuatro hojas: Resumen, Estado cursos, Estadísticas cursos e Instancias.</p>
          <button onClick={handleExport} className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Generar Excel automático</button>
          {exportMessage ? <div className="mt-4 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4 text-sm text-emerald-100">{exportMessage}</div> : null}
        </aside>

        <main className="space-y-6">
          <Preview title="Resumen" rows={summary} />
          <Preview title="Estado cursos" rows={courseRows.slice(0, 8)} />
          <Preview title="Estadísticas cursos" rows={statisticsRows.slice(0, 8)} />
          <Preview title="Instancias" rows={instanceRows.slice(0, 8)} emptyText="No hay instancias cargadas todavía." />
        </main>
      </div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>;
}

function Preview({ title, rows, emptyText = 'Sin datos.' }: { title: string; rows: Record<string, unknown>[]; emptyText?: string }) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  return <article className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl"><div className="border-b border-slate-800 p-5"><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-400">Previsualización de las primeras filas que se exportarán.</p></div>{rows.length ? <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-800 text-sm"><thead className="bg-slate-950/70 text-left text-xs uppercase tracking-wide text-slate-400"><tr>{headers.map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{rows.map((row, index) => <tr key={index}>{headers.map((header) => <td key={header} className="whitespace-nowrap px-4 py-3 text-slate-300">{String(row[header] ?? '')}</td>)}</tr>)}</tbody></table></div> : <div className="p-8 text-center text-slate-400">{emptyText}</div>}</article>;
}
