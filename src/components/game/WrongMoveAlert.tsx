"use client";

import type { OpeningMove } from "@/lib/openings/types";

interface WrongMoveAlertProps {
  currentMove: OpeningMove | null;
  onContinue: () => void;
}

export function WrongMoveAlert({ currentMove, onContinue }: WrongMoveAlertProps) {
  return (
    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-3">
      <span className="text-xl shrink-0">✗</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-400">Wrong move</p>
        {currentMove && (
          <p className="text-xs text-zinc-400 mt-0.5">
            The correct move is{" "}
            <span className="font-mono font-bold text-zinc-200">{currentMove.san}</span>
          </p>
        )}
      </div>
      <button
        onClick={onContinue}
        className="shrink-0 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
      >
        Show me
      </button>
    </div>
  );
}
