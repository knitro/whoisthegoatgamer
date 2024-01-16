import { GameEntry } from "@/firebase/database/database-interfaces";

export const PRESET_STEAM_GAMES: GameEntry[] = [
  {
    id: "binding-of-isaac",
    name: "Binding of Isaac",
    link: "steam://launch/250900/Dialog",
    options: [
      { name: "Daily", requiresPairing: false },
      { name: "Same Seed", requiresPairing: false },
    ],
  },
  {
    id: "ultimate-chicken-horse",
    name: "Ultimate Chicken Horse",
    link: "steam://launch/386940/Dialog",
    options: [{ name: "VS", requiresPairing: false }],
  },
  {
    id: "trackmania",
    name: "Trackmania",
    link: "steam://launch/2225070/Dialog",
    options: [
      { name: "Random Map Challenge", requiresPairing: false },
      { name: "Daily", requiresPairing: false },
    ],
  },
  {
    id: "counter-strike",
    name: "Counter-Strike 2",
    link: "steam://launch/730/Dialog",
    options: [{ name: "Deathmatch", requiresPairing: false }],
  },
  {
    id: "golf-with-your-friends",
    name: "Golf with your Friends",
    link: "steam://launch/431240/Dialog",
    options: [
      { name: "Classic", requiresPairing: false },
      { name: "Hoops", requiresPairing: false },
      { name: "Hockey", requiresPairing: false },
    ],
  },
  {
    id: "tricky-towers",
    name: "Tricky Towers",
    link: "steam://launch/437920/Dialog",
    options: [{ name: "VS", requiresPairing: false }],
  },
];
