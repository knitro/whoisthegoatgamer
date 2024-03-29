<template>
  <div>
    <app-bar-goat-gamer title="Who Is the GOAT Gamer?"></app-bar-goat-gamer>
    <v-container fluid>
      <v-row>
        <v-col cols="6">
          <v-col cols="12">
            <scroller-selector
              :items="spinnerItems"
              :setterFunction="setCurrentGame"
              :code="props.code"
              :add-to-updater="addToRollUpdater"
              :reset-activation-button="resetActivationButton"
              :is-host="isHost"
            ></scroller-selector>
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
            <game-list
              :code="matchData ? matchData.code : ''"
              :gameList="matchData ? matchData.gameList : []"
              :is-disabled="
                (matchData ? matchData.state !== MatchState.GAME : false) ||
                !isHost
              "
            ></game-list>
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
} from "@/firebase/database/database-interfaces";
import { VContainer, VRow, VCol } from "vuetify/lib/components/index.mjs";
import { onMounted, ref } from "vue";
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import { getOnlineMatchListener } from "@/firebase/database/database";
import GameList from "@/components/GameList/GameList.vue";
import ScrollerSelector from "@/components/Spinner/ScrollerSelector.vue";
import LeaderboardDisplay from "@/components/LeaderboardDisplay/LeaderboardDisplay.vue";
import ChatDisplay from "@/components/ChatDisplay/ChatDisplay.vue";
import { SpinnerItem } from "@/components/Spinner/SpinnerInterfaces";
import { updateStateAndGameOnlineMatch } from "@/firebase/database/database-match";
import { LeaderboardScore, calculateScore } from "@/logic/LeaderboardLogic";
import { addToChatHistoryBotOnlineMatch } from "@/firebase/database/database-chat";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
});

const isHost = ref(false);
const matchData = ref<Match | null>(null);
const unsubscribeFunction = ref<() => void>(() => {});
const spinnerItems = ref<SpinnerItem[]>([]);
const idNameMap = ref<Map<string, string>>(new Map());
const leaderboard = ref<LeaderboardScore[]>([]);

// Updater Functions
const rollUpdater = ref((a: number) => {});
const resetActivationButtonFunction = ref(() => {});

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

    // Check for Random Spins
    if (a.numOfSpins > 0) {
      rollUpdater.value(a.numOfSpins);
    }

    // Check for State Reset
    if (a.state == MatchState.GAME) {
      resetActivationButtonFunction.value();
    }

    // Update SpinnerItems
    const updatedSpinnerItems = a.gameList.map((gameEntry) => {
      return {
        id: gameEntry.id,
        label: gameEntry.name,
        active: false,
      };
    });
    spinnerItems.value = updatedSpinnerItems;

    // Update Leaderboard
    leaderboard.value = await calculateScore(
      a.playerList,
      a.gameHistory,
      a.pointsToWin,
      a.code,
    );
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

const setCurrentGame = async (item: SpinnerItem) => {
  // Get GameEntry from id
  const game = matchData.value?.gameList.find((game) => game.id === item.id);

  if (game) {
    await updateStateAndGameOnlineMatch(
      props.code,
      MatchState.AWAIT_ACCEPTANCE,
      game,
    );
    await addToChatHistoryBotOnlineMatch(
      props.code,
      game.name + " has been selected.",
    );
  }
};

const addToRollUpdater = (functionToAdd: (a: number) => void) => {
  rollUpdater.value = functionToAdd;
};

const resetActivationButton = (functionToAdd: () => void) => {
  resetActivationButtonFunction.value = functionToAdd;
};

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
</style>
