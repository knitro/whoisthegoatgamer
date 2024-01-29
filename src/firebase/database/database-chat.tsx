import { Unsubscribe, onChildAdded, push, ref, set } from "firebase/database";
import { auth, db } from "../firebase";
import { ChatLog, ChatLogFirebaseObject } from "./database-interfaces";

/**
 * Retrieves the Online Match information from the Database with a Listener
 *
 * @param joinCode
 * @param updater - function that is called when new data is retrieved
 * @param accessDenied - function that is called when there is no data at location or access is forbidden
 */
export async function getChatLogListener(
  joinCode: string,
  updater: (a: ChatLog) => void,
  accessDenied: () => void,
): Promise<Unsubscribe> {
  const dbRef = ref(db, `series/${joinCode}/chatLog`);
  const unsubscribeFunction = onChildAdded(dbRef, (snapshot) => {
    if (snapshot.val()) {
      const data: ChatLog = snapshot.val();
      updater(data);
    }
  });
  return unsubscribeFunction;
}

export async function addToChatHistoryOnlineMatch(
  joinCode: string,
  currentMessage: string,
) {
  if (auth.currentUser == null) {
    return;
  }

  const chatLogRef = ref(db, `series/${joinCode}/chatLog`);
  const newItemRef = push(chatLogRef);
  const chatToSave: ChatLogFirebaseObject = {
    message: currentMessage,
    authorId: auth.currentUser.uid,
  };

  return set(newItemRef, chatToSave)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}

export async function addToChatHistoryBotOnlineMatch(
  joinCode: string,
  currentMessage: string,
) {
  const chatLogRef = ref(db, `series/${joinCode}/chatLog`);
  const newItemRef = push(chatLogRef);
  const chatToSave: ChatLogFirebaseObject = {
    message: currentMessage,
    authorId: "match-bot",
  };

  return set(newItemRef, chatToSave)
    .then(() => {
      // Data saved successfully!
      return true;
    })
    .catch((error) => {
      // The write failed...
      return false;
    });
}
