import {
  onValue,
  ref,
  set,
  update,
  Unsubscribe,
  remove,
} from "firebase/database";
import { db } from "../firebase";
import { Player, PlayerFirebaseObject } from "./database-interfaces";
import { createArrayWithIdFromObject } from "./database";

////////////////////////////////////////////////////////
// Main Functions
////////////////////////////////////////////////////////

export async function getPlayerListListener(
  joinCode: string,
  updater: (a: Player[]) => void,
  accessDenied: () => void,
): Promise<Unsubscribe> {
  const dbRef = ref(db, `series/${joinCode}/playerList`);

  // TODO:: Replace Value Event Listener with Child Listeners (onChildAdded, onChildChanged, onChildRemoved)
  const unsubscribeFunction = onValue(dbRef, (snapshot) => {
    if (snapshot.val()) {
      const snapshotData = snapshot.val();
      const playerList: Player[] = createArrayWithIdFromObject(snapshotData);
      updater(playerList);
    } else {
      accessDenied();
    }
  });
  return unsubscribeFunction;
}

export function addPlayerListOnlineMatch(
  joinCode: string,
  player: Player,
): Promise<boolean> {
  const playerListRef = ref(db, `series/${joinCode}/playerList/${player.id}`);
  const firebasePlayerData: PlayerFirebaseObject = {
    name: player.name,
    vetos: player.vetos,
    isReady: player.isReady,
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
}

export function removePlayerListOnlineMatch(
  joinCode: string,
  playerId: string,
): Promise<boolean> {
  const playerListRef = ref(db, `series/${joinCode}/playerList/${playerId}`);
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

export async function playerConfirmOnlineMatch(
  joinCode: string,
  playerId: string,
) {
  const playerListRef = ref(db, `series/${joinCode}/playerList/${playerId}`);
  return update(playerListRef, { isReady: true })
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function playerVetoOnlineMatch(
  joinCode: string,
  playerId: string,
  updatedVetoCount: number,
) {
  const playerListRef = ref(db, `series/${joinCode}/playerList/${playerId}`);
  return update(playerListRef, { vetos: updatedVetoCount })
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function setAllPlayersUnready(
  joinCode: string,
  playerIds: string[],
) {
  // Figure out way to reduce api calls

  await Promise.all(
    playerIds.map((id) => {
      const playerListRef = ref(db, `series/${joinCode}/playerList/${id}`);
      return update(playerListRef, { isReady: false })
        .then(() => {
          // Data saved successfully!
          return true;
        })
        .catch((error) => {
          // The write failed...
          return false;
        });
    }),
  );
}
