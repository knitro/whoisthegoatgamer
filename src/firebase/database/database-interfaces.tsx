/**
 * Data Structure of a Match in the Database
 */
export interface Match {
  code: string; // Join Code
  hostId: string; // Player ID of the Match Host
  playerList: Player[];
  playerRequests: PlayerRequest[];
  gameList: GameEntry[];
  chatLog: ChatLog[];
  gameHistory: GameHistory[];
  state: MatchState;
  currentGame: GameHistory;
}

export interface Player {
  name: string;
  id: string;
  vetos: number;
  isReady: boolean;
}

export interface PlayerRequest {
  name: string;
  id: string;
}

export interface GameEntry {
  id: string;
  name: string;
  link: string;
}

export interface ChatLog {
  // TODO
  message: string;
  authorId: string;
}

export interface GameHistory {
  points: PlayerPoints[];
  name: string;
  id: string;
}

export enum MatchState {
  LOBBY,
  GAME,
  AWAIT_ACCEPTANCE,
  GAMEPLAY,
  AWAIT_RESULTS,
}

export interface PlayerPoints {
  playerId: string;
  points: number;
}

/**
 * Use this interface only to send Match data to firebase.
 * This should be the same as Match, except it does not include:
 *  - code
 *  - playerRequests
 *  - gameList
 *  - chatLog
 *  - gameHistory
 *  - playerList
 */
export interface MatchInitialisation {
  hostId: string; // Player ID of the Match Host
  state: MatchState;
}

/**
 * Use this interface only when mapping between data retrieved from Firebase and a Match object
 * This should the same as Match, except all arrays are objects
 */
export interface MatchFirebaseObject {
  code: string; // Join Code
  hostId: string; // Player ID of the Match Host
  playerList: Object;
  playerRequests: Object;
  gameList: Object;
  chatLog: Object;
  gameHistory: Object;
  state: MatchState;
  currentGame: GameHistory;
}

/**
 * Use this interface only to create a Player to send to Firebase
 * This should be the same as Player, except it does not include:
 *  - id
 */
export interface PlayerFirebaseObject {
  name: string;
  vetos: number;
  isReady: boolean;
}

/**
 * Use this interface only to create a PlayerRequest to send to Firebase
 * This should be the same as PlayerRequest, except it does not include:
 *  - id
 */
export interface PlayerRequestFirebaseObject {
  name: string;
}
