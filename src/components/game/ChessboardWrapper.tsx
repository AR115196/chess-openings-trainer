"use client";

import { useMemo } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PlayerColor } from "@/lib/openings/types";

interface ChessboardWrapperProps {
  fen: string;
  color: PlayerColor;
  isPlayerTurn: boolean;
  opponentMode: number;
  selectedSquare?: string | null;
  legalMoveSquares?: string[];
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
  selectedSquare,
  legalMoveSquares = [],
  wrongSquares,
  onPieceDrop,
  onFreeOpponentDrop,
  onSquareClick,
}: ChessboardWrapperProps) {
  // Parse the current position once so we can tell empty vs occupied squares.
  const tempChess = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // Wrong move flash
    if (wrongSquares) {
      styles[wrongSquares.from] = { backgroundColor: "rgba(239, 68, 68, 0.4)" };
      styles[wrongSquares.to]   = { backgroundColor: "rgba(239, 68, 68, 0.6)" };
    }

    // Selected piece highlight
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(16, 185, 129, 0.35)" };
    }

    // Legal move indicators
    for (const sq of legalMoveSquares) {
      const piece = tempChess.get(sq as Square);
      if (piece) {
        // Capturable opponent piece — ring overlay
        styles[sq] = {
          background:
            "radial-gradient(transparent 58%, rgba(16,185,129,0.45) 58%)",
          borderRadius: "50%",
        };
      } else {
        // Empty target square — small dot
        styles[sq] = {
          background:
            "radial-gradient(rgba(16,185,129,0.45) 28%, transparent 28%)",
        };
      }
    }

    return styles;
  }, [wrongSquares, selectedSquare, legalMoveSquares, tempChess]);

  return (
    <div className="w-full aspect-square max-w-[560px]">
      <Chessboard
        options={{
          position: fen,
          boardOrientation: color,
          allowDragging: isPlayerTurn || opponentMode === 3,
          showAnimations: true,
          animationDurationInMs: 200,
          squareStyles,
          darkSquareStyle: { backgroundColor: "#4a7c59" },
          lightSquareStyle: { backgroundColor: "#f0d9b5" },
          dropSquareStyle: { boxShadow: "inset 0 0 0 3px rgba(16,185,129,0.8)" },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            if (isPlayerTurn) return onPieceDrop(sourceSquare, targetSquare);
            if (opponentMode === 3) return onFreeOpponentDrop(sourceSquare, targetSquare);
            return false;
          },
          onSquareClick: ({ square }) => onSquareClick(square),
        }}
      />
    </div>
  );
}
