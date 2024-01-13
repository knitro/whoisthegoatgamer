import { child, get, ref, remove, set, update } from "firebase/database";
import { auth, db } from "../firebase";
import {
  Match,
  MatchState,
  Player,
  PlayerRequest,
  PlayerRequestFirebaseObject,
} from "./database-interfaces";

////////////////////////////////////////////////////////
// Main Functions
////////////////////////////////////////////////////////

export async function requestJoinMatch(
  joinCode: string,
  playerName: string,
): Promise<boolean> {
  const dbRef = ref(db);
  return get(child(dbRef, `series/${joinCode}`)).then((snapshot) => {
    if (!snapshot.exists()) {
      return false;
    }

    const currentMatch: Match = snapshot.val() as Match;
    if (currentMatch.state !== MatchState.LOBBY) {
      // Can't join a game that is in progress
      return false;
    }

    const currentUser = auth.currentUser;
    if (currentUser == null) {
      // Can't join a game when not logged in
      return false;
    }

    // Add Request to join Match
    const playerListRef = ref(
      db,
      `series/${joinCode}/playerRequests/${currentUser.uid}`,
    );
    const firebasePlayerData: PlayerRequestFirebaseObject = {
      name: playerName,
    };

    return set(playerListRef, firebasePlayerData)
      .then(() => {
        // Data saved successfully!
        return true;
      })
      .catch((error) => {
        // The write failed...
        return false;
      });
  });
}

export async function removePlayerRequestOnlineMatch(
  joinCode: string,
  playerId: string,
): Promise<boolean> {
  const playerListRef = ref(
    db,
    `series/${joinCode}/playerRequests/${playerId}`,
  );
  return remove(playerListRef)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}
