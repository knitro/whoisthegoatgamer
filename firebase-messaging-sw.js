importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyC69iaER22bzYEDvugtwG0O2wvrk8mL3tQ",
  authDomain: "whoisthegoatgamer.firebaseapp.com",
  projectId: "whoisthegoatgamer",
  storageBucket: "whoisthegoatgamer.appspot.com",
  messagingSenderId: "230545373363",
  appId: "1:230545373363:web:079083d487eb7248fb18c6",
  databaseURL:
    "https://whoisthegoatgamer-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
