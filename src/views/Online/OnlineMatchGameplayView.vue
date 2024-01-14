<template>
  <div>
    <app-bar-goat-gamer title="Who Is the GOAT Gamer?"></app-bar-goat-gamer>
    <v-container>
      <v-row>
        <v-col>
          <v-card title="Scoring" min-height="100%" min-width="100%">
            <v-list>
              <v-list-item
                v-for="player in playerList"
                v-bind:key="'scoring_' + player.player.id"
              >
                {{ player.player.name }}
                <template v-slot:append>
                  <v-btn
                    @click="updateScore(player, -1)"
                    :disabled="!isHost"
                    density="compact"
                    icon="mdi-minus"
                  ></v-btn>
                  <div class="score-display">
                    {{ player.score }}
                  </div>
                  <v-btn
                    @click="updateScore(player, 1)"
                    :disabled="!isHost"
                    density="compact"
                    icon="mdi-plus"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
          <v-btn @click="submitScores">Submit Scores</v-btn>
        </v-col>
        <v-col>
          <v-row>
            <v-col>
              <leaderboard-display
                :scoreDisplayArray="leaderboard"
              ></leaderboard-display>
            </v-col>
            <v-col>
              <chat-display
                :code="matchData ? matchData.code : ''"
                :chatLogs="matchData ? matchData?.chatLog : []"
              ></chat-display>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import {
  GameHistory,
  Match,
  MatchState,
  Player,
  PlayerPoints,
} from "@/firebase/database/database-interfaces";
import { VContainer, VRow, VCol } from "vuetify/lib/components/index.mjs";
import { onMounted, ref } from "vue";
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { getOnlineMatchListener } from "@/firebase/database/database";
import LeaderboardDisplay from "@/components/LeaderboardDisplay/LeaderboardDisplay.vue";
import ChatDisplay from "@/components/ChatDisplay/ChatDisplay.vue";
import { SpinnerItem } from "@/components/Spinner/SpinnerInterfaces";
import { ScoreDisplay } from "@/components/LeaderboardDisplay/LeaderboardInterfaces";
import {
  updateCurrentGameOnlineMatch,
  updateStateAndGameOnlineMatch,
  updateStateOnlineMatch,
} from "@/firebase/database/database-match";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
});

interface PlayerAndScore {
  player: Player;
  score: number;
}

const isHost = ref(false);
const matchData = ref<Match | null>(null);
const unsubscribeFunction = ref<() => void>(() => {});
const leaderboard = ref<ScoreDisplay[]>([]);
const router = useRouter();

const playerList = ref<PlayerAndScore[]>([]);

async function getMatch() {
  const updater = (a: Match) => {
    matchData.value = a;

    const currentUser = auth.currentUser;
    if (currentUser == null) {
      console.log("Error, user not logged in");
    }

    // Check if user is still in the Match or not
    if (currentUser) {
      const filterForCurrentUser = matchData.value.playerList.filter(
        (currentPlayer) => currentPlayer.id == currentUser.uid,
      );
      if (filterForCurrentUser.length == 0) {
        // At this point, the user is no longer in the lobby
        router.push("/online");
      }
    }

    // Check if user is host
    if (currentUser && currentUser.uid == a.hostId) {
      isHost.value = true;
    } else {
      isHost.value = false;
    }

    // Set Player Scores
    setPlayerAndScores(a.playerList);

    // Update ScoreDisplay
    calculateScore(a);
  };

  const accessDenied = () => {
    router.push("/online");
  };

  unsubscribeFunction.value = await getOnlineMatchListener(
    props.code,
    updater,
    accessDenied,
  );
}

function calculateScore(matchData: Match) {
  // Create Initial Players
  const map = new Map(
    matchData.playerList.map((player: Player) => {
      return [player.id, { name: player.name, score: 0 }];
    }),
  );

  matchData.gameHistory.forEach((history: GameHistory) => {
    history.points.forEach((pointHistory) => {
      const storedValue = map.get(pointHistory.playerId);
      if (storedValue) {
        storedValue.score += pointHistory.points;
      }
    });
  });

  // Convert to Array
  const calculatedLeaderboard = [...map].map(([id, value]) => ({
    playerName: value.name,
    playerId: id,
    score: value.score,
  }));

  leaderboard.value = calculatedLeaderboard.sort((o1, o2) => {
    if (o1.score > o2.score) {
      return 1;
    } else if (o1.score < o2.score) {
      return -1;
    } else {
      return 0;
    }
  });
}

function setPlayerAndScores(matchPlayers: Player[]) {
  const existingPlayerIds = playerList.value.map((player) => {
    return player.player.id;
  });

  const newPlayerScores = matchPlayers
    .map((player) => {
      return { player: player, score: 0 };
    })
    .filter((player) => {
      return !existingPlayerIds.includes(player.player.id);
    });

  playerList.value = playerList.value.concat(newPlayerScores);
}

function updateScore(playerAndScore: PlayerAndScore, adjustment: number) {
  playerAndScore.score += adjustment;
  if (playerAndScore.score <= 0) {
    playerAndScore.score = 0;
  }
}

async function submitScores() {
  const playerPoints = playerList.value.map((playerAndScore) => {
    const returnItem: PlayerPoints = {
      playerId: playerAndScore.player.id,
      points: playerAndScore.score,
    };
    return returnItem;
  });
  await updateCurrentGameOnlineMatch(props.code, playerPoints);
  await updateStateOnlineMatch(props.code, MatchState.AWAIT_RESULTS);
}

onMounted(() => {
  getMatch();
});
</script>

<style scoped lang="scss">
.online-view-pick-ban-center {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1000px;
}

.score-display {
  padding-left: 16px;
  padding-right: 16px;
}
</style>
