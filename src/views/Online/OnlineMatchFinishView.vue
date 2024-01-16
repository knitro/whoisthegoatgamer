<template>
  <div>
    <app-bar-goat-gamer title="Who Is the GOAT Gamer?"></app-bar-goat-gamer>
    <v-container fluid>
      <v-row>
        <v-col cols="6">
          <v-col cols="12">
            <goat-display
              :player-list="matchData?.playerList ?? []"
              :game-history="matchData?.gameHistory ?? []"
              :pointsToWin="matchData?.pointsToWin ?? 0"
              :match-id="props.code"
            ></goat-display>
          </v-col>
          <v-col cols="12">
            <leaderboard-display
              :player-list="matchData?.playerList ?? []"
              :game-history="matchData?.gameHistory ?? []"
              :pointsToWin="matchData?.pointsToWin ?? 0"
              :match-id="props.code"
              :add-to-updater="addToLeaderboardUpdater"
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
                      :title="'Game ' + (index + 1) + ': ' + history.name"
                    ></v-list-item>
                  </template>
                  <v-list-item
                    v-for="playerScore in history.points"
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
import { Match, Player } from "@/firebase/database/database-interfaces";
import { onMounted, ref } from "vue";
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { getOnlineMatchListener } from "@/firebase/database/database";
import LeaderboardDisplay from "@/components/LeaderboardDisplay/LeaderboardDisplay.vue";
import ConfettiExplosion from "vue-confetti-explosion";
import { VCard, VList, VListItem } from "vuetify/lib/components/index.mjs";
import GoatDisplay from "@/components/LeaderboardDisplay/GoatDisplay.vue";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
});

const isHost = ref(false);
const matchData = ref<Match | null>(null);
const unsubscribeFunction = ref<() => void>(() => {});
const idNameMap = ref<Map<string, string>>(new Map());

const leaderboardUpdater = ref(() => {});

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

    // Update Leaderboard
    leaderboardUpdater.value();
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

const addToLeaderboardUpdater = (functionToAdd: () => void) => {
  leaderboardUpdater.value = functionToAdd;
};

onMounted(() => {
  getMatch();
});
</script>

<style scoped lang="scss"></style>
