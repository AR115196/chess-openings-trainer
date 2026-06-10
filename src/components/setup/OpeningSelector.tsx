"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getOpeningsByColor, getOpeningsByCategory } from "@/lib/openings";
import type { Opening, PlayerColor } from "@/lib/openings/types";

interface OpeningSelectorProps {
  color: PlayerColor;
  selected: Opening | null;
  onSelect: (opening: Opening) => void;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export function OpeningSelector({ color, selected, onSelect }: OpeningSelectorProps) {
  const byCategory = useMemo(() => getOpeningsByCategory(color), [color]);
  const categories = Object.keys(byCategory);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
        Opening
      </h2>
      <div className="flex flex-col gap-4">
        {categories.map((category) => (
          <div key={category} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">
              {category}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {byCategory[category].map((opening) => (
                <button
                  key={opening.id}
                  onClick={() => onSelect(opening)}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border-2 p-3 text-left transition-all cursor-pointer",
                    selected?.id === opening.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn(
                      "font-semibold text-sm leading-tight",
                      selected?.id === opening.id ? "text-emerald-300" : "text-zinc-100"
                    )}>
                      {opening.name}
                    </span>
                    <span className="shrink-0 text-xs font-mono text-zinc-500">{opening.eco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      difficultyColors[opening.difficulty]
                    )}>
                      {opening.difficulty}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {opening.moves.filter((m) => !m.isOpponent).length} moves
                    </span>
                  </div>
                  {selected?.id === opening.id && (
                    <p className="text-xs text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">
                      {opening.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
