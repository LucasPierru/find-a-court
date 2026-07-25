"use client";

import { SPORTS, type SportSlug } from "shared";

type SportFilterPillsProps = {
  active: SportSlug | null;
  onChange: (sport: SportSlug | null) => void;
};

export function SportFilterPills({ active, onChange }: SportFilterPillsProps) {
  return (
    <div className="absolute top-5 left-5 z-10 flex flex-wrap gap-2">
      {SPORTS.map((sport) => {
        const isActive = active === sport.id;
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => onChange(isActive ? null : sport.id)}
            className={
              isActive
                ? "rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white shadow dark:bg-zinc-50 dark:text-black"
                : "rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }>
            {sport.name}
          </button>
        );
      })}
    </div>
  );
}
