"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import type { Opening, HintLevel, OpponentMode, OpeningMove, OpponentAlternative } from "@/lib/openings/types";

export type GameStatus = "idle" | "playing" | "wrong_move" | "completed";

interface GameState {
  fen: string;
  moveIndex: number;
  status: GameStatus;
  score: number;
  maxScore: number;
  correctMoves: number;
  totalPlayerMoves: number;
  history: string[];
  wrongMove: string | null;
  awaitingOpponentChoice: boolean;
  opponentChoices: OpponentAlternative[];
}

interface UseGameReturn extends GameState {
  currentMove: OpeningMove | null;
  isPlayerTurn: boolean;
  selectedSquare: string | null;
  legalMoveSquares: string[];
  handleSquareClick: (square: string) => void;
  handlePieceDrop: (from: string, to: string) => boolean;
  handleOpponentChoice: (alt: OpponentAlternative) => void;
  handleFreeOpponentDrop: (from: string, to: string) => boolean;
  resetGame: () => void;
  nextMoveAfterWrong: () => void;
}

// chess.js v1 throws on invalid moves instead of returning null.
// Only pass promotion when it's actually set (pawn reaching back rank),
// and wrap in try-catch so a bad move never crashes the app.
function safeMove(chess: Chess, from: string, to: string, promotion?: string) {
  try {
    const opts: { from: string; to: string; promotion?: string } = { from, to };
    if (promotion) opts.promotion = promotion;
    return chess.move(opts);
  } catch {
    return null;
  }
}

