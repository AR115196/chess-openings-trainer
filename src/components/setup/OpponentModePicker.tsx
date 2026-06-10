"use client";

import { cn } from "@/lib/utils";
import type { OpponentMode } from "@/lib/openings/types";

interface OpponentModePickerProps {
  value: OpponentMode;
  onChange: (mode: OpponentMode) => void;
}

const modes: { value: OpponentMode; label: string; icon: string; description: string }[] = [
  { value: 1, label: "Auto", icon: "⚡", description: "Opponent plays automatically after 600ms" },
  { value: 2, label: "Choose", icon: "🎯", description: "You pick the opponent's response" },
  { value: 3, label: "Free Play", icon: "🎮", description: "You control both sides manually" },
];

export function OpponentModePicker({ value, onChange }: OpponentModePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
        Opponent Mode
      </h2>
      <div className="flex gap-2">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            title={mode.description}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm transition-all cursor-pointer",
              value === mode.value
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
            )}
          >
            <span className="text-xl">{mode.icon}</span>
            <span className="font-semibold">{mode.label}</span>
            <span className="text-xs text-center leading-tight opacity-70">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
