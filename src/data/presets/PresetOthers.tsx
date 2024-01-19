import { GameEntry } from "@/firebase/database/database-interfaces";

export const PRESET_STARCRAFT_GAMES: GameEntry[] = [
  {
    id: "broodwar",
    name: "Starcraft: Brood War",
    link: "",
    options: [
      { name: "Big Game Hunters Melee", requiresPairing: false },
      { name: "Fastest Map", requiresPairing: false },
      { name: "Standard", requiresPairing: true },
    ],
  },
  {
    id: "starcraft2",
    name: "Starcraft 2",
    link: "",
    options: [
      { name: "Multiplayer", requiresPairing: true },
      { name: "Arcade", requiresPairing: false },
    ],
  },
];

export const PRESET_OTHER_GAMES: GameEntry[] = [
  {
    id: "minecraft",
    name: "Minecraft",
    link: "",
    options: [
      { name: "First to Diamonds Achievement", requiresPairing: true },
      { name: "Beat the End", requiresPairing: true },
    ],
  },
  {
    id: "fallguys",
    name: "Fall Guys",
    link: "",
    options: [{ name: "VS", requiresPairing: false }],
  },
  {
    id: "tft",
    name: "Teamfight Tactics",
    link: "",
    options: [{ name: "VS", requiresPairing: false }],
  },
  {
    id: "pokemon-speedrun",
    name: "Pokemon Emerald",
    link: "",
    options: [
      { name: "Randomiser: Rustboro City Gym", requiresPairing: false },
      { name: "Battle Tower", requiresPairing: false },
    ],
  },
];
