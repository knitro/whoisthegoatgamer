<template>
  <v-card
    title="Chat"
    class="overflow-y-auto"
    max-height="400px"
    subtitle="TBD"
  >
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
