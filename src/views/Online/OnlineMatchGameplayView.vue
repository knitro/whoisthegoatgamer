<template>
  <div>
    <v-container fluid>
      <v-row>
        <v-col cols="6">
          <v-col cols="12">
            <v-card class="scroller-container curved-border">
              <v-card
                class="scroller-item"
                :style="
                  'background: ' +
                  stringToColour(
                    matchData
                      ? matchData.currentGame.history.name
                      : 'Random Game',
                  ).backgroundColour
                "
              >
                <span class="text">
                  {{
                    matchData
                      ? matchData.currentGame.history.name
                      : "Random Game"
                  }}
                </span>
                <span class="subtitle">{{
                  matchData ? matchData.currentGame.option.name : ""
                }}</span>
              </v-card>
            </v-card>
          </v-col>
          <v-row>
            <v-col cols="7">
              <chat-display
                :code="code"
                :player-id-name-mapping="idNameMap"
              ></chat-display>
            </v-col>
            <v-col cols="5">
              <leaderboard-display
                :leaderboard-data="leaderboard ?? []"
                :pointsToWin="matchData?.pointsToWin ?? 0"
              ></leaderboard-display>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="6">
          <v-col cols="12">
            <v-card
              title="Scoring"
              subtitle="Assign points when the game is finished"
              min-height="100%"
              min-width="100%"
              class="curved-border"
            >
              <v-list>
                <v-list-item
                  v-for="player in playerList"
                  v-bind:key="'scoring_' + player.player.id"
                >
                  <template v-slot:prepend>
                    <v-avatar color="grey-lighten-1">
                      <v-img
                        :src="
                          'https://robohash.org/' + player.player.id + '.png'
                        "
                      />
                    </v-avatar>
                  </template>
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
              <v-card-actions>
                <v-btn
                  class="button-padding"
                  variant="flat"
                  color="green"
                  @click="submitScores"
                  append-icon="mdi-send"
                  rounded
                  :disabled="!isHost"
                  >Submit Scores</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="12">
            <timer-online-card
              :match-id="props.code"
              :is-host="isHost"
            ></timer-online-card>
          </v-col>
          <v-col cols="12">
            <bracket-generator
              :bracket-array="matchData?.brackets ?? []"
              :match-id="props.code"
              :is-host="isHost"
              :player-list="matchData?.playerList ?? []"
            ></bracket-generator>
          </v-col>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import {
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
import {
  updateCurrentGameOnlineMatch,
  updateStateOnlineMatch,
} from "@/firebase/database/database-match";
import { stringToColour } from "@/logic/string-to-colour";
import BracketGenerator from "@/components/BracketGenerator/BracketGenerator.vue";
import { LeaderboardScore, calculateScore } from "@/logic/LeaderboardLogic";
import TimerOnlineCard from "@/components/Timer/TimerOnlineCard.vue";

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
const router = useRouter();
const idNameMap = ref<Map<string, string>>(new Map());

const playerList = ref<PlayerAndScore[]>([]);

const leaderboard = ref<LeaderboardScore[]>([]);

async function getMatch() {
  const updater = async (a: Match) => {
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
        router.push("/home");
      }
    }

    // Check if user is host
    if (currentUser && currentUser.uid == a.hostId) {
      isHost.value = true;
    } else {
      isHost.value = false;
    }

    // Get Player ID-Name Mapping
    idNameMap.value = new Map(
      a.playerList.map((player: Player) => {
        return [player.id, player.name];
      }),
    );

    // Set Player Scores
    setPlayerAndScores(a.playerList);

    // Update Leaderboard
    leaderboard.value = await calculateScore(
      a.playerList,
      a.gameHistory,
      a.pointsToWin,
      a.code,
    );
  };

  const accessDenied = () => {
    router.push("/home");
  };

  unsubscribeFunction.value = await getOnlineMatchListener(
    props.code,
    updater,
    accessDenied,
  );
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
.scroller-container {
  border: 2px solid #333;
  height: 200px;
  margin-bottom: 16px;

  .scroller-item {
    height: 200px;
    text-align: center;
    span.text {
      margin-top: 64px;
      display: block;
      font-size: 36px;
    }
    span.subtitle {
      font-size: 20px;
    }
  }
}

.score-display {
  padding-left: 16px;
  padding-right: 16px;
}

.curved-border {
  border-radius: 16px;
}

.button-padding {
  padding-left: 16px;
  padding-right: 16px;
}
</style>
