"use client";

import { cn } from "@/lib/utils";
import type { Opening } from "@/lib/openings/types";

interface MoveListProps {
  opening: Opening;
  history: string[];
  currentMoveIndex: number;
  opponentMode: number;
}

export function MoveList({ opening, history, currentMoveIndex, opponentMode }: MoveListProps) {
  // Mode 1: show the full scripted sequence (player always follows the script).
  // Modes 2/3: dynamic game — show only played moves plus the current move row.
  //            Showing the full future script would be misleading after alternatives.
  const showAllFutureMoves = opponentMode === 1;

  // In dynamic modes, cut off display at the pair that contains the current move.
  const maxPairStart = showAllFutureMoves
    ? opening.moves.length
    : Math.floor(currentMoveIndex / 2) * 2 + 2;

  const movePairs: {
    whiteSan: string;
    blackSan?: string;
    whiteAbsIdx: number;
    blackAbsIdx: number;
    moveNum: number;
  }[] = [];

  let moveNum = 1;
  for (let i = 0; i < maxPairStart && i < opening.moves.length; i += 2) {
    const whiteAbsIdx = i;
    const blackAbsIdx = i + 1;

    // Use the actual played SAN from history so alternatives show correctly.
    // Fall back to scripted SAN only for future (unplayed) moves.
    const whiteSan = whiteAbsIdx < history.length
      ? history[whiteAbsIdx]
      : (opening.moves[whiteAbsIdx]?.san ?? "");

    const blackSan = blackAbsIdx < opening.moves.length
      ? (blackAbsIdx < history.length ? history[blackAbsIdx] : opening.moves[blackAbsIdx]?.san)
      : undefined;

    movePairs.push({ whiteSan, blackSan, whiteAbsIdx, blackAbsIdx, moveNum });
    moveNum++;
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">
        {showAllFutureMoves ? "Moves" : "Move History"}
      </h3>
      <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1">
        {movePairs.map((pair) => {
          const whiteIsHistory = pair.whiteAbsIdx < history.length;
          const blackIsHistory = pair.blackAbsIdx < history.length;
          const whiteIsCurrent = pair.whiteAbsIdx === currentMoveIndex;
          const blackIsCurrent = pair.blackAbsIdx === currentMoveIndex;

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
                {pair.whiteSan}
              </span>
              {pair.blackSan !== undefined && (
                <span className={cn(
                  "flex-1 rounded px-1.5 py-0.5 font-mono text-sm",
                  blackIsCurrent
                    ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                    : blackIsHistory
                    ? "text-zinc-300"
                    : "text-zinc-600"
                )}>
                  {pair.blackSan}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
