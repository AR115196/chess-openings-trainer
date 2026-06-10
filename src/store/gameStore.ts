import { create } from "zustand";
import type { Opening, HintLevel, OpponentMode, PlayerColor } from "@/lib/openings/types";

interface GameSetup {
  color: PlayerColor;
  opening: Opening | null;
  hintLevel: HintLevel;
  opponentMode: OpponentMode;
}

interface GameState {
  setup: GameSetup;
  setColor: (color: PlayerColor) => void;
  setOpening: (opening: Opening) => void;
  setHintLevel: (level: HintLevel) => void;
  setOpponentMode: (mode: OpponentMode) => void;
  resetSetup: () => void;
}

const defaultSetup: GameSetup = {
  color: "white",
  opening: null,
  hintLevel: 1,
  opponentMode: 1,
};

export const useGameStore = create<GameState>((set) => ({
  setup: defaultSetup,

  setColor: (color) =>
    set((state) => ({
      setup: { ...state.setup, color, opening: null },
    })),

  setOpening: (opening) =>
    set((state) => ({
      setup: { ...state.setup, opening },
    })),

  setHintLevel: (hintLevel) =>
    set((state) => ({
      setup: { ...state.setup, hintLevel },
    })),

  setOpponentMode: (opponentMode) =>
    set((state) => ({
      setup: { ...state.setup, opponentMode },
    })),

  resetSetup: () => set({ setup: defaultSetup }),
}));
