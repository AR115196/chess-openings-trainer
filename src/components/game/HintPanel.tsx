"use client";

import type { OpeningMove } from "@/lib/openings/types";

interface HintPanelProps {
  currentMove: OpeningMove | null;
  isPlayerTurn: boolean;
}

export function HintPanel({ currentMove, isPlayerTurn }: HintPanelProps) {
  if (!isPlayerTurn || !currentMove?.annotation) return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500 mb-1">
        Hint
      </p>
      <p className="text-sm text-emerald-200 leading-relaxed">{currentMove.annotation}</p>
    </div>
  );
}
