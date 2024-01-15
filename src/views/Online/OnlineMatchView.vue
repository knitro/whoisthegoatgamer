<template>
  <div>
    <online-match-lobby-view
      v-if="matchData?.state === MatchState.LOBBY"
      :code="props.id"
    ></online-match-lobby-view>
    <online-match-game-view
      v-else-if="
        matchData?.state === MatchState.GAME ||
        matchData?.state === MatchState.AWAIT_ACCEPTANCE
      "
      :code="props.id"
    ></online-match-game-view>
    <online-match-gameplay-view
      v-else-if="
        matchData?.state === MatchState.GAMEPLAY ||
        matchData?.state === MatchState.AWAIT_RESULTS
      "
      :code="props.id"
    ></online-match-gameplay-view>
    <online-match-finish-view
      v-else-if="matchData?.state === MatchState.FINISHED"
      :code="props.id"
    ></online-match-finish-view>

    <v-overlay :z-index="0" v-model="showAcceptanceOverlay" persistent>
      <v-card :loading="hasReady" class="online-view-overlay">
        <v-img :src="WaitingImage"></v-img>
        <v-card-title>Confirm Game</v-card-title>

        <v-card-text>
          The game selected is
          <b>{{ matchData?.currentGame.name }}</b
          >. Choose to accept the game chosen or use one of your vetos.
        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="confirmGame()"
            variant="flat"
            prepend-icon="mdi-play"
            color="green"
            :disabled="hasReady"
            rounded
          >
            Confirm
          </v-btn>
          <v-btn
            @click="vetoGame()"
            variant="flat"
            prepend-icon="mdi-close-octagon"
            color="red"
            :disabled="vetoCount <= 0"
            rounded
          >
            Veto Game ({{ vetoCount }} left)
          </v-btn>
          <v-chip class="ready-chip">
            {{ playerCount - numberNotReady }} / {{ playerCount }} Ready
          </v-chip>
        </v-card-actions>
      </v-card>
    </v-overlay>

    <v-overlay
      :z-index="0"
      v-model="showResultsOverlay"
      persistent
      max-width="800"
    >
      <v-card :loading="hasReady" class="online-view-overlay">
        <v-img :src="WaitingImage"></v-img>
        <v-card-title>Results Confirmation</v-card-title>

        <v-card-text>
          The host has submitted the following scores for
          <b>{{
            matchData && matchData.currentGame ? matchData.currentGame.name : ""
          }}</b
          >.
        </v-card-text>
        <v-list>
          <v-list-item
            v-if="matchData && matchData.currentGame"
            v-for="playerScoreData in matchData?.currentGame.points"
            v-bind:key="'scoring_' + playerScoreData.playerId"
          >
            {{
              matchData?.playerList.find(
                (player) => player.id === playerScoreData.playerId,
              )?.name
            }}
            <template v-slot:append>
              {{ playerScoreData.points }}
            </template>
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-btn
            @click="confirmGame()"
            variant="flat"
            prepend-icon="mdi-play"
            color="green"
            :disabled="hasReady"
            rounded
          >
            Yes, Correct Scores
          </v-btn>
          <v-btn
            @click="rejectScores()"
            variant="flat"
            prepend-icon="mdi-close-octagon"
            color="red"
            rounded
          >
            No, Incorrect Scores
          </v-btn>
          <v-chip class="ready-chip">
            {{ playerCount - numberNotReady }} / {{ playerCount }} Ready
          </v-chip>
        </v-card-actions>
      </v-card>
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import {
  Match,
  MatchState,
  Player,
} from "@/firebase/database/database-interfaces";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { getOnlineMatchListener } from "@/firebase/database/database";
import OnlineMatchLobbyView from "./OnlineMatchLobbyView.vue";
import OnlineMatchGameView from "./OnlineMatchGameView.vue";
import OnlineMatchGameplayView from "./OnlineMatchGameplayView.vue";
import OnlineMatchFinishView from "./OnlineMatchFinishView.vue";
import WaitingImage from "@/assets/images/trees.png";
import {
  addToChatHistoryBotOnlineMatch,
  addToGameHistoryOnlineMatch,
  removeGameListOnlineMatch,
  updateStateAndGameOnlineMatch,
  updateStateOnlineMatch,
} from "@/firebase/database/database-match";
import { auth } from "@/firebase/firebase";
import {
  playerConfirmOnlineMatch,
  playerVetoOnlineMatch,
  setAllPlayersUnready,
} from "@/firebase/database/database-players";

