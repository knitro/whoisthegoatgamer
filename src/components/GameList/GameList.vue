<template>
  <v-card
    title="Game List"
    subtitle="Secondary Text"
    min-height="100%"
    min-width="100%"
  >
    <v-list>
      <v-list-item v-for="gameName in gameList" v-bind:key="'game_' + gameName">
        {{ gameName.name }}
      </v-list-item>
    </v-list>
    <v-card-actions>
      <v-text-field
        v-model="gameEntry"
        append-icon="mdi-send"
        variant="filled"
        clear-icon="mdi-close-circle"
        clearable
        label="Add Game"
        type="text"
        @click:append="addGame"
        @click:clear="clearTextField"
        :disabled="isDisabled"
      ></v-text-field>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import {
  VCard,
  VList,
  VCardActions,
  VTextField,
  VListItem,
} from "vuetify/lib/components/index.mjs";
import { PropType, ref } from "vue";
import { addGameListOnlineMatch } from "@/firebase/database/database-match";
import { GameEntry } from "@/firebase/database/database-interfaces";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  gameList: {
    type: Array as PropType<GameEntry[]>,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    required: true,
  },
});

console.log(props.gameList);
const gameEntry = ref("");

function clearTextField() {
  gameEntry.value = "";
}

async function addGame() {
  const nameOfGame = gameEntry.value;
  gameEntry.value = "";

  if (nameOfGame == "") {
    return;
  }
  await addGameListOnlineMatch(props.code, nameOfGame);
}
</script>

<style scoped lang="scss"></style>