export function useGame(
  opening: Opening,
  hintLevel: HintLevel,
  opponentMode: OpponentMode
): UseGameReturn {
  const chessRef = useRef(new Chess());
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [state, setState] = useState<GameState>({
    fen: new Chess().fen(),
    moveIndex: 0,
    status: "idle",
    score: 0,
    maxScore: 0,
    correctMoves: 0,
    totalPlayerMoves: 0,
    wrongMove: null,
    history: [],
    awaitingOpponentChoice: false,
    opponentChoices: [],
  });

  const playerMoveCount = opening.moves.filter((m) => !m.isOpponent).length;

  const currentMove = state.moveIndex < opening.moves.length
    ? opening.moves[state.moveIndex]
    : null;

  const isPlayerTurn = !!(currentMove && !currentMove.isOpponent);

  const playOpponentMove = useCallback(
    (moveIndex: number, chess: Chess, currentHistory: string[], currentScore: number, currentCorrect: number) => {
      const move = opening.moves[moveIndex];
      if (!move || !move.isOpponent) return;

      const nextIndex = moveIndex + 1;
      const result = safeMove(chess, move.from, move.to, move.promotion);
      if (!result) return;

      const newHistory = [...currentHistory, move.san];

      if (nextIndex >= opening.moves.length) {
        setState({
          fen: chess.fen(),
          moveIndex: nextIndex,
          status: "completed",
          score: Math.round((currentCorrect / playerMoveCount) * 100),
          maxScore: 100,
          correctMoves: currentCorrect,
          totalPlayerMoves: playerMoveCount,
          wrongMove: null,
          history: newHistory,
          awaitingOpponentChoice: false,
          opponentChoices: [],
        });
        return;
      }

      const nextMove = opening.moves[nextIndex];
      const isNextOpponent = nextMove?.isOpponent ?? false;

      setState({
        fen: chess.fen(),
        moveIndex: nextIndex,
        status: "playing",
        score: currentScore,
        maxScore: 100,
        correctMoves: currentCorrect,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: newHistory,
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });

      // If there's another opponent move in a row, play it too
      if (isNextOpponent) {
        autoPlayTimerRef.current = setTimeout(() => {
          playOpponentMove(nextIndex, chess, newHistory, currentScore, currentCorrect);
        }, 600);
      }
    },
    [opening.moves, playerMoveCount]
  );

  const triggerOpponent = useCallback(
    (moveIndex: number, chess: Chess, history: string[], score: number, correct: number) => {
      const move = opening.moves[moveIndex];
      if (!move?.isOpponent) return;

      if (opponentMode === 2) {
        const alternatives = opening.opponentAlternatives?.[moveIndex];
        if (alternatives && alternatives.length > 1) {
          setState((prev) => ({
            ...prev,
            awaitingOpponentChoice: true,
            opponentChoices: alternatives,
            moveIndex,
          }));
          return;
        }
      }

      if (opponentMode === 3) {
        // Free play — user moves opponent pieces manually, nothing auto-plays
        setState((prev) => ({
          ...prev,
          moveIndex,
          awaitingOpponentChoice: false,
          opponentChoices: [],
        }));
        return;
      }

      // Mode 1 or Mode 2 with no alternatives: auto-play after delay
      autoPlayTimerRef.current = setTimeout(() => {
        playOpponentMove(moveIndex, chess, history, score, correct);
      }, 600);
    },
    [opening.moves, opening.opponentAlternatives, opponentMode, playOpponentMove]
  );

  const startGame = useCallback(() => {
    const chess = new Chess();
    chessRef.current = chess;
    const firstMove = opening.moves[0];

    if (firstMove?.isOpponent) {
      setState({
        fen: chess.fen(),
        moveIndex: 0,
        status: "playing",
        score: 0,
        maxScore: 100,
        correctMoves: 0,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: [],
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });
      triggerOpponent(0, chess, [], 0, 0);
    } else {
      setState({
        fen: chess.fen(),
        moveIndex: 0,
        status: "playing",
        score: 0,
        maxScore: 100,
        correctMoves: 0,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: [],
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });
    }
  }, [opening.moves, playerMoveCount, triggerOpponent]);

  useEffect(() => {
    startGame();
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening.id]);

  const applyPlayerMove = useCallback(
    (from: string, to: string) => {
      if (state.status !== "playing" || !isPlayerTurn || !currentMove) return false;

      const chess = chessRef.current;

      // Free play mode (opponentMode 3): accept any legal chess move.
      // The opening sequence is shown as a suggestion only — no forced moves.
      if (opponentMode === 3) {
        const result = safeMove(chess, from, to, currentMove.promotion);
        if (!result) return false;

        const matchesScript = from === currentMove.from && to === currentMove.to;
        const newHistory = [...state.history, result.san];
        const newCorrect = matchesScript ? state.correctMoves + 1 : state.correctMoves;
        const nextIndex = state.moveIndex + 1;

        if (nextIndex >= opening.moves.length) {
          setState({
            fen: chess.fen(),
            moveIndex: nextIndex,
            status: "completed",
            score: Math.round((newCorrect / playerMoveCount) * 100),
            maxScore: 100,
            correctMoves: newCorrect,
            totalPlayerMoves: playerMoveCount,
            wrongMove: null,
            history: newHistory,
            awaitingOpponentChoice: false,
            opponentChoices: [],
          });
          return true;
        }

        setState({
          fen: chess.fen(),
          moveIndex: nextIndex,
          status: "playing",
          score: state.score,
          maxScore: 100,
          correctMoves: newCorrect,
          totalPlayerMoves: playerMoveCount,
          wrongMove: null,
          history: newHistory,
          awaitingOpponentChoice: false,
          opponentChoices: [],
        });
        // In free play mode the player manually moves the opponent pieces — no auto-trigger.
        return true;
      }

      // Scripted mode (opponentMode 1 or 2): enforce the expected move.
      const expectedFrom = currentMove.from;
      const expectedTo = currentMove.to;

      // Safety net: if the scripted move is no longer legal in the current position
      // (can happen when an opponent alternative changed the pawn structure),
      // accept any legal chess move so the player isn't stuck.
      const scriptedStillLegal = chessRef.current
        .moves({ square: expectedFrom as Square, verbose: true })
        .some((m) => m.to === expectedTo);

      if (!scriptedStillLegal) {
        const result = safeMove(chess, from, to);
        if (!result) return false;
        const newHistory = [...state.history, result.san];
        const nextIndex = state.moveIndex + 1;
        if (nextIndex >= opening.moves.length) {
          setState({
            fen: chess.fen(), moveIndex: nextIndex, status: "completed",
            score: Math.round((state.correctMoves / playerMoveCount) * 100),
            maxScore: 100, correctMoves: state.correctMoves,
            totalPlayerMoves: playerMoveCount, wrongMove: null,
            history: newHistory, awaitingOpponentChoice: false, opponentChoices: [],
          });
          return true;
        }
        const nextMove = opening.moves[nextIndex];
        setState({
          fen: chess.fen(), moveIndex: nextIndex, status: "playing",
          score: state.score, maxScore: 100, correctMoves: state.correctMoves,
          totalPlayerMoves: playerMoveCount, wrongMove: null,
          history: newHistory, awaitingOpponentChoice: false, opponentChoices: [],
        });
        if (nextMove?.isOpponent) {
          triggerOpponent(nextIndex, chess, newHistory, state.score, state.correctMoves);
        }
        return true;
      }

      if (from !== expectedFrom || to !== expectedTo) {
        // Only penalise moves that are actually legal in chess.
        // Illegal moves (e.g. pawn 5 squares) are silently rejected.
        const isLegalChessMove = chessRef.current
          .moves({ square: from as Square, verbose: true })
          .some((m) => m.to === to);

        if (isLegalChessMove && hintLevel === 3) {
          setState((prev) => ({
            ...prev,
            status: "wrong_move",
            wrongMove: `${from}${to}`,
          }));
        }
        return false;
      }

      const result = safeMove(chess, from, to, currentMove.promotion);
      if (!result) return false;

      const newHistory = [...state.history, currentMove.san];
      const newCorrect = state.correctMoves + 1;
      const nextIndex = state.moveIndex + 1;

      if (nextIndex >= opening.moves.length) {
        setState({
          fen: chess.fen(),
          moveIndex: nextIndex,
          status: "completed",
          score: Math.round((newCorrect / playerMoveCount) * 100),
          maxScore: 100,
          correctMoves: newCorrect,
          totalPlayerMoves: playerMoveCount,
          wrongMove: null,
          history: newHistory,
          awaitingOpponentChoice: false,
          opponentChoices: [],
        });
        return true;
      }

      const nextMove = opening.moves[nextIndex];

      setState({
        fen: chess.fen(),
        moveIndex: nextIndex,
        status: "playing",
        score: state.score,
        maxScore: 100,
        correctMoves: newCorrect,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: newHistory,
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });

      if (nextMove?.isOpponent) {
        triggerOpponent(nextIndex, chess, newHistory, state.score, newCorrect);
      }

      return true;
    },
    [state, currentMove, isPlayerTurn, hintLevel, opponentMode, opening.moves, playerMoveCount, triggerOpponent]
  );

  const handlePieceDrop = useCallback(
    (from: string, to: string): boolean => {
      return applyPlayerMove(from, to);
    },
    [applyPlayerMove]
  );

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Squares the selected piece can legally move to (used for highlights).
  const legalMoveSquares = useMemo(() => {
    if (!selectedSquare || !isPlayerTurn || state.status !== "playing") return [];
    try {
      const tempChess = new Chess(state.fen);
      return tempChess
        .moves({ square: selectedSquare as Square, verbose: true })
        .map((m) => m.to);
    } catch {
      return [];
    }
  }, [selectedSquare, isPlayerTurn, state.fen, state.status]);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!isPlayerTurn || state.status !== "playing") {
        setSelectedSquare(null);
        return;
      }

      // Clicking the already-selected square deselects it.
      if (square === selectedSquare) {
        setSelectedSquare(null);
        return;
      }

      const playerColor = opening.color === "white" ? "w" : "b";

      if (selectedSquare) {
        // If the clicked square has a friendly piece, re-select it
        // without attempting a move (avoids false wrong-move penalties).
        const piece = chessRef.current.get(square as Square);
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
          return;
        }

        // Otherwise try to make the move, then always clear the selection.
        applyPlayerMove(selectedSquare, square);
        setSelectedSquare(null);
      } else {
        // Only select squares that have a friendly piece.
        const piece = chessRef.current.get(square as Square);
        if (piece && piece.color === playerColor) {
          setSelectedSquare(square);
        }
      }
    },
    [isPlayerTurn, state.status, selectedSquare, applyPlayerMove, opening.color]
  );

  const handleOpponentChoice = useCallback(
    (alt: OpponentAlternative) => {
      const chess = chessRef.current;
      const result = safeMove(chess, alt.from, alt.to, alt.promotion);
      if (!result) return;

      const newHistory = [...state.history, alt.san];
      const nextIndex = state.moveIndex + 1;

      if (nextIndex >= opening.moves.length) {
        setState({
          fen: chess.fen(),
          moveIndex: nextIndex,
          status: "completed",
          score: Math.round((state.correctMoves / playerMoveCount) * 100),
          maxScore: 100,
          correctMoves: state.correctMoves,
          totalPlayerMoves: playerMoveCount,
          wrongMove: null,
          history: newHistory,
          awaitingOpponentChoice: false,
          opponentChoices: [],
        });
        return;
      }

      setState({
        fen: chess.fen(),
        moveIndex: nextIndex,
        status: "playing",
        score: state.score,
        maxScore: 100,
        correctMoves: state.correctMoves,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: newHistory,
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });
    },
    [state, opening.moves, playerMoveCount]
  );

  const handleFreeOpponentDrop = useCallback(
    (from: string, to: string): boolean => {
      if (opponentMode !== 3 || isPlayerTurn || state.status !== "playing") return false;
      const chess = chessRef.current;
      const result = safeMove(chess, from, to);
      if (!result) return false;

      const newHistory = [...state.history, result.san];
      const nextIndex = state.moveIndex + 1;

      if (nextIndex >= opening.moves.length) {
        setState({
          fen: chess.fen(),
          moveIndex: nextIndex,
          status: "completed",
          score: Math.round((state.correctMoves / playerMoveCount) * 100),
          maxScore: 100,
          correctMoves: state.correctMoves,
          totalPlayerMoves: playerMoveCount,
          wrongMove: null,
          history: newHistory,
          awaitingOpponentChoice: false,
          opponentChoices: [],
        });
        return true;
      }

      setState({
        fen: chess.fen(),
        moveIndex: nextIndex,
        status: "playing",
        score: state.score,
        maxScore: 100,
        correctMoves: state.correctMoves,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: newHistory,
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });
      return true;
    },
    [opponentMode, isPlayerTurn, state, opening.moves, playerMoveCount]
  );

  const nextMoveAfterWrong = useCallback(() => {
    if (state.status !== "wrong_move" || !currentMove) return;
    const chess = chessRef.current;
    const result = safeMove(chess, currentMove.from, currentMove.to, currentMove.promotion);
    if (!result) return;

    const newHistory = [...state.history, currentMove.san];
    const nextIndex = state.moveIndex + 1;

    if (nextIndex >= opening.moves.length) {
      setState({
        fen: chess.fen(),
        moveIndex: nextIndex,
        status: "completed",
        score: Math.round((state.correctMoves / playerMoveCount) * 100),
        maxScore: 100,
        correctMoves: state.correctMoves,
        totalPlayerMoves: playerMoveCount,
        wrongMove: null,
        history: newHistory,
        awaitingOpponentChoice: false,
        opponentChoices: [],
      });
      return;
    }

    const nextMove = opening.moves[nextIndex];
    setState({
      fen: chess.fen(),
      moveIndex: nextIndex,
      status: "playing",
      score: state.score,
      maxScore: 100,
      correctMoves: state.correctMoves,
      totalPlayerMoves: playerMoveCount,
      wrongMove: null,
      history: newHistory,
      awaitingOpponentChoice: false,
      opponentChoices: [],
    });

    if (nextMove?.isOpponent) {
      triggerOpponent(nextIndex, chess, newHistory, state.score, state.correctMoves);
    }
  }, [state, currentMove, opening.moves, playerMoveCount, triggerOpponent]);

  const resetGame = useCallback(() => {
    if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    setSelectedSquare(null);
    startGame();
  }, [startGame]);

  return {
    ...state,
    currentMove,
    isPlayerTurn,
    selectedSquare,
    legalMoveSquares,
    handleSquareClick,
    handlePieceDrop,
    handleOpponentChoice,
    handleFreeOpponentDrop,
    resetGame,
    nextMoveAfterWrong,
  };
}
