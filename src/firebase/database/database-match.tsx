import { child, get, push, ref, set, update } from "firebase/database";
import { auth, db } from "../firebase";
import {
  GameEntry,
  GameHistory,
  Match,
  MatchState,
  PlayerPoints,
} from "./database-interfaces";
import { addToArrayOnlineMatch, removeItemOnlineMatch } from "./database";

////////////////////////////////////////////////////////
// Main Functions
////////////////////////////////////////////////////////

export function updateStateOnlineMatch(
  joinCode: string,
  updatedState: MatchState,
): Promise<boolean> {
  const dbRef = ref(db, `series/${joinCode}`);
  return update(dbRef, {
    state: updatedState,
  })
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export function updateStateAndGameOnlineMatch(
  joinCode: string,
  state: MatchState,
  game: GameEntry | null,
): Promise<boolean> {
  const dbRef = ref(db, `series/${joinCode}`);
  return update(dbRef, {
    currentGame: game,
    state: state,
  })
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function addGameListOnlineMatch(
  joinCode: string,
  nameOfGame: string,
) {
  const gameEntry = {
    // Note this is an GameEntry w/o the id
    name: nameOfGame,
    link: "",
  };
  return await addToArrayOnlineMatch(joinCode, "gameList", gameEntry);
}

export async function removeGameListOnlineMatch(joinCode: string, id: string) {
  return await removeItemOnlineMatch(joinCode, "gameList", id);
}

export async function addToGameHistoryOnlineMatch(
  joinCode: string,
  currentGame: GameHistory,
) {
  const gameHistoryRef = ref(db, `series/${joinCode}/gameHistory`);
  const newItemRef = push(gameHistoryRef);
  return set(newItemRef, currentGame)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function updateCurrentGameOnlineMatch(
  joinCode: string,
  playerPoints: PlayerPoints[],
) {
  const currentGamePointsRef = ref(db, `series/${joinCode}/currentGame`);
  return set(currentGamePointsRef, {
    points: playerPoints,
  })
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}