const props = defineProps({
  id: {
    type: String,
    default: "",
  },
});

const router = useRouter();
const matchData = ref<Match | null>(null);
const unsubscribeFunction = ref<() => void>(() => {});

// Acceptance/Results State Refs
const showAcceptanceOverlay = ref(false);
const showResultsOverlay = ref(false);
const vetoCount = ref(0);
const hasReady = ref(false);
const numberNotReady = ref(0);
const playerCount = ref(0);
const idNameMap = ref<Map<string, string>>(new Map());

async function getMatch() {
  const updater = (a: Match) => {
    matchData.value = a;
    playerCount.value = a.playerList.length;
    showAcceptanceOverlay.value = a.state === MatchState.AWAIT_ACCEPTANCE;
    showResultsOverlay.value = a.state === MatchState.AWAIT_RESULTS;
    checkIfAllReady(a);
    getPlayerVetosAndFlags(a);

    // Get Player ID-Name Mapping
    idNameMap.value = new Map(
      a.playerList.map((player: Player) => {
        return [player.id, player.name];
      }),
    );
  };

  const accessDenied = () => {
    router.push("/online");
  };

  unsubscribeFunction.value = await getOnlineMatchListener(
    props.id,
    updater,
    accessDenied,
  );
}

async function checkIfAllReady(matchData: Match) {
  const arrayOfNotReady = matchData.playerList.filter((player) => {
    return !player.isReady;
  });
  numberNotReady.value = arrayOfNotReady.length;

  if (
    arrayOfNotReady.length == 0 &&
    auth.currentUser &&
    auth.currentUser.uid == matchData.hostId
  ) {
    if (matchData.state == MatchState.AWAIT_ACCEPTANCE) {
      await updateStateOnlineMatch(props.id, MatchState.GAMEPLAY);
      await unreadyAllPlayers(matchData);
      await removeGameListOnlineMatch(props.id, matchData.currentGame.id);
    } else if (matchData.state == MatchState.AWAIT_RESULTS) {
      const currentGame = matchData.currentGame;
      await updateStateAndGameOnlineMatch(props.id, MatchState.GAME, null);
      await unreadyAllPlayers(matchData);
      await addToGameHistoryOnlineMatch(props.id, currentGame);
    }
  }
}

async function getPlayerVetosAndFlags(matchData: Match) {
  const user = auth.currentUser;
  if (user == null) {
    return;
  }

  const currentPlayerData = matchData.playerList.find(
    (player) => player.id === user.uid,
  );
  if (currentPlayerData == null) {
    return;
  }

  vetoCount.value = currentPlayerData.vetos;
  hasReady.value = currentPlayerData.isReady;
}

async function confirmGame() {
  if (auth.currentUser) {
    await playerConfirmOnlineMatch(props.id, auth.currentUser.uid);
  }
}

async function vetoGame() {
  if (
    auth.currentUser &&
    matchData.value &&
    matchData.value.state === MatchState.AWAIT_ACCEPTANCE
  ) {
    const updatedVetoCount = vetoCount.value - 1;
    await playerVetoOnlineMatch(
      props.id,
      auth.currentUser.uid,
      updatedVetoCount,
    );
    await updateStateOnlineMatch(props.id, MatchState.GAME);
    await unreadyAllPlayers(matchData.value);
    const name = idNameMap.value.get(auth.currentUser.uid);
    await addToChatHistoryBotOnlineMatch(props.id, name + " has vetoed.");
  }
}

async function unreadyAllPlayers(matchData: Match) {
  const playerIds = matchData.playerList.map((player) => player.id);
  await setAllPlayersUnready(props.id, playerIds);
}

async function rejectScores() {
  if (
    auth.currentUser &&
    matchData.value &&
    matchData.value.state === MatchState.AWAIT_RESULTS
  ) {
    await updateStateOnlineMatch(props.id, MatchState.GAMEPLAY);
  }
}

onMounted(() => {
  getMatch();
});
</script>

<style scoped lang="scss">
.online-view-overlay {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);

  .ready-chip {
    margin-left: 8px;
  }
}
</style>
