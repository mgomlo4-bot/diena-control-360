'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Course } from '../../lib/courseMilestones';
import { ManualTaskSeed } from '../../lib/courseTasks';
import { mockCourses } from '../../lib/mockCourses';
import { mockManualTasks } from '../../lib/mockTasks';
import { formatCourseDate } from '../../lib/courseUtils';
import { getCourses, getManualTasks } from '../../lib/dataRepository';
import {
  CalendarDay,
  CalendarItem,
  buildCalendarItems,
  getAvailableMonths,
  getCalendarMonthDays,
  getCriticalCalendarDays,
  groupCalendarItemsByDay,
} from '../../lib/calendar';

type CalendarFilter = 'todos' | 'hitos' | 'tareas' | 'pendientes' | 'vencidos' | 'criticos';

function loadClass(level: string): string {
  if (level === 'critica') return 'border-red-700 bg-red-950/40 text-red-100';
  if (level === 'alta') return 'border-orange-700 bg-orange-950/40 text-orange-100';
  return 'border-slate-700 bg-slate-950 text-slate-200';
}

function chipClass(item: CalendarItem): string {
  if (item.overdue) return 'border-red-700 bg-red-950/40 text-red-100';
  if (item.type === 'hito') return 'border-blue-700 bg-blue-950/40 text-blue-100';
  return 'border-slate-700 bg-slate-950 text-slate-200';
}

function filterItems(items: CalendarItem[], filter: CalendarFilter): CalendarItem[] {
  if (filter === 'todos') return items;
  if (filter === 'hitos') return items.filter((item) => item.type === 'hito');
  if (filter === 'tareas') return items.filter((item) => item.type === 'tarea');
  if (filter === 'pendientes') return items.filter((item) => !item.completed);
  if (filter === 'vencidos') return items.filter((item) => item.overdue);
  if (filter === 'criticos') return items.filter((item) => item.overdue || item.priority === 'critica');
  return items;
}

