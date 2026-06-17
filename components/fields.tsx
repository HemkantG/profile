"use client";

import { ReactNode } from "react";

export function Section({
  title,
  children,
  actions,
  onRemove,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onRemove?: () => void;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</h3>
        <div className="flex items-center gap-2">
          {actions}
          {onRemove && (
            <button
              type="button"
              title="Remove section"
              onClick={onRemove}
              className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}

export function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-dashed border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50"
    >
      + {label}
    </button>
  );
}

/** Up / down / remove controls for an array item. */
export function ItemControls({
  index,
  length,
  onMove,
  onRemove,
}: {
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}) {
  const btn = "rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      <button type="button" title="Move up" className={btn} disabled={index === 0} onClick={() => onMove(index, index - 1)}>↑</button>
      <button type="button" title="Move down" className={btn} disabled={index === length - 1} onClick={() => onMove(index, index + 1)}>↓</button>
      <button type="button" title="Remove" className={`${btn} hover:text-red-600`} disabled={length === 1} onClick={() => onRemove(index)}>✕</button>
    </span>
  );
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Editable list of plain strings with add / remove / reorder. */
export function StringListEditor({
  label,
  items,
  onChange,
  addLabel = "Add item",
  multiline = false,
}: {
  label?: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  multiline?: boolean;
}) {
  const update = (i: number, v: string) => onChange(items.map((s, j) => (j === i ? v : s)));
  return (
    <div>
      {label && <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                value={item}
                rows={2}
                onChange={(e) => update(i, e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            ) : (
              <input
                type="text"
                value={item}
                onChange={(e) => update(i, e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            )}
            <ItemControls
              index={i}
              length={items.length}
              onMove={(from, to) => onChange(moveItem(items, from, to))}
              onRemove={(idx) => onChange(items.filter((_, j) => j !== idx))}
            />
          </div>
        ))}
        <AddButton label={addLabel} onClick={() => onChange([...items, ""])} />
      </div>
    </div>
  );
}

/** Card wrapper for an item of an object array (project, experience entry, ...). */
export function ItemCard({
  title,
  index,
  length,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">{title}</span>
        <ItemControls index={index} length={length} onMove={onMove} onRemove={onRemove} />
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
