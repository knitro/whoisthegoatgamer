import { GameEntry } from "@/firebase/database/database-interfaces";

export const PRESET_WEB_GAMES_DAILIES: GameEntry[] = [
  {
    id: "geoguessr",
    name: "Geoguessr",
    link: "https://www.geoguessr.com",
    options: [{ name: "Daily (5min total)", requiresPairing: false }],
  },
  {
    id: "wordle",
    name: "Wordle",
    link: "https://www.nytimes.com/games/wordle/index.html",
    options: [{ name: "Daily", requiresPairing: false }],
  },
  {
    id: "wikipedia-race",
    name: "Wikipedia Race",
    link: "https://www.thewikipediagame.com/",
    options: [{ name: "Daily", requiresPairing: false }],
  },
  {
    id: "contexto",
    name: "Contexto",
    link: "https://contexto.me/",
    options: [{ name: "Daily", requiresPairing: false }],
  },
  {
    id: "contexto",
    name: "Contexto",
    link: "https://contexto.me/",
    options: [{ name: "Daily", requiresPairing: false }],
  },
  {
    id: "globle",
    name: "Globle",
    link: "https://globle-game.com/",
    options: [{ name: "Daily", requiresPairing: false }],
  },
  {
    id: "timeguessr",
    name: "Timeguessr",
    link: "https://timeguessr.com/",
    options: [{ name: "Daily", requiresPairing: false }],
  },
];
