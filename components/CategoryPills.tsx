"use client";

import Link from "next/link";

type Pill = { key: string; label: string; href: string };
type Props = { items: Pill[] };

export default function CategoryPills({ items }: Props) {
  return (
    <nav className="w-full overflow-x-auto py-0">
      <ul className="flex gap-0 min-w-max">
        {items.map((p) => (
          <li key={p.key}>
            <Link
              href={p.href}
              className="inline-flex items-center rounded-full border border-slate-300/70 px-3 py-1 text-sm 
                         hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
