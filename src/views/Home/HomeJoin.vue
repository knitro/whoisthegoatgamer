<template>
  <div>
    <v-row align-content="center" justify="center">
      <v-col cols="10" md="8" lg="6">
        <v-text-field
          :autofocus="true"
          v-model="playerName"
          outlined
          height="100"
          class="online-view-text-input"
          label="Enter your Display Name"
          hint="This will be seen by your opponent to confirm that they have the right opponent."
          counter="20"
          :rules="[joinCodeRules.required, joinCodeRules.teamNameCount]"
          color="white"
          @input="nameInput"
        >
        </v-text-field>
      </v-col>
    </v-row>
    <v-row align-content="center" justify="center">
      <v-col cols="10" md="6" lg="4">
        <v-card color="rgb(206, 121, 107)" dark class="join-code-card">
          <v-card-title class="text-h5">Join</v-card-title>
          <v-card-subtitle>
            Enter the code that the opponent has sent you
          </v-card-subtitle>
          <v-card-text>
            <v-text-field
              v-model="joinCode"
              outlined
              label="Join Code"
              @input="joinCodeInput"
              maxlength="5"
              :rules="[joinCodeRules.required, joinCodeRules.validJoinCode]"
            >
            </v-text-field
          ></v-card-text>
        </v-card>
      </v-col>
      <v-col cols="10" md="4">
        <GoButton
          :imageBackground="goButtonBackground"
          :imageForeground="goButtonForeground"
          header="Join Game"
          :subheader="
            joinCode != '' ? 'Request to join: ' + joinCode : 'Enter Code'
          "
          :clickFunction="joinButtonPress"
          :isDisabled="!(joinCodeValid && nameValid)"
        ></GoButton>
      </v-col>
    </v-row>
    <v-overlay :z-index="0" v-model="showJoinLoadingOverlay" persistent>
      <v-card loading class="online-view-overlay">
        <v-img :src="waitingImage"></v-img>
        <v-card-title>Waiting to Join Game...</v-card-title>

        <v-card-text>
          You have requested to join <b>{{ opponentsName }}</b
          >'s game. Please wait as they choose to either accept or decline your
          request.
        </v-card-text>
      </v-card>
    </v-overlay>
  </div>
</template>

<script setup lang="ts">
import { getOnlineMatchListener } from "@/firebase/database/database";
import { auth } from "@/firebase/firebase";
import { ref } from "vue";
import { useRouter } from "vue-router";
import waitingImage from "@/assets/images/outside.png";
import {
  Match,
  Player,
  PlayerRequest,
} from "@/firebase/database/database-interfaces";
import {
  VRow,
  VCol,
  VTextField,
  VCard,
  VCardTitle,
  VCardSubtitle,
  VCardText,
  VOverlay,
  VImg,
} from "vuetify/lib/components/index.mjs";
import { requestJoinMatch } from "@/firebase/database/database-request";
import GoButton from "./GoButton.vue";
import goButtonBackground from "@/assets/home/go-button-background.png";
import goButtonForeground from "@/assets/home/go-button-foreground.png";

const router = useRouter();

const playerName = ref(localStorage.getItem("playerName") ?? "");
const nameValid = ref(checkNameValidity());
const joinCode = ref("");
const joinCodeValid = ref(false);

const isJoining = ref(false);
const showJoinLoadingOverlay = ref(false);
const opponentsName = ref("");

const joinCodeRules = {
  required: (value: string) => !!value || "Required.",
  validJoinCode: (value: string) => {
    const pattern = /[A-Z][A-Z][0-9][0-9][0-9]/;
    return pattern.test(value) || "Invalid Join Code";
  },
  teamNameCount: (value: string) => value.length <= 20 || "Max 20 characters",
  numbersOnly: (value: string) => !Number.isNaN(Number.parseFloat(value)),
};

function joinButtonPress() {
  isJoining.value = true;
  const cleanedPlayerName = playerName.value.trim();
  localStorage.setItem("playerName", cleanedPlayerName);
  if (joinCodeValid.value && nameValid.value) {
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

function nameInput() {
  if (checkNameValidity()) {
    nameValid.value = true;
  } else {
    nameValid.value = false;
  }
}

function checkNameValidity() {
  const cleanedPlayerName = playerName.value.trim();
  if (cleanedPlayerName.length <= 20 && cleanedPlayerName.length > 0) {
    console.log(
      cleanedPlayerName,
      "True",
      "joinCodeValid",
      joinCodeValid.value,
    );
    return true;
  }
  return false;
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
.join-code-card {
  border-radius: 16px;
}
</style>
