import {
  child,
  get,
  onValue,
  ref,
  serverTimestamp,
  set,
  update,
  Unsubscribe,
  remove,
  push,
} from "firebase/database";
import { auth, db } from "../firebase";
import {
  Match,
  MatchFirebaseObject,
  MatchInitialisation,
  MatchState,
  Player,
  PlayerFirebaseObject,
  PlayerRequest,
} from "./database-interfaces";
import { PresetOption, getPreset } from "@/data/presets/Preset";

////////////////////////////////////////////////////////
// Main Functions
////////////////////////////////////////////////////////

/**
 * Creates a Online Series on the Realtime Database
 *
 * @param playerName
 * @param preset
 * @returns
 */
export async function createOnlineMatch(
  playerName: string,
  preset: PresetOption,
): Promise<string> {
  // Ensure Join Code does not already exist
  const dbRef = ref(db);
  let joinCode: string = generateJoinCode();
  let idNotUnique = true;

  while (idNotUnique) {
    const snapshot = await get(child(dbRef, `series/${joinCode}`));
    const exists: boolean = snapshot.exists();
    if (exists) {
      joinCode = generateJoinCode();
    } else {
      idNotUnique = false;
    }
  }

  const currentUser = auth.currentUser;
  if (currentUser == null) {
    return "";
  }

  // Create GameList Object
  // This is done to reduce the depth of the RealTimeDatabase as arrays create indices of '0', '1' etc.
  const gameListArray = getPreset(preset);
  const gameListObj: Record<string, any> = {};
  gameListArray.forEach((gameEntry) => {
    gameListObj[gameEntry.id] = {
      name: gameEntry.name,
      link: gameEntry.link,
      requiresPairing: gameEntry.requiresPairing,
      options: gameEntry.options,
    };
  });

  // Create PlayerList Object
  // This is done here since the player id is the key of the key-value pair
  const playerListObj: Record<string, any> = {};
  playerListObj[currentUser.uid] = {
    name: playerName,
    vetos: 1,
    isReady: false,
  };

  // joinCode is Unique => Create Deck in "/series"
  const info: MatchInitialisation = {
    hostId: currentUser.uid,
    playerList: playerListObj,
    state: MatchState.LOBBY,
    gameList: gameListObj,
  };
  // Create Match
  const matchRef = ref(db, `series/${joinCode}`);
  await set(matchRef, info);

  // // Add host
  // const playerListRef = ref(
  //   db,
  //   `series/${joinCode}/playerList/${currentUser.uid}`,
  // );
  // const player: PlayerFirebaseObject = {
  //   name: playerName,
  //   vetos: 1,
  //   isReady: false,
  // };
  // await set(playerListRef, player);

  return joinCode;
}

/**
 * Retrieves the Online Match information from the Database with a Listener
 *
 * @param joinCode
 * @param updater - function that is called when new data is retrieved
 * @param accessDenied - function that is called when there is no data at location or access is forbidden
 */
export async function getOnlineMatchListener(
  joinCode: string,
  updater: (a: Match) => void,
  accessDenied: () => void,
): Promise<Unsubscribe> {
  const dbRef = ref(db, `series/${joinCode}`);
  const unsubscribeFunction = onValue(dbRef, (snapshot) => {
    if (snapshot.val()) {
      const data: MatchFirebaseObject = snapshot.val() as MatchFirebaseObject;

      // Recreate Object to ensure all attributes exist (incl empty arrays)
      const returnMatch: Match = {
        code: snapshot.key ? snapshot.key : "",
        hostId: data.hostId ? data.hostId : "",
        playerList: data.playerList
          ? createArrayWithIdFromObject(data.playerList)
          : [],
        playerRequests: data.playerRequests
          ? createArrayWithIdFromObject(data.playerRequests)
          : [],
        gameList: data.gameList
          ? createArrayWithIdFromObject(data.gameList)
          : [],
        chatLog: data.chatLog ? Object.values(data.chatLog) : [],
        gameHistory: data.gameHistory ? Object.values(data.gameHistory) : [],
        state: data.state ? data.state : MatchState.LOBBY,
        currentGame: data.currentGame,
        numOfSpins: data.numOfSpins,
      };
      updater(returnMatch);
    } else {
      accessDenied();
    }
  });
  return unsubscribeFunction;
}

export async function cancelOnlineMatch(joinCode: string) {
  const dbRef = ref(db, `series/${joinCode}`);
  await remove(dbRef);
}

export async function addToArrayOnlineMatch<T>(
  joinCode: string,
  itemField: string, //eg. playerList
  item: T,
) {
  const dbRef = ref(db, `series/${joinCode}/${itemField}`);
  const newItemRef = push(dbRef);
  await set(newItemRef, item);
}

export async function removeItemOnlineMatch(
  joinCode: string,
  itemField: string, //eg. playerList
  id: string,
) {
  const dbRef = ref(db, `series/${joinCode}/${itemField}/${id}`);
  await remove(dbRef);
}

////////////////////////////////////////////////////////
// Supporting Functions
////////////////////////////////////////////////////////

function generateJoinCode(): string {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  let generatedCode = "";
  for (let i = 0; i < 5; i++) {
    if (i < 2) {
      const randomIndex = Math.floor(Math.random() * 26);
      const randomLetter = letters[randomIndex];
      generatedCode += randomLetter;
    } else {
      const randomIndex = Math.floor(Math.random() * 10);
      const randomNumber = numbers[randomIndex];
      generatedCode += randomNumber;
    }
  }

  return generatedCode;
}

function createArrayWithIdFromObject(object: Object) {
  const keyPairs = Object.entries(object);
  const returnArray = keyPairs.map((currentKeyPair: [string, any]) => {
    const obj = currentKeyPair[1];
    obj.id = currentKeyPair[0];
    return obj;
  });
  return returnArray;
}
