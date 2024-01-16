import { GameEntry } from "@/firebase/database/database-interfaces";

export const PRESET_WEB_GAMES: GameEntry[] = [
  {
    id: "chess",
    name: "Chess",
    link: "https://www.chess.com/home",
    options: [
      { name: "Bullet (1/1)", requiresPairing: true },
      { name: "Blitz (3/2)", requiresPairing: true },
      { name: "Rapid (15/10)", requiresPairing: true },
    ],
  },
  {
    id: "human-benchmark",
    name: "Human Benchmark",
    link: "https://humanbenchmark.com/",
    options: [
      { name: "Reaction Time", requiresPairing: false },
      { name: "Sequence Memory", requiresPairing: false },
      { name: "Aim Trainer", requiresPairing: false },
      { name: "Number Memory", requiresPairing: false },
      { name: "Verbal Memory", requiresPairing: false },
      { name: "Chimp Test", requiresPairing: false },
      { name: "Visual Memory", requiresPairing: false },
      { name: "Typing", requiresPairing: false },
    ],
  },
  {
    id: "tetris",
    name: "Tetris",
    link: "https://tetr.io/",
    options: [
      { name: "VS", requiresPairing: false },
      { name: "40 Lines", requiresPairing: false },
    ],
  },
  {
    id: "pokemon-showdown",
    name: "Pokemon Showdown",
    link: "https://play.pokemonshowdown.com/",
    options: [{ name: "Random Teams", requiresPairing: true }],
  },
  {
    id: "battleships",
    name: "Battleships",
    link: "https://papergames.io/en/battleship",
    options: [{ name: "1v1", requiresPairing: true }],
  },
  {
    id: "rock-paper-scissors",
    name: "Rock Paper Scissors",
    link: "https://www.rpsgame.org/",
    options: [{ name: "1v1", requiresPairing: true }],
  },
  {
    id: "suika",
    name: "Suika World",
    link: "https://suika.world/",
    options: [{ name: "Highest Score", requiresPairing: false }],
  },
  {
    id: "flappybird",
    name: "Flappy Bird",
    link: "https://flappybird.io/",
    options: [{ name: "Highest Score", requiresPairing: false }],
  },
  {
    id: "chromedinogame",
    name: "Chrome Dinosaur Game",
    link: "chrome://dino/ ",
    options: [{ name: "Highest Score", requiresPairing: false }],
  },
];
