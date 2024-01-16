import { GameEntry } from "@/firebase/database/database-interfaces";
import { PRESET_WEB_GAMES } from "./PresetWebGames";
import { PRESET_WEB_GAMES_DAILIES } from "./PresetWebGamesDailies";
import { PRESET_WEB_GAMES_GROUPS } from "./PresetWebGamesGroups";
import { PRESET_STEAM_GAMES } from "./PresetSteam";
import { PRESET_STEAM_GAMES_LOCAL } from "./PresetSteamLocal";
import { PRESET_DISCORD_GAMES } from "./PresetDiscordGames";
import { PRESET_OTHER_GAMES, PRESET_STARCRAFT_GAMES } from "./PresetOthers";

export enum PresetOption {
  WEB = "Web Games",
  WEB_DAILIES = "Daily Web Games",
  WEB_GROUPS = "Web Games (4+ players)",
  STEAM = "Steam Games",
  STEAM_LOCAL = "Steam Games (Local or Remote Play)",
  DISCORD = "Discord Games",
  STARCRAFT = "Starcraft",
  OTHER = "Non-Steam Games",
}

export function getPreset(option: PresetOption[]): GameEntry[] {
  if (option.length == 0) {
    return [];
  }

  const games = option.map((preset) => {
    switch (preset) {
      case PresetOption.WEB: {
        return PRESET_WEB_GAMES;
      }
      case PresetOption.WEB_DAILIES: {
        return PRESET_WEB_GAMES_DAILIES;
      }
      case PresetOption.WEB_GROUPS: {
        return PRESET_WEB_GAMES_GROUPS;
      }
      case PresetOption.STEAM: {
        return PRESET_STEAM_GAMES;
      }
      case PresetOption.STEAM_LOCAL: {
        return PRESET_STEAM_GAMES_LOCAL;
      }
      case PresetOption.DISCORD: {
        return PRESET_DISCORD_GAMES;
      }
      case PresetOption.STARCRAFT: {
        return PRESET_STARCRAFT_GAMES;
      }
      case PresetOption.OTHER: {
        return PRESET_OTHER_GAMES;
      }
      default:
        return [];
    }
  });

  return games.flat(1);
}
