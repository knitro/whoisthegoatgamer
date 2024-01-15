<template>
  <div>
    <app-bar-goat-gamer title="Who Is the GOAT Gamer?"></app-bar-goat-gamer>
    <v-container fluid>
      <v-row>
        <v-col cols="6">
          <v-col cols="12">
            <v-card class="goat-card">
              <span class="name">
                <v-icon icon="mdi-trophy"></v-icon>
                {{
                  leaderboard.length > 0 ? leaderboard[0].playerName : "ERROR"
                }}
                <v-icon icon="mdi-trophy"></v-icon>
              </span>
              <br />
              <span class="underlabel">is the GOAT Gamer</span>
            </v-card>
          </v-col>
          <v-col cols="12">
            <leaderboard-display
              :scoreDisplayArray="leaderboard"
            ></leaderboard-display>
          </v-col>
        </v-col>
        <ConfettiExplosion :particleCount="300" :duration="15000" :force="1" />
        <v-col cols="6">
          <v-col cols="12">
            <v-card title="Game History">
              <v-list>
                <v-list-group
                  v-for="(history, index) in matchData?.gameHistory"
                  v-bind:key="'history_' + history.id"
                >
                  <template v-slot:activator="{ props }">
                    <v-list-item
                      v-bind="props"
                      prepend-icon="mdi-controller"
                      :title="'Game ' + index + ': ' + history.name"
                    ></v-list-item>
                  </template>
                  <v-list-item
                    v-for="(playerScore, index) in history.points"
                    v-bind:key="
                      'score_' + history.id + '_' + playerScore.playerId
                    "
                    :title="idNameMap.get(playerScore.playerId)"
                  >
                    <template v-slot:append>
                      {{ playerScore.points }} pts
                    </template>
                  </v-list-item>
                </v-list-group>
              </v-list>
            </v-card>
          </v-col>
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
} from "@/firebase/database/database-interfaces";
import { onMounted, ref } from "vue";
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { getOnlineMatchListener } from "@/firebase/database/database";
import LeaderboardDisplay from "@/components/LeaderboardDisplay/LeaderboardDisplay.vue";
import { ScoreDisplay } from "@/components/LeaderboardDisplay/LeaderboardInterfaces";
import { updateStateOnlineMatch } from "@/firebase/database/database-match";
import ConfettiExplosion from "vue-confetti-explosion";
import {
  VCard,
  VImg,
  VCardTitle,
  VCardSubtitle,
  VExpandTransition,
  VDivider,
  VList,
  VBtn,
  VListSubheader,
  VListItem,
} from "vuetify/lib/components/index.mjs";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
});

const isHost = ref(false);
const matchData = ref<Match | null>(null);
const unsubscribeFunction = ref<() => void>(() => {});
const leaderboard = ref<ScoreDisplay[]>([]);
const idNameMap = ref<Map<string, string>>(new Map());

const router = useRouter();

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
        router.push("/online");
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

    // Update ScoreDisplay
    await calculateScore(a);
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

async function calculateScore(matchData: Match) {
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
      return -1;
    } else if (o1.score < o2.score) {
      return 1;
    } else {
      return 0;
    }
  });

  if (leaderboard.value.length > 0 && leaderboard.value[0].score >= 10) {
    await updateStateOnlineMatch(props.code, MatchState.FINISHED);
  }
}

onMounted(() => {
  getMatch();
});
</script>

<style scoped lang="scss">
.goat-card {
  height: 200px;
  line-height: 100px;
  text-align: center;
  .name {
    font-size: 72px;
  }
  .underlabel {
    font-size: 18px;
  }
}
</style>
