import {
  GameHistory,
  MatchState,
  Player,
} from "@/firebase/database/database-interfaces";
import { updateStateOnlineMatch } from "@/firebase/database/database-match";

export interface LeaderboardScore {
  playerId: string;
  playerName: string;
  score: number;
  prevScore: number; // Previous Round Score - needed for tiebreaks
}

export async function calculateScore(
  playerList: Player[],
  gameHistory: GameHistory[],
  pointsToWin: number,
  code: string,
): Promise<LeaderboardScore[]> {
  // Create Initial Players
  const map = new Map(
    playerList.map((player: Player) => {
      return [player.id, { name: player.name, score: 0, prevScore: 0 }];
    }),
  );

  gameHistory.forEach((history: GameHistory) => {
    history.points.forEach((pointHistory) => {
      const storedValue = map.get(pointHistory.playerId);
      if (storedValue) {
        storedValue.prevScore = storedValue.score;
        storedValue.score += pointHistory.points;
      }
    });
  });

  // Convert to Array
  const calculatedLeaderboard = [...map].map(([id, value]) => ({
    playerName: value.name,
    playerId: id,
    score: value.score,
    prevScore: value.prevScore,
  }));

  // Leaderboard Sorting
  // Sort by: Score > Highest Score Last
  calculatedLeaderboard.sort((o1, o2) => {
    if (o1.score > o2.score) {
      return -1;
    } else if (o1.score < o2.score) {
      return 1;
    } else {
      // Same Score, Highest Score Last
      if (o1.prevScore > o2.prevScore) {
        return -1;
      } else if (o1.prevScore < o2.prevScore) {
        return 1;
      }
      return 0;
    }
  });

  // Check if anyone has reached the max score
  if (
    calculatedLeaderboard.length > 0 &&
    calculatedLeaderboard[0].score >= pointsToWin
  ) {
    await updateStateOnlineMatch(code, MatchState.FINISHED);
  }

  return calculatedLeaderboard;
}
