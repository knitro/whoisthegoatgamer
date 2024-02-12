export enum GameType {
  RANDOM = "Random Game Picker",
  RANDOM_LOWEST = "Lowest Score Picks",
  BROVSBRO = "Bro vs Bro w/ Random Games",
  BROVSBRO_LOWEST = "Bro vs Bro w/ Lowest Score Picks",
}

export enum GamePreset {
  NONE = "No Preset",
  TWO_PLAYER = "1v1 ",
  THREE_PLAYER = "3-4 Players",
  FIVE_PLAYER = "5+ Players",
  WEB_ONLY = "Web Only",
}

export enum GameTags {
  WEB = "Web Games",
  DAILY = "Daily Web Games",
  GROUP = "Games (4+ Players)",
  STEAM = "Steam Games",
  LOCAL = "Steam Games (Local or Remote Play)",
  LOCALONLY = "Steam Games (Remote Play only)",
  DISCORD = "Discord Games",
  POKEMON = "Pokemon Games",
  MINECRAFT = "Minecraft",
  STARCRAFT = "Starcraft Games",
  EGS = "Epic Games Store Games",
  PAID = "Paid Games",
}

export enum HomeState {
  SELECT,
  CREATE,
  JOIN,
}
