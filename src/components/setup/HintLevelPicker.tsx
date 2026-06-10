"use client";

import { cn } from "@/lib/utils";
import type { HintLevel } from "@/lib/openings/types";

interface HintLevelPickerProps {
  value: HintLevel;
  onChange: (level: HintLevel) => void;
}

const levels: { value: HintLevel; label: string; description: string }[] = [
  { value: 1, label: "Zen", description: "No feedback on wrong moves" },
  { value: 2, label: "Strict", description: "Wrong moves are silently rejected" },
  { value: 3, label: "Teacher", description: "Wrong moves are flagged with guidance" },
];

export function HintLevelPicker({ value, onChange }: HintLevelPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
        Hint Level
      </h2>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            title={level.description}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm transition-all cursor-pointer",
              value === level.value
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            )}
          >
            <span className="text-lg font-bold">{level.value}</span>
            <span className="font-semibold">{level.label}</span>
            <span className="text-xs text-center leading-tight opacity-70">{level.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
