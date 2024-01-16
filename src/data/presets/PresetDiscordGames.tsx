import { GameEntry } from "@/firebase/database/database-interfaces";

export const PRESET_DISCORD_GAMES: GameEntry[] = [
  {
    id: "poker",
    name: "Poker",
    link: "",
    options: [{ name: "Poker Night", requiresPairing: false }],
  },
  {
    id: "scrabble",
    name: "Scrabble",
    link: "",
    options: [
      { name: "Letter League", requiresPairing: false },
      { name: "SpellCast", requiresPairing: false },
    ],
  },
  {
    id: "blazing8s",
    name: "Uno",
    link: "",
    options: [{ name: "Blazing 8s", requiresPairing: false }],
  },
];
