import { GameEntry } from "@/firebase/database/database-interfaces";

export enum PresetOption {
  DUEL = "Duel",
  FOUR = "Four",
  EMPTY = "Empty",
}

export function getPreset(option: PresetOption): GameEntry[] {
  switch (option) {
    case PresetOption.DUEL: {
      const cjCopy = [...CJ_GAMES];
      const standardCopy = [...STANDARD_GAMES];
      const duel = cjCopy.concat(standardCopy);
      return duel;
    }
    case PresetOption.FOUR: {
      const mpOnlyCopy = [...MP_ONLY_GAMES];
      const standardCopy = [...STANDARD_GAMES];
      const four = mpOnlyCopy.concat(standardCopy);
      return four;
    }
    case PresetOption.EMPTY: {
      return [];
    }
  }
}

const CJ_GAMES: GameEntry[] = [
  {
    id: "broodwar",
    name: "Starcraft: Brood War",
    link: "",
    requiresPairing: false,
    options: ["Fastest Map", "Big Game Hunters Melee", "Standard"],
  },
  {
    id: "chess",
    name: "Chess",
    link: "https://www.chess.com/home",
    requiresPairing: false,
    options: [],
  },
  {
    id: "minecraft",
    name: "Minecraft",
    link: "",
    requiresPairing: false,
    options: ["First to Diamonds", "Beat the End"],
  },
  {
    id: "starcraft2",
    name: "Starcraft 2",
    link: "",
    requiresPairing: false,
    options: ["Multiplayer", "Arcade"],
  },
  {
    id: "binding-of-isaac",
    name: "Binding of Isaac",
    link: "",
    requiresPairing: false,
    options: [],
  },
];

const MP_ONLY_GAMES: GameEntry[] = [
  {
    id: "skribblio",
    name: "Skribbl.io",
    link: "https://skribbl.io/",
    requiresPairing: false,
    options: [],
  },
];

const STANDARD_GAMES: GameEntry[] = [
  {
    id: "tft",
    name: "Teamfight Tactics",
    link: "",
    requiresPairing: false,
    options: [],
  },

  {
    id: "geoguessr",
    name: "Geoguessr",
    link: "https://www.geoguessr.com",
    requiresPairing: false,
    options: [],
  },
  {
    id: "human-benchmark",
    name: "Human Benchmark",
    link: "https://humanbenchmark.com/",
    requiresPairing: false,
    options: [
      "Reaction Time",
      "Sequence Memory",
      "Aim Trainer",
      "Number Memory",
      "Verbal Memory",
      "Chimp Test",
      "Visual Memory",
      "Typing",
    ],
  },
  {
    id: "tetris",
    name: "Tetris",
    link: "https://tetr.io/",
    requiresPairing: false,
    options: ["VS", "40 Lines"],
  },
  {
    id: "pokemon-showdown",
    name: "Pokemon Showdown",
    link: "https://play.pokemonshowdown.com/",
    requiresPairing: true,
    options: [],
  },
  {
    id: "ultimate-chicken-horse",
    name: "Ultimate Chicken Horse",
    link: "steam://launch/386940/Dialog",
    requiresPairing: false,
    options: [],
  },
  {
    id: "wordle",
    name: "Wordle",
    link: "",
    requiresPairing: false,
    options: [],
  },
  {
    id: "poker",
    name: "Poker",
    link: "",
    requiresPairing: false,
    options: [],
  },
  {
    id: "scrabble",
    name: "Scrabble",
    link: "",
    requiresPairing: false,
    options: [],
  },
  {
    id: "battleships",
    name: "Battleships",
    link: "https://papergames.io/en/battleship",
    requiresPairing: true,
    options: [],
  },
  {
    id: "trackmania",
    name: "Trackmania",
    link: "steam://launch/2225070/Dialog",
    requiresPairing: true,
    options: [],
  },
  // {
  //   id: "crawl",
  //   name: "Crawl",
  //   link: "steam://launch/293780/Dialog",
  //   requiresPairing: true,
  //   options: [],
  // },
  // {
  //   id: "counter-strike",
  //   name: "Counter-Strike 2",
  //   link: "steam://launch/730/Dialog",
  //   requiresPairing: false,
  //   options: [],
  // },
  {
    id: "wikipedia-race",
    name: "Wikipedia Race",
    link: "https://www.thewikipediagame.com/",
    requiresPairing: false,
    options: [],
  },
  {
    id: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    link: "https://www.rpsgame.org/",
    requiresPairing: false,
    options: [],
  },
  {
    id: "golf-with-your-friends",
    name: "Golf with your Friends",
    link: "steam://launch/431240/Dialog",
    requiresPairing: false,
    options: [],
  },
  {
    id: "tricky-towers",
    name: "Tricky Towers",
    link: "steam://launch/437920/Dialog",
    requiresPairing: false,
    options: [],
  },
  {
    id: "pokemon-speedrun",
    name: "Pokemon Emerald Randomiser Speedrun",
    link: "",
    requiresPairing: false,
    options: [],
  },
  {
    id: "suika",
    name: "Suika World",
    link: "https://suika.world/",
    requiresPairing: false,
    options: [],
  },
  {
    id: "contexto",
    name: "Contexto",
    link: "https://contexto.me/",
    requiresPairing: false,
    options: [],
  },
];
