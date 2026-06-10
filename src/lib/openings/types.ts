export type PlayerColor = "white" | "black";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type HintLevel = 1 | 2 | 3;
export type OpponentMode = 1 | 2 | 3;

export interface OpeningMove {
  san: string;
  from: string;
  to: string;
  isOpponent: boolean;
  annotation?: string;
  promotion?: string;
}

export interface OpponentAlternative {
  san: string;
  from: string;
  to: string;
  name?: string;
  popularity: number;
}

export interface OpeningVariation {
  name: string;
  moves: OpeningMove[];
}

export interface Opening {
  id: string;
  name: string;
  eco: string;
  color: PlayerColor;
  category: string;
  description: string;
  difficulty: Difficulty;
  moves: OpeningMove[];
  variations?: OpeningVariation[];
  opponentAlternatives?: Record<number, OpponentAlternative[]>;
}

export interface GameConfig {
  opening: Opening;
  hintLevel: HintLevel;
  opponentMode: OpponentMode;
}

export interface MoveResult {
  correct: boolean;
  expectedSan: string;
}
