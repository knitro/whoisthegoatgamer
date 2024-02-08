import { onMessage } from "firebase/messaging";
import { messaging } from "../firebase";

onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
});
