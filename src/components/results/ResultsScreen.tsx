"use client";

import { cn } from "@/lib/utils";

interface ResultsScreenProps {
  openingName: string;
  score: number;
  correctMoves: number;
  totalMoves: number;
  history: string[];
  onTryAgain: () => void;
  onChooseOpening: () => void;
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score === 100) return { text: "Perfect!", color: "text-emerald-400" };
  if (score >= 80) return { text: "Great job!", color: "text-emerald-400" };
  if (score >= 60) return { text: "Good effort", color: "text-amber-400" };
  if (score >= 40) return { text: "Keep practicing", color: "text-amber-500" };
  return { text: "Keep going!", color: "text-red-400" };
}

export function ResultsScreen({
  openingName,
  score,
  correctMoves,
  totalMoves,
  history,
  onTryAgain,
  onChooseOpening,
}: ResultsScreenProps) {
  const label = scoreLabel(score);

  // Build paired move recap rows
  const pairs: { num: number; white: string; whiteCorrect: boolean; black?: string; blackCorrect?: boolean }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i] ?? "",
      whiteCorrect: true,
      black: history[i + 1],
      blackCorrect: true,
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-zinc-500 uppercase tracking-widest mb-1">Opening Complete</p>
          <h1 className="text-2xl font-bold text-zinc-100">{openingName}</h1>
        </div>

        {/* Score card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-5">
          {/* Big score */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-1">
              <span className="text-6xl font-black text-zinc-100">{score}</span>
              <span className="text-2xl text-zinc-500 pb-2">/100</span>
            </div>
            <span className={cn("text-lg font-semibold", label.color)}>{label.text}</span>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>
            <p className="text-center text-sm text-zinc-500">
              {correctMoves} of {totalMoves} moves correct
            </p>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Move history */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Move Recap
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {history.map((san, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 font-mono text-sm text-zinc-200"
                >
                  <span className="text-xs text-zinc-600 mr-0.5">
                    {idx % 2 === 0 ? `${Math.floor(idx / 2) + 1}.` : ""}
                  </span>
                  {san}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onTryAgain}
            className="flex-1 rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <button
            onClick={onChooseOpening}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Choose Opening
          </button>
        </div>
      </div>
    </div>
  );
}
