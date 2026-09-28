/** Two-column label/value list for read-only details. */
export function DetailList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-slate-100">
      {items.map(({ label, value }) => (
        <div key={label} className="grid grid-cols-[10rem_1fr] gap-3 px-5 py-2.5 text-sm">
          <dt className="text-slate-500">{label}</dt>
          <dd className="min-w-0 break-words whitespace-pre-wrap text-slate-900">
            {value === null || value === undefined || value === "" ? <span className="text-slate-400">—</span> : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
