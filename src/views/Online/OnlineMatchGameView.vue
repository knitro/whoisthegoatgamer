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
            ></scroller-selector>
          </v-col>
          <v-row>
            <v-col cols="7">
              <chat-display
                :code="matchData ? matchData.code : ''"
                :chatLogs="matchData ? matchData?.chatLog : []"
                :player-id-name-mapping="idNameMap"
              ></chat-display>
            </v-col>
            <v-col cols="5">
              <leaderboard-display
                :scoreDisplayArray="leaderboard"
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
                matchData ? matchData.state !== MatchState.GAME : false
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
  GameHistory,
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
import { ScoreDisplay } from "@/components/LeaderboardDisplay/LeaderboardInterfaces";
import {
  addToChatHistoryBotOnlineMatch,
  updateStateAndGameOnlineMatch,
  updateStateOnlineMatch,
} from "@/firebase/database/database-match";

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

    // Update SpinnerItems
    const updatedSpinnerItems = a.gameList.map((gameEntry) => {
      return {
        id: gameEntry.id,
        label: gameEntry.name,
        active: false,
      };
    });
    spinnerItems.value = updatedSpinnerItems;

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
  if (matchData == null || matchData.playerList == null) {
    return;
  }

  // Create Initial Players
  const map = new Map(
    matchData.playerList.map((player: Player) => {
      return [player.id, { name: player.name, score: 0 }];
    }),
  );

  // Add Game History Scores if they exist
  if (matchData.gameHistory) {
    matchData.gameHistory.forEach((history: GameHistory) => {
      history.points.forEach((pointHistory) => {
        const storedValue = map.get(pointHistory.playerId);
        if (storedValue) {
          storedValue.score += pointHistory.points;
        }
      });
    });
  }

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

  if (leaderboard.value.length > 0 && leaderboard.value[0].score >= 10) {
    await updateStateOnlineMatch(props.code, MatchState.FINISHED);
  }
}

const setCurrentGame = async (item: SpinnerItem) => {
  // Get GameEntry from id
  const game = matchData.value?.gameList.find((game) => game.id === item.id);

  if (game) {
    if (game.link && game.link != "") {
      console.log("Bot Chatter");
      await addToChatHistoryBotOnlineMatch(props.code, game.link);
    }
    await updateStateAndGameOnlineMatch(
      props.code,
      MatchState.AWAIT_ACCEPTANCE,
      game,
    );
  }
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
