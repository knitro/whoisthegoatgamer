<template>
  <v-card title="Game List" subtitle="Secondary Text" class="overflow-y-auto">
    <v-list max-height="600px">
      <v-list-item v-for="game in gameList" v-bind:key="'game_' + game">
        {{ game.name }}
        <template v-slot:append>
          <v-btn
            v-if="!isDisabled"
            @click="removeGameListOnlineMatch(code, game.id)"
            variant="text"
            color="red"
            icon="mdi-delete"
          ></v-btn>
        </template>
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
        @keydown.enter="addGame"
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
import {
  addGameListOnlineMatch,
  removeGameListOnlineMatch,
} from "@/firebase/database/database-match";
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
