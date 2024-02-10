<template>
  <v-row align-content="center" justify="center">
    <v-col
      v-for="(cardData, index) in homeCardData"
      v-bind:key="index + '-' + cardData.header"
      cols="4"
    >
      <HomeCard
        :image="cardData.image"
        :header="cardData.header"
        :subheader="cardData.subheader"
        :clickFunction="cardData.clickFunction"
      ></HomeCard>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {
  createOnlineMatch,
  getOnlineMatchListener,
} from "@/firebase/database/database";
import { auth } from "@/firebase/firebase";
import { PropType, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Match,
  Player,
  PlayerRequest,
} from "@/firebase/database/database-interfaces";
import { VRow, VCol } from "vuetify/lib/components/index.mjs";
import { requestJoinMatch } from "@/firebase/database/database-request";
import { GameTags, HomeState } from "@/common/enums";
import createGameImage from "@/assets/home/create-game.png";
import joinGameImage from "@/assets/home/join-game.png";
import HomeCard from "@/components/Home/HomeCard.vue";
import { HomeCardItem } from "@/components/Home/HomeCardInterfaces";

const props = defineProps({
  setHomeState: {
    type: Function as PropType<(a: HomeState) => void>,
    required: true,
  },
});

const homeCardData: HomeCardItem[] = [
  {
    image: createGameImage,
    header: "Create a Game",
    subheader:
      "Create your own private lobby. You must be logged in to create a lobby",
    clickFunction: () => props.setHomeState(HomeState.CREATE),
  },
  {
    image: joinGameImage,
    header: "Join a Game",
    subheader: "Join a friend and show them who the GOAT is!",
    clickFunction: () => props.setHomeState(HomeState.JOIN),
  },
];

const router = useRouter();

const playerName = ref("");
const joinCode = ref("");
const joinCodeValid = ref(false);

const isCreating = ref(false);
const isJoining = ref(false);
const showJoinLoadingOverlay = ref(false);
const opponentsName = ref("");

// Game Settings
const preset = ref<GameTags[]>([]);
const pointsToWin = ref(10);
const numberOfVetos = ref(1);

const joinCodeRules = {
  required: (value: string) => !!value || "Required.",
  validJoinCode: (value: string) => {
    const pattern = /[A-Z][A-Z][0-9][0-9][0-9]/;
    return pattern.test(value) || "Invalid Join Code";
  },
  teamNameCount: (value: string) => value.length <= 20 || "Max 20 characters",
  numbersOnly: (value: string) => !Number.isNaN(Number.parseFloat(value)),
};

function createButtonPress() {
  if (!isCreating.value) {
    isCreating.value = true;
    const cleanedPlayerName = playerName.value.trim();
    if (cleanedPlayerName.length > 0) {
      createOnlineMatch(
        playerName.value,
        preset.value,
        pointsToWin.value,
        numberOfVetos.value,
      ).then((joinCode: string) => {
        isCreating.value = false;
        router.push({
          name: "onlineMatch",
          params: { id: joinCode },
        });
      });
    } else {
      isCreating.value = false;
    }
  }
}

function joinButtonPress() {
  isJoining.value = true;
  const cleanedPlayerName = playerName.value.trim();
  if (
    joinCodeValid.value &&
    cleanedPlayerName.length <= 20 &&
    cleanedPlayerName.length > 0
  ) {
    requestJoinMatch(joinCode.value, cleanedPlayerName).then(
      async (isRequestSuccess: boolean) => {
        if (!isRequestSuccess) {
          // Don't bother going further if request was not added
          isJoining.value = false;
          return;
        }

        showJoinLoadingOverlay.value = true;
        const updater = (currentMatch: Match) => {
          if (currentMatch === null || currentMatch === undefined) {
            return;
          }

          // Update Overlay with Host Name
          const host = currentMatch.playerList.find(
            (player) => player.id === currentMatch.hostId,
          );
          if (host === undefined) {
            opponentsName.value = "HOST-NAME-ERROR";
          } else {
            opponentsName.value = host.name;
          }

          // Check if Added to PlayerList
          const currentUserId = auth.currentUser ? auth.currentUser.uid : "";
          if (currentUserId == "") {
            // Ignore if user is not logged in
            return;
          }
          const currentPlayer = currentMatch.playerList.find(
            (player: Player) => player.id === currentUserId,
          );

          if (currentPlayer !== undefined) {
            // Player is in Player List
            router.push({
              name: "onlineMatch",
              params: { id: joinCode.value },
            });
          }

          // Check if Player is Removed from PlayerRequests
          const userRequest: PlayerRequest = {
            name: cleanedPlayerName,
            id: currentUserId,
          };
          if (
            !checkIfRequestStillExists(currentMatch.playerRequests, userRequest)
          ) {
            showJoinLoadingOverlay.value = false;
            isJoining.value = false;
            unsubscribe();
          }
        };

        const accessDenied = () => {
          // Function that is called when there is no data at location or access is forbidden
          showJoinLoadingOverlay.value = false;
          isJoining.value = false;
        };
        const unsubscribe = await getOnlineMatchListener(
          joinCode.value,
          updater,
          accessDenied,
        );
      },
    );
  } else {
    isJoining.value = false;
  }
}

function joinCodeInput() {
  joinCode.value = joinCode.value.toUpperCase();
  if (joinCodeRules.validJoinCode(joinCode.value) !== "Invalid Join Code") {
    joinCodeValid.value = true;
  } else {
    joinCodeValid.value = false;
  }
}

function checkIfRequestStillExists(
  requests: PlayerRequest[],
  current: PlayerRequest,
): boolean {
  if (requests == null || requests == undefined) {
    return false;
  }
  let output = false;
  requests.forEach((value: PlayerRequest) => {
    if (current.id === value.id) {
      output = true;
    }
  });
  return output;
}
</script>

<style scoped lang="scss">
.logo {
  margin: auto;
  padding-bottom: 16px;
}

.online-view-center {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  width: 100%;
}

.online-view-overlay {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  width: 600px;
}

.online-view-text-input {
  font-size: 28px;
}
</style>
