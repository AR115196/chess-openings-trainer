"use client";

import { useMemo, useCallback } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { OpponentAlternative, PlayerColor } from "@/lib/openings/types";

interface ChessboardWrapperProps {
  fen: string;
  color: PlayerColor;
  isPlayerTurn: boolean;
  opponentMode: number;
  selectedSquare?: string | null;
  legalMoveSquares?: string[];
  wrongSquares?: { from: string; to: string } | null;
  awaitingOpponentChoice?: boolean;
  opponentChoices?: OpponentAlternative[];
  onPieceDrop: (from: string, to: string) => boolean;
  onFreeOpponentDrop: (from: string, to: string) => boolean;
  onSquareClick: (square: string) => void;
  onOpponentChoice?: (alt: OpponentAlternative) => void;
}

export function ChessboardWrapper({
  fen,
  color,
  isPlayerTurn,
  opponentMode,
  selectedSquare,
  legalMoveSquares = [],
  wrongSquares,
  awaitingOpponentChoice = false,
  opponentChoices = [],
  onPieceDrop,
  onFreeOpponentDrop,
  onSquareClick,
  onOpponentChoice,
}: ChessboardWrapperProps) {
  const tempChess = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);

  // Map from destination square → choice (for fast lookup in click handler / renderer)
  const choiceByDest = useMemo(
    () => new Map(opponentChoices.map((c) => [c.to, c])),
    [opponentChoices]
  );

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    if (awaitingOpponentChoice) {
      // Highlight each possible destination with a blue dot/ring
      for (const choice of opponentChoices) {
        const piece = tempChess.get(choice.to as Square);
        styles[choice.to] = piece
          ? { background: "radial-gradient(transparent 56%, rgba(99,179,237,0.55) 56%)", borderRadius: "50%", cursor: "pointer" }
          : { background: "radial-gradient(rgba(99,179,237,0.55) 28%, transparent 28%)", cursor: "pointer" };
      }
      return styles;
    }

    // Wrong move flash
    if (wrongSquares) {
      styles[wrongSquares.from] = { backgroundColor: "rgba(239, 68, 68, 0.4)" };
      styles[wrongSquares.to]   = { backgroundColor: "rgba(239, 68, 68, 0.6)" };
    }

    // Selected piece highlight
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: "rgba(16, 185, 129, 0.35)" };
    }

    // Legal move dots / capture rings
    for (const sq of legalMoveSquares) {
      const piece = tempChess.get(sq as Square);
      styles[sq] = piece
        ? { background: "radial-gradient(transparent 58%, rgba(16,185,129,0.45) 58%)", borderRadius: "50%" }
        : { background: "radial-gradient(rgba(16,185,129,0.45) 28%, transparent 28%)" };
    }

    return styles;
  }, [awaitingOpponentChoice, opponentChoices, wrongSquares, selectedSquare, legalMoveSquares, tempChess]);

  // Arrows from source → destination for each opponent choice
  const arrows = useMemo(() => {
    if (!awaitingOpponentChoice || opponentChoices.length === 0) return [];
    return opponentChoices.map((c) => ({
      startSquare: c.from,
      endSquare: c.to,
      color: "rgba(99,179,237,0.75)",
    }));
  }, [awaitingOpponentChoice, opponentChoices]);

  // Overlay popularity % badge on each destination square
  const squareRenderer = useCallback(
    ({ square, children }: { square: string; piece: unknown; children?: React.ReactNode }) => {
      const choice = awaitingOpponentChoice ? choiceByDest.get(square) : undefined;
      if (!choice) return <>{children}</> as React.JSX.Element;

      return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          {children}
          <div
            style={{
              position: "absolute",
              bottom: "3px",
              right: "3px",
              background: "rgba(30,64,175,0.88)",
              color: "#fff",
              borderRadius: "50%",
              width: "26px",
              height: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              fontWeight: 700,
              lineHeight: 1,
              zIndex: 10,
              pointerEvents: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            {choice.popularity}%
          </div>
        </div>
      ) as React.JSX.Element;
    },
    [awaitingOpponentChoice, choiceByDest]
  );

  const handleSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (awaitingOpponentChoice && onOpponentChoice) {
        const choice = choiceByDest.get(square);
        if (choice) { onOpponentChoice(choice); return; }
      }
      onSquareClick(square);
    },
    [awaitingOpponentChoice, choiceByDest, onOpponentChoice, onSquareClick]
  );

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
          arrows,
          squareRenderer,
          darkSquareStyle: { backgroundColor: "#4a7c59" },
          lightSquareStyle: { backgroundColor: "#f0d9b5" },
          dropSquareStyle: { boxShadow: "inset 0 0 0 3px rgba(16,185,129,0.8)" },
          onPieceDrop: ({ sourceSquare, targetSquare }) => {
            if (!targetSquare) return false;
            if (isPlayerTurn) return onPieceDrop(sourceSquare, targetSquare);
            if (opponentMode === 3) return onFreeOpponentDrop(sourceSquare, targetSquare);
            return false;
          },
          onSquareClick: handleSquareClick,
        }}
      />
    </div>
  );
}
