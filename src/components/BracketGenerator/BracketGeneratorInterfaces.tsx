export interface BracketPlayer {
  name: string;
  id: string;
  hadBye: boolean;
}

export interface BracketPairing {
  id: string;
  players: BracketPlayer[];
  isBye: boolean;
}

export interface BracketMatch {
  id: string;
  name: string; //eg. Ro8
  pairings: BracketPairing[];
}
