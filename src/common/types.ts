export interface GameEntry {
  id: string;
  name: string;
  link: string;
  options: GameOption[];
  tags: string[];
}

export interface GameOption {
  name: string;
  requiresPairing: boolean;
  updatedLink?: string;
  boostedChance: number; // Normal Chance is 1,
}
