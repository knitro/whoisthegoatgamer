import { GameEntry } from "@/common/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { fs } from "../firebase";
import { GameTags } from "@/common/enums";

export async function getGames(tagsToQuery: GameTags[]): Promise<GameEntry[]> {
  const tags = tagsToQuery.map((gameTag) => gameTag.toString());

  const gamesRef = collection(fs, "games");
  const gamesQuery = query(gamesRef, where("tags", "array-contains-any", tags));

  const querySnapshot = await getDocs(gamesQuery);
  const gameEntries: GameEntry[] = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    const gameEntry = doc.data() as GameEntry;
    gameEntries.push(gameEntry);
  });

  return gameEntries;
}
