<template>
  <v-card title="Chat" subtitle="TBD" min-height="100%" min-width="100%">
    <!-- <v-list>
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
      ></v-text-field>
    </v-card-actions> -->
  </v-card>
</template>

<script setup lang="ts">
import { VCard } from "vuetify/lib/components/index.mjs";
import { PropType, ref } from "vue";
import { addGameListOnlineMatch } from "@/firebase/database/database-match";
import { ChatLog } from "@/firebase/database/database-interfaces";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  chatLogs: {
    type: Array as PropType<ChatLog[]>,
    required: true,
  },
});

const gameEntry = ref("");

function clearTextField() {
  gameEntry.value = "";
}

async function addGame() {
  const nameOfGame = gameEntry.value;
  gameEntry.value = "";
  await addGameListOnlineMatch(props.code, nameOfGame);
}
</script>

<style scoped lang="scss"></style>
