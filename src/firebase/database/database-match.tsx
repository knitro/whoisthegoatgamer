import { child, get, push, ref, set, update } from "firebase/database";
import { auth, db } from "../firebase";
import {
  ChatLog,
  ChatLogFirebaseObject,
  CurrentGame,
  GameHistory,
  Match,
  MatchState,
  PlayerPoints,
} from "./database-interfaces";
import { addToArrayOnlineMatch, removeItemOnlineMatch } from "./database";
import {
  BracketPairing,
  BracketPlayer,
} from "@/components/BracketGenerator/BracketGeneratorInterfaces";
import { GameEntry, GameOption } from "@/common/types";

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

  let gameToSave: CurrentGame | null = null;
  if (game != null) {
    // Pick random option
    let option: GameOption = {
      name: "",
      requiresPairing: false,
      boostedChance: 0,
    };

    if (game.options && game.options.length > 0) {
      const randomIndex = Math.floor(Math.random() * game.options.length);
      option = game.options[randomIndex];
    }

    gameToSave = {
      history: {
        id: game.id,
        name: game.name,
        points: [],
      },
      link: game.link,
      option: option,
    };
  }

  return update(dbRef, {
    currentGame: gameToSave,
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
  const currentGamePointsRef = ref(
    db,
    `series/${joinCode}/currentGame/history`,
  );
  return update(currentGamePointsRef, {
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

export async function setNumOfSpinsOnlineMatch(
  joinCode: string,
  numOfSpins: number,
) {
  const dbRef = ref(db, `series/${joinCode}`);

  return update(dbRef, {
    numOfSpins: numOfSpins,
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

export async function addBracketOnlineMatch(
  joinCode: string,
  bracketPairingArray: BracketPairing[],
  nameOfRound: string,
) {
  const bracketMatchEntry = {
    // Note this is an BracketMatch w/o the id
    name: nameOfRound, //eg. Ro8
    pairings: bracketPairingArray,
  };
  return await addToArrayOnlineMatch(joinCode, "brackets", bracketMatchEntry);
}