export default function HitosPage() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [manualTasks, setManualTasks] = useState<ManualTaskSeed[]>(mockManualTasks);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filter, setFilter] = useState<CalendarFilter>('todos');
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalendarData() {
      try {
        const [loadedCourses, loadedManualTasks] = await Promise.all([getCourses(), getManualTasks()]);
        setCourses(loadedCourses);
        setManualTasks(loadedManualTasks);
        setLoadError(null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los datos del calendario.');
      }
    }

    loadCalendarData();
  }, []);

  const calendarItems = useMemo(() => buildCalendarItems(courses, manualTasks), [courses, manualTasks]);
  const availableMonths = useMemo(() => getAvailableMonths(calendarItems), [calendarItems]);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      setSelectedMonth(availableMonths.includes(currentMonth) ? currentMonth : availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const filteredItems = useMemo(() => {
    const byFilter = filterItems(calendarItems, filter);
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return byFilter;

    return byFilter.filter((item) =>
      [item.title, item.courseCode ?? '', item.courseName ?? '', item.label, item.type, item.source]
        .join(' ')
        .toLowerCase()
        .includes(cleanQuery),
    );
  }, [calendarItems, filter, query]);

  const allDays = useMemo(() => groupCalendarItemsByDay(filteredItems), [filteredItems]);
  const monthDays = useMemo(() => getCalendarMonthDays(allDays, selectedMonth), [allDays, selectedMonth]);
  const criticalDays = useMemo(() => getCriticalCalendarDays(allDays).slice(0, 8), [allDays]);

  const totals = useMemo(() => ({
    days: monthDays.length,
    items: monthDays.reduce((sum, day) => sum + day.total, 0),
    critical: monthDays.filter((day) => day.loadLevel === 'critica').length,
    overdue: monthDays.reduce((sum, day) => sum + day.overdue, 0),
  }), [monthDays]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Planificación</p>
        <h1 className="mt-3 text-3xl font-bold">Calendario operativo de hitos y tareas</h1>
        <p className="mt-3 max-w-4xl text-slate-300">
          Radar de saturación diaria para detectar días con muchas finalizaciones, visados, nombramientos, BOD, actas, tareas y vencimientos acumulados.
        </p>
        {loadError ? <p className="mt-3 rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-100">{loadError}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Días con carga" value={totals.days} />
        <Kpi label="Eventos del mes" value={totals.items} />
        <Kpi label="Días críticos" value={totals.critical} />
        <Kpi label="Vencidos" value={totals.overdue} />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <div className="grid gap-4 xl:grid-cols-[auto_1fr_auto] xl:items-center">
          <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500">
            {availableMonths.map((month) => <option key={month} value={month}>{month}</option>)}
          </select>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por curso, hito, tarea, código, BOD, visado, acta..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500" />
          <div className="flex flex-wrap gap-2">
            {([
              ['todos', 'Todos'],
              ['hitos', 'Hitos'],
              ['tareas', 'Tareas'],
              ['pendientes', 'Pendientes'],
              ['vencidos', 'Vencidos'],
              ['criticos', 'Críticos'],
            ] as [CalendarFilter, string][]).map(([id, label]) => (
              <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${filter === id ? 'bg-blue-600 text-white' : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="border-b border-slate-800 p-5">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Vista mensual</p>
            <h2 className="mt-2 text-2xl font-bold">Días con carga operativa</h2>
            <p className="mt-2 text-sm text-slate-400">Los días aparecen ordenados por fecha. Dentro de cada día, lo vencido y crítico aparece primero.</p>
          </div>
          <div className="divide-y divide-slate-800">
            {monthDays.map((day) => <CalendarDayCard key={day.date} day={day} />)}
            {!monthDays.length ? <div className="p-8 text-center text-slate-400">No hay hitos o tareas para el mes y filtros seleccionados.</div> : null}
          </div>
        </article>

        <aside className="space-y-5">
          <article className="rounded-2xl border border-red-800 bg-red-950/30 p-5 text-red-100 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">Días críticos</p>
            <h2 className="mt-2 text-xl font-bold">Saturación o vencimientos</h2>
            <div className="mt-4 space-y-3">
              {criticalDays.map((day) => (
                <div key={day.date} className="rounded-xl border border-red-800 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{formatCourseDate(day.date)}</p>
                    <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-bold">{day.total} eventos</span>
                  </div>
                  <p className="mt-2 text-sm opacity-85">{day.milestones} hitos · {day.tasks} tareas · {day.overdue} vencidos</p>
                </div>
              ))}
              {!criticalDays.length ? <p className="text-sm opacity-80">No hay días críticos con los filtros actuales.</p> : null}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Criterio visual</p>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <p><span className="font-semibold text-red-300">Crítico</span> si hay vencidos o 8 eventos o más.</p>
              <p><span className="font-semibold text-orange-300">Alta carga</span> si hay entre 4 y 7 eventos.</p>
              <p><span className="font-semibold text-slate-100">Normal</span> si hay menos de 4 eventos.</p>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

function CalendarDayCard({ day }: { day: CalendarDay }) {
  return (
    <div className="p-5">
      <div className={`rounded-2xl border p-5 ${loadClass(day.loadLevel)}`}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold">{day.loadLevel}</span>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold">{day.total} eventos</span>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold">{day.pending} pendientes</span>
              {day.overdue ? <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-bold text-red-100">{day.overdue} vencidos</span> : null}
            </div>
            <h3 className="mt-3 text-xl font-bold">{formatCourseDate(day.date)}</h3>
            <p className="mt-1 text-sm opacity-80">{day.milestones} hitos · {day.tasks} tareas · {day.completed} completados</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {day.items.map((item) => <CalendarItemRow key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function CalendarItemRow({ item }: { item: CalendarItem }) {
  return (
    <div className={`rounded-xl border p-4 ${chipClass(item)}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold">{item.type}</span>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold">{item.label}</span>
            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold">{item.completed ? 'Completado' : 'Pendiente'}</span>
            {item.overdue ? <span className="rounded-full bg-red-900 px-3 py-1 text-xs font-bold text-red-100">Vencido</span> : null}
          </div>
          <h4 className="mt-3 font-semibold">{item.title}</h4>
          <p className="mt-1 text-sm opacity-80">{item.courseCode ? `${item.courseCode} · ${item.courseName}` : item.source}</p>
        </div>
        {item.courseId ? <Link href={`/cursos/${item.courseId}`} className="text-sm font-semibold text-blue-200 hover:text-blue-100">Abrir curso</Link> : null}
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-3 text-3xl font-bold">{value}</p></article>;
}
