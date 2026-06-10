"use client";

import { cn } from "@/lib/utils";
import type { Opening } from "@/lib/openings/types";

interface MoveListProps {
  opening: Opening;
  history: string[];
  currentMoveIndex: number;
}

export function MoveList({ opening, history, currentMoveIndex }: MoveListProps) {
  // Pair moves into full move rows: [white, black?]
  const movePairs: { white: string; black?: string; moveNum: number }[] = [];
  let moveNum = 1;
  for (let i = 0; i < opening.moves.length; i += 2) {
    movePairs.push({
      moveNum,
      white: opening.moves[i]?.san ?? "",
      black: opening.moves[i + 1]?.san,
    });
    moveNum++;
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
        Moves
      </h3>
      <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1">
        {movePairs.map((pair, pairIdx) => {
          const whiteAbsIdx = pairIdx * 2;
          const blackAbsIdx = pairIdx * 2 + 1;
          const whiteIsHistory = whiteAbsIdx < history.length;
          const blackIsHistory = blackAbsIdx < history.length;
          const whiteIsCurrent = whiteAbsIdx === currentMoveIndex;
          const blackIsCurrent = blackAbsIdx === currentMoveIndex;

          return (
            <div key={pair.moveNum} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm">
              <span className="w-6 shrink-0 text-right text-xs text-zinc-600">{pair.moveNum}.</span>
              <span className={cn(
                "flex-1 rounded px-1.5 py-0.5 font-mono text-sm",
                whiteIsCurrent
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                  : whiteIsHistory
                  ? "text-zinc-300"
                  : "text-zinc-600"
              )}>
                {pair.white}
              </span>
              {pair.black && (
                <span className={cn(
                  "flex-1 rounded px-1.5 py-0.5 font-mono text-sm",
                  blackIsCurrent
                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                    : blackIsHistory
                    ? "text-zinc-300"
                    : "text-zinc-600"
                )}>
                  {pair.black}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
