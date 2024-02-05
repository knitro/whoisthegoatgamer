<template>
  <div>
    <background-image :src="backgroundImage">
      <app-bar-goat-gamer title="Home"></app-bar-goat-gamer>
      <v-container fluid class="online-view-center">
        <v-row align-content="center" justify="center">
          <v-col cols="8">
            <v-text-field
              :autofocus="true"
              v-model="playerName"
              outlined
              height="100"
              class="online-view-text-input"
              label="Player Name"
              hint="This will be seen by your opponent to confirm that they have the right opponent."
              counter="20"
              :rules="[joinCodeRules.required, joinCodeRules.teamNameCount]"
              color="white"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-row align-content="center" justify="center">
          <v-col cols="4">
            <v-card color="rgb(206, 121, 107)" dark>
              <v-card-title class="text-h5">Create</v-card-title>

              <v-card-subtitle> Game Settings </v-card-subtitle>

              <v-container fluid>
                <v-row>
                  <v-col cols="12">
                    <v-select
                      v-model="preset"
                      label="Presets"
                      :items="
                        Object.keys(GameTags).map((key) => {
                          return {
                            title: GameTags[key as keyof typeof GameTags],
                            value: GameTags[key as keyof typeof GameTags],
                          };
                        })
                      "
                      chips
                      multiple
                    ></v-select>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="pointsToWin"
                      :rules="[
                        joinCodeRules.required,
                        joinCodeRules.numbersOnly,
                      ]"
                      label="Points Required to Finish"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field
                      v-model.number="numberOfVetos"
                      :rules="[
                        joinCodeRules.required,
                        joinCodeRules.numbersOnly,
                      ]"
                      label="Number of Vetos per Player"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>

              <v-card-actions>
                <v-btn
                  variant="text"
                  @click="createButtonPress"
                  :loading="isCreating"
                >
                  Create Game
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card color="rgb(206, 121, 107)" dark>
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
              <v-card-actions>
                <v-btn
                  variant="text"
                  @disabled="joinCodeValid"
                  @click="joinButtonPress"
                  :loading="isJoining"
                >
                  Join Game
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <v-overlay :z-index="0" v-model="showJoinLoadingOverlay" persistent>
        <v-card loading class="online-view-overlay">
          <v-img :src="waitingImage"></v-img>
          <v-card-title>Waiting to Join Game...</v-card-title>

          <v-card-text>
            You have requested to join <b>{{ opponentsName }}</b
            >'s game. Please wait as they choose to either accept or decline
            your request.
          </v-card-text>
        </v-card>
      </v-overlay>
    </background-image>
  </div>
</template>

<script setup lang="ts">
import {
  createOnlineMatch,
  getOnlineMatchListener,
} from "@/firebase/database/database";
import { auth } from "@/firebase/firebase";
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
import BackgroundImage from "@/components/Background/BackgroundImage.vue";
import waitingImage from "@/assets/images/outside.png";
import backgroundImage from "@/assets/backgrounds/range-outside.png";
import {
  Match,
  Player,
  PlayerRequest,
} from "@/firebase/database/database-interfaces";
import {
  VContainer,
  VRow,
  VCol,
  VTextField,
  VCard,
  VCardTitle,
  VCardSubtitle,
  VCardText,
  VCardActions,
  VBtn,
  VOverlay,
  VImg,
} from "vuetify/lib/components/index.mjs";
import { requestJoinMatch } from "@/firebase/database/database-request";
import { GameTags } from "@/common/enums";

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
.online-view-center {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
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
