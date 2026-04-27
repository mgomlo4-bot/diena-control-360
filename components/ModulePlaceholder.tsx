type ModulePlaceholderProps = {
  title: string;
  eyebrow: string;
  description: string;
  items: string[];
};

export default function ModulePlaceholder({ title, eyebrow, description, items }: ModulePlaceholderProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold">{title}</h1>
        <p className="mt-3 max-w-4xl text-slate-300">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-3 h-2 w-16 rounded-full bg-blue-500" />
            <p className="font-semibold text-slate-100">{item}</p>
            <p className="mt-2 text-sm text-slate-400">Preparado para desarrollo funcional y conexión futura con datos reales.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
