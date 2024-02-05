import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

const vapidKey_public =
  "BOoQvzYckUTWrO6Oa1DcGa0jtpo7qMI0jcHIVgWDAfX5_bgTZfW58nVnr2xMahN8Ol8Z_lstWiF3n0f2zjdY7hg";

export function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      getToken(messaging, {
        vapidKey: vapidKey_public,
      })
        .then((currentToken) => {
          if (currentToken) {
            // Send the token to your server and update the UI if necessary
            // ...
            console.log(currentToken);
          } else {
            // Show permission request UI
            console.log(
              "No registration token available. Request permission to generate one.",
            );
            // ...
          }
        })
        .catch((err) => {
          console.log("An error occurred while retrieving token. ", err);
          // ...
        });
    }
  });
}
