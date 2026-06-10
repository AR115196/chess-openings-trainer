"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Chess } from "chess.js";
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
  handleSquareClick: (square: string) => void;
  handlePieceDrop: (from: string, to: string) => boolean;
  handleOpponentChoice: (alt: OpponentAlternative) => void;
  handleFreeOpponentDrop: (from: string, to: string) => boolean;
  resetGame: () => void;
  nextMoveAfterWrong: () => void;
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
      const result = chess.move({ from: move.from, to: move.to, promotion: move.promotion ?? "q" });
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

      const expectedFrom = currentMove.from;
      const expectedTo = currentMove.to;

      if (from !== expectedFrom || to !== expectedTo) {
        if (hintLevel === 3) {
          setState((prev) => ({
            ...prev,
            status: "wrong_move",
            wrongMove: `${from}${to}`,
          }));
        }
        return false;
      }

      const chess = chessRef.current;
      const result = chess.move({ from, to, promotion: currentMove.promotion ?? "q" });
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
    [state, currentMove, isPlayerTurn, hintLevel, opening.moves, playerMoveCount, triggerOpponent]
  );

  const handlePieceDrop = useCallback(
    (from: string, to: string): boolean => {
      return applyPlayerMove(from, to);
    },
    [applyPlayerMove]
  );

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const handleSquareClick = useCallback(
    (square: string) => {
      if (!isPlayerTurn || state.status !== "playing") {
        setSelectedSquare(null);
        return;
      }
      if (selectedSquare) {
        const moved = applyPlayerMove(selectedSquare, square);
        if (!moved && square !== selectedSquare) {
          setSelectedSquare(square);
        } else {
          setSelectedSquare(null);
        }
      } else {
        setSelectedSquare(square);
      }
    },
    [isPlayerTurn, state.status, selectedSquare, applyPlayerMove]
  );

  const handleOpponentChoice = useCallback(
    (alt: OpponentAlternative) => {
      const chess = chessRef.current;
      const result = chess.move({ from: alt.from, to: alt.to, promotion: "q" });
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
      const result = chess.move({ from, to, promotion: "q" });
      if (!result) return false;

      const currentOppMove = opening.moves[state.moveIndex];
      const san = result.san;
      const newHistory = [...state.history, san];
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
      void currentOppMove;
      return true;
    },
    [opponentMode, isPlayerTurn, state, opening.moves, playerMoveCount]
  );

  const nextMoveAfterWrong = useCallback(() => {
    if (state.status !== "wrong_move" || !currentMove) return;
    const chess = chessRef.current;
    const result = chess.move({ from: currentMove.from, to: currentMove.to, promotion: currentMove.promotion ?? "q" });
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
    handleSquareClick,
    handlePieceDrop,
    handleOpponentChoice,
    handleFreeOpponentDrop,
    resetGame,
    nextMoveAfterWrong,
  };
}
