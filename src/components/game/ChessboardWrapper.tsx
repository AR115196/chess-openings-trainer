"use client";

import { Chessboard } from "react-chessboard";
import type { PlayerColor } from "@/lib/openings/types";

interface ChessboardWrapperProps {
  fen: string;
  color: PlayerColor;
  isPlayerTurn: boolean;
  opponentMode: number;
  wrongSquares?: { from: string; to: string } | null;
  onPieceDrop: (from: string, to: string) => boolean;
  onFreeOpponentDrop: (from: string, to: string) => boolean;
  onSquareClick: (square: string) => void;
}

export function ChessboardWrapper({
  fen,
  color,
  isPlayerTurn,
  opponentMode,
  wrongSquares,
  onPieceDrop,
  onFreeOpponentDrop,
  onSquareClick,
}: ChessboardWrapperProps) {
  const wrongSquareStyles: Record<string, React.CSSProperties> = wrongSquares
    ? {
        [wrongSquares.from]: { backgroundColor: "rgba(239, 68, 68, 0.4)" },
        [wrongSquares.to]: { backgroundColor: "rgba(239, 68, 68, 0.6)" },
      }
    : {};

  return (
    <div className="w-full aspect-square max-w-[560px]">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: color,
          allowDragging: isPlayerTurn || opponentMode === 3,
          showAnimations: true,
          animationDurationInMs: 200,
          squareStyles: wrongSquareStyles,
          darkSquareStyle: { backgroundColor: "#4a7c59" },
          lightSquareStyle: { backgroundColor: "#f0d9b5" },
          dropSquareStyle: { boxShadow: "inset 0 0 0 3px rgba(16,185,129,0.8)" },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            if (isPlayerTurn) {
              return onPieceDrop(sourceSquare, targetSquare);
            }
            if (opponentMode === 3) {
              return onFreeOpponentDrop(sourceSquare, targetSquare);
            }
            return false;
          },
          onSquareClick: ({ square }) => onSquareClick(square),
        }}
      />
    </div>
  );
}
