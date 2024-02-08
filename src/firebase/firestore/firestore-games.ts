import { GameEntry } from "@/common/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { fs } from "../firebase";
import { GameTags } from "@/common/enums";

export async function getGames(tagsToQuery: GameTags[]): Promise<GameEntry[]> {
  const tags: string[] = tagsToQuery.map((gameTag: GameTags) =>
    gameTagToDbTag(gameTag),
  );

  const gamesRef = collection(fs, "games");
  console.log("Tags", tags);
  const gamesQuery = query(gamesRef, where("tags", "array-contains-any", tags));

  const querySnapshot = await getDocs(gamesQuery);
  const gameEntries: GameEntry[] = [];
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    const gameEntry = doc.data() as GameEntry;
    gameEntry.id = doc.id;
    gameEntries.push(gameEntry);
  });
  console.log("Games Gotten", gameEntries);
  return gameEntries;
}

function gameTagToDbTag(gameTag: GameTags) {
  switch (gameTag) {
    case GameTags.WEB:
      return "web";
    case GameTags.DAILY:
      return "daily";
    case GameTags.GROUP:
      return "group";
    case GameTags.STEAM:
      return "steam";
    case GameTags.LOCAL:
      return "local";
    case GameTags.LOCALONLY:
      return "localonly";
    case GameTags.DISCORD:
      return "discord";
    case GameTags.POKEMON:
      return "pokemon";
    case GameTags.MINECRAFT:
      return "minecraft";
    case GameTags.STARCRAFT:
      return "starcraft";
    case GameTags.EGS:
      return "egs";
    case GameTags.PAID:
      return "paid";
  }
}
