import type { Opening, PlayerColor } from "./types";
import whiteOpenings from "./data/white-openings.json";
import blackOpenings from "./data/black-openings.json";

const allOpenings: Opening[] = [
  ...(whiteOpenings as Opening[]),
  ...(blackOpenings as Opening[]),
];

export function getOpeningsByColor(color: PlayerColor): Opening[] {
  return allOpenings.filter((o) => o.color === color);
}

export function getOpeningById(id: string): Opening | undefined {
  return allOpenings.find((o) => o.id === id);
}

export function getOpeningsByCategory(color: PlayerColor): Record<string, Opening[]> {
  const openings = getOpeningsByColor(color);
  return openings.reduce<Record<string, Opening[]>>((acc, opening) => {
    if (!acc[opening.category]) acc[opening.category] = [];
    acc[opening.category].push(opening);
    return acc;
  }, {});
}

export { allOpenings };
