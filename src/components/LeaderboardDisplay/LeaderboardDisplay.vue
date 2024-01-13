<template>
  <v-card title="Leaderboard" min-height="100%" min-width="100%">
    <v-list>
      <v-list-item
        v-for="scoreDisplay in scoreDisplayArray"
        v-bind:key="'score_' + scoreDisplay.playerId"
      >
        <template v-slot:append>
          {{ scoreDisplay.score }}
        </template>
        {{ scoreDisplay.playerName }}
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup lang="ts">
import { VCard, VList, VListItem } from "vuetify/lib/components/index.mjs";
import { PropType } from "vue";
import { ScoreDisplay } from "./LeaderboardInterfaces";

const props = defineProps({
  scoreDisplayArray: {
    type: Array as PropType<ScoreDisplay[]>,
    required: true,
  },
});
</script>

<style scoped lang="scss"></style>
