"use client";

import { useState, useCallback } from "react";
import { useGameStore } from "@/store/gameStore";
import { SetupScreen } from "@/components/setup/SetupScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { ResultsScreen } from "@/components/results/ResultsScreen";

type View = "setup" | "game" | "results";

interface GameResult {
  score: number;
  correctMoves: number;
  totalMoves: number;
  history: string[];
  openingName: string;
}

export default function Home() {
  const [view, setView] = useState<View>("setup");
  const [result, setResult] = useState<GameResult | null>(null);

  const { setup } = useGameStore();

  const handleStart = useCallback(() => {
    if (!setup.opening) return;
    setView("game");
  }, [setup.opening]);

  const handleComplete = useCallback(
    (score: number, correctMoves: number, totalMoves: number, history: string[]) => {
      setResult({
        score,
        correctMoves,
        totalMoves,
        history,
        openingName: setup.opening?.name ?? "",
      });
      setView("results");
    },
    [setup.opening]
  );

  const handleQuit = useCallback(() => {
    setView("setup");
  }, []);

  const handleTryAgain = useCallback(() => {
    setView("game");
  }, []);

  const handleChooseOpening = useCallback(() => {
    setView("setup");
  }, []);

  if (view === "game" && setup.opening) {
    return (
      <GameScreen
        opening={setup.opening}
        hintLevel={setup.hintLevel}
        opponentMode={setup.opponentMode}
        color={setup.color}
        onComplete={handleComplete}
        onQuit={handleQuit}
      />
    );
  }

  if (view === "results" && result) {
    return (
      <ResultsScreen
        openingName={result.openingName}
        score={result.score}
        correctMoves={result.correctMoves}
        totalMoves={result.totalMoves}
        history={result.history}
        onTryAgain={handleTryAgain}
        onChooseOpening={handleChooseOpening}
      />
    );
  }

  return <SetupScreen onStart={handleStart} />;
}
