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
          label="Enter your Name"
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
        <v-card color="rgba(248, 181, 170, 0.95)" class="create-card">
          <v-card-title class="text-h6"> Tournament Structure </v-card-title>
          <v-container fluid>
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="gameType"
                  label="Game Type"
                  hint="Determine the type of competition you want"
                  persistent-hint
                  :items="
                    Object.keys(GameType).map((key) => {
                      return {
                        title: GameType[key as keyof typeof GameType],
                        value: GameType[key as keyof typeof GameType],
                      };
                    })
                  "
                  disabled
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="preset"
                  label="Preset"
                  :items="
                    Object.keys(GamePreset).map((key) => {
                      return {
                        title: GamePreset[key as keyof typeof GamePreset],
                        value: GamePreset[key as keyof typeof GamePreset],
                      };
                    })
                  "
                  hint="Pick a preset to get started quickly"
                  persistent-hint
                  disabled
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="gameTags"
                  label="Tags"
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
                  hint="Customise your games list quickly with tags. You can still always add games during the tournament."
                  persistent-hint
                ></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="10" md="6" lg="4">
        <v-card color="rgba(248, 181, 170, 0.95)" dark class="create-card">
          <v-card-title class="text-h6">Tournament Settings</v-card-title>
          <v-container fluid>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="pointsToWin"
                  :rules="[joinCodeRules.required, joinCodeRules.numbersOnly]"
                  label="Points Required to Win"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="numberOfVetos"
                  :rules="[joinCodeRules.required, joinCodeRules.numbersOnly]"
                  label="Vetos per Player"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="10" md="4" lg="4">
        <GoButton
          :imageBackground="goButtonBackground"
          :imageForeground="goButtonForeground"
          header="Create Game"
          subheader=""
          :clickFunction="createButtonPress"
          :isDisabled="false"
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
import { createOnlineMatch } from "@/firebase/database/database";
import { ref } from "vue";
import { useRouter } from "vue-router";
import waitingImage from "@/assets/images/outside.png";
import { PlayerRequest } from "@/firebase/database/database-interfaces";
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
import { GameTags, GameType, GamePreset } from "@/common/enums";
import GoButton from "./GoButton.vue";
import goButtonBackground from "@/assets/home/go-button-background.png";
import goButtonForeground from "@/assets/home/go-button-foreground.png";

const router = useRouter();

const playerName = ref(localStorage.getItem("playerName") ?? "");
const nameValid = ref(checkNameValidity());

const isCreating = ref(false);
const showJoinLoadingOverlay = ref(false);
const opponentsName = ref("");

// Game Settings
const gameType = ref<GameType>(GameType.RANDOM);
const preset = ref<GamePreset>(GamePreset.NONE);
const gameTags = ref<GameTags[]>([]);
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
        gameTags.value,
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
    localStorage.setItem("playerName", cleanedPlayerName);
    return true;
  }
  return false;
}
</script>

<style scoped lang="scss">
.create-card {
  border-radius: 16px;
}
</style>
