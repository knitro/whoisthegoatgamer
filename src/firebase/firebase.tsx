import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

////////////////////////////////////////////////////////
// Initialisation
////////////////////////////////////////////////////////

export const firebaseConfig = {
  apiKey: "AIzaSyC69iaER22bzYEDvugtwG0O2wvrk8mL3tQ",
  authDomain: "whoisthegoatgamer.firebaseapp.com",
  projectId: "whoisthegoatgamer",
  storageBucket: "whoisthegoatgamer.appspot.com",
  messagingSenderId: "230545373363",
  appId: "1:230545373363:web:079083d487eb7248fb18c6",
  databaseURL:
    "https://whoisthegoatgamer-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

////////////////////////////////////////////////////////
// Exports
////////////////////////////////////////////////////////

export const auth = getAuth(firebaseApp);
export const db = getDatabase(firebaseApp);
