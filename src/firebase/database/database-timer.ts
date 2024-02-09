import { onValue, ref, update, Unsubscribe } from "firebase/database";
import { db } from "../firebase";
import { TimerInfo } from "./database-interfaces";

export async function getTimerInfoListener(
  matchId: string,
  updater: (a: TimerInfo) => void,
  accessDenied: () => void,
): Promise<Unsubscribe> {
  const dbRef = ref(db, `series/${matchId}/timer`);
  const unsubscribeFunction = onValue(dbRef, (snapshot) => {
    if (snapshot.val()) {
      const snapshotData = snapshot.val() as TimerInfo;
      updater(snapshotData);
    } else {
      accessDenied();
    }
  });
  return unsubscribeFunction;
}

export async function updateTimer(matchId: string, timeLeft: number) {
  const dbRef = ref(db, `series/${matchId}/timer`);
  const updateObject = {
    timeLeft: timeLeft,
  };
  return update(dbRef, updateObject)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function pauseTimer(matchId: string, timeLeft: number) {
  const dbRef = ref(db, `series/${matchId}/timer`);
  const updateObject = {
    isPaused: true,
    timeLeft: timeLeft,
  };
  return update(dbRef, updateObject)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function startTimer(matchId: string) {
  const dbRef = ref(db, `series/${matchId}/timer`);
  const updateObject = {
    isPaused: false,
    startTime: Date.now(),
  };
  return update(dbRef, updateObject)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}
