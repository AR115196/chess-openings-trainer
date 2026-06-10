"use client";

import type { OpponentAlternative } from "@/lib/openings/types";

interface OpponentChoicePanelProps {
  choices: OpponentAlternative[];
  onChoice: (alt: OpponentAlternative) => void;
}

export function OpponentChoicePanel({ choices, onChoice }: OpponentChoicePanelProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-zinc-950/80 backdrop-blur-sm">
      <div className="w-72 rounded-2xl border border-zinc-700 bg-zinc-900 p-5 flex flex-col gap-4 shadow-2xl">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">Choose Opponent's Response</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Pick how the opponent replies</p>
        </div>
        <div className="flex flex-col gap-2">
          {choices.map((alt) => (
            <button
              key={`${alt.from}-${alt.to}`}
              onClick={() => onChoice(alt)}
              className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-left hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group cursor-pointer"
            >
              <div>
                <span className="font-mono font-semibold text-zinc-100 group-hover:text-emerald-300">
                  {alt.san}
                </span>
                {alt.name && (
                  <p className="text-xs text-zinc-500 mt-0.5">{alt.name}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="h-1.5 w-16 rounded-full bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${alt.popularity}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-600">{alt.popularity}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
