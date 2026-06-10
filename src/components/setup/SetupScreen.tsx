"use client";

import { useGameStore } from "@/store/gameStore";
import { ColorPicker } from "./ColorPicker";
import { OpeningSelector } from "./OpeningSelector";
import { HintLevelPicker } from "./HintLevelPicker";
import { OpponentModePicker } from "./OpponentModePicker";

interface SetupScreenProps {
  onStart: () => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const { setup, setColor, setOpening, setHintLevel, setOpponentMode } = useGameStore();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-4xl">♟</span>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Chess Openings Trainer</h1>
            <p className="text-sm text-zinc-500">Master openings through deliberate practice</p>
          </div>
        </div>

        {/* Setup card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-7">
          <ColorPicker value={setup.color} onChange={setColor} />

          <div className="h-px bg-zinc-800" />

          <OpeningSelector
            color={setup.color}
            selected={setup.opening}
            onSelect={setOpening}
          />

          <div className="h-px bg-zinc-800" />

          <HintLevelPicker value={setup.hintLevel} onChange={setHintLevel} />

          <div className="h-px bg-zinc-800" />

          <OpponentModePicker value={setup.opponentMode} onChange={setOpponentMode} />
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          disabled={!setup.opening}
          className="w-full rounded-xl bg-emerald-500 py-4 text-base font-semibold text-white transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {setup.opening ? `Start Training — ${setup.opening.name}` : "Select an opening to start"}
        </button>
      </div>
    </div>
  );
}
