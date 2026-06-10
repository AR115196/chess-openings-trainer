"use client";

import { useEffect, useRef } from "react";
import { useGame } from "@/hooks/useGame";
import type { Opening, HintLevel, OpponentMode, PlayerColor } from "@/lib/openings/types";
import { ChessboardWrapper } from "./ChessboardWrapper";
import { MoveList } from "./MoveList";
import { HintPanel } from "./HintPanel";
import { OpponentChoicePanel } from "./OpponentChoicePanel";
import { WrongMoveAlert } from "./WrongMoveAlert";

interface GameScreenProps {
  opening: Opening;
  hintLevel: HintLevel;
  opponentMode: OpponentMode;
  color: PlayerColor;
  onComplete: (score: number, correctMoves: number, totalMoves: number, history: string[]) => void;
  onQuit: () => void;
}

export function GameScreen({
  opening,
  hintLevel,
  opponentMode,
  color,
  onComplete,
  onQuit,
}: GameScreenProps) {
  const game = useGame(opening, hintLevel, opponentMode);
  const completedRef = useRef(false);

  useEffect(() => {
    if (game.status === "completed" && !completedRef.current) {
      completedRef.current = true;
      const timer = setTimeout(() => {
        onComplete(game.score, game.correctMoves, game.totalPlayerMoves, game.history);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [game.status, game.score, game.correctMoves, game.totalPlayerMoves, game.history, onComplete]);

  const wrongSquares =
    game.status === "wrong_move" && game.wrongMove
      ? { from: game.wrongMove.slice(0, 2), to: game.wrongMove.slice(2, 4) }
      : null;

  const playerMoveCount = opening.moves.filter((m) => !m.isOpponent).length;
  const currentPlayerMoveNum = opening.moves
    .slice(0, game.moveIndex)
    .filter((m) => !m.isOpponent).length;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">♟</span>
          <div>
            <h1 className="font-bold text-zinc-100">{opening.name}</h1>
            <p className="text-xs text-zinc-500">{opening.eco} · Playing as {color}</p>
          </div>
        </div>
        <button
          onClick={onQuit}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors cursor-pointer"
        >
          Quit
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Board area */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-8">
          <div className="relative w-full max-w-[560px]">
            <ChessboardWrapper
              fen={game.fen}
              color={color}
              isPlayerTurn={game.isPlayerTurn}
              opponentMode={opponentMode}
              wrongSquares={wrongSquares}
              onPieceDrop={game.handlePieceDrop}
              onFreeOpponentDrop={game.handleFreeOpponentDrop}
              onSquareClick={game.handleSquareClick}
            />
            {game.awaitingOpponentChoice && (
              <OpponentChoicePanel
                choices={game.opponentChoices}
                onChoice={game.handleOpponentChoice}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900 p-5 overflow-y-auto">
          {/* Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Progress</span>
              <span className="font-mono font-semibold text-zinc-200">
                {currentPlayerMoveNum} / {playerMoveCount}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${playerMoveCount > 0 ? (currentPlayerMoveNum / playerMoveCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Free play notice */}
          {opponentMode === 3 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <p className="text-xs font-semibold text-amber-400 mb-0.5">Free Play Mode</p>
              <p className="text-xs text-amber-200/70 leading-relaxed">
                Both sides play any legal move. Opening moves shown are suggestions — play what makes sense on the board.
              </p>
            </div>
          )}

          {/* Status / hint */}
          {game.status === "wrong_move" ? (
            <WrongMoveAlert
              currentMove={game.currentMove}
              onContinue={game.nextMoveAfterWrong}
            />
          ) : (
            <HintPanel currentMove={game.currentMove} isPlayerTurn={game.isPlayerTurn} />
          )}

          {/* Turn indicator */}
          <div className={`rounded-xl border px-3 py-2 text-sm font-medium ${
            game.isPlayerTurn
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-700 bg-zinc-800 text-zinc-400"
          }`}>
            {game.status === "completed"
              ? "Opening complete!"
              : game.isPlayerTurn
              ? opponentMode === 3
                ? "Your turn — play any legal move"
                : "Your turn — make your move"
              : opponentMode === 3
              ? "Now move the opponent's pieces"
              : opponentMode === 2 && game.awaitingOpponentChoice
              ? "Choose opponent's response"
              : "Opponent is thinking..."}
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Move list */}
          <MoveList
            opening={opening}
            history={game.history}
            currentMoveIndex={game.moveIndex}
          />

          <div className="flex-1" />

          {/* Reset */}
          <button
            onClick={game.resetGame}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Restart Opening
          </button>
        </aside>
      </div>
    </div>
  );
}
