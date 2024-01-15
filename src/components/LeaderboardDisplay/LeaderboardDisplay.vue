<template>
  <v-card
    title="Leaderboard"
    subtitle="First to 10"
    class="overflow-y-auto"
    max-height="400px"
  >
    <v-list>
      <v-list-item
        v-for="(scoreDisplay, index) in scoreDisplayArray"
        v-bind:key="'score_' + scoreDisplay.playerId"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1" class="margin-right-8">
            <v-img
              :src="'https://robohash.org/' + scoreDisplay.playerId + '.png'"
            />
          </v-avatar>
          <v-icon :icon="getIcon(index)" :color="getColour(index)"></v-icon>
        </template>
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

function getIcon(index: number) {
  switch (index) {
    case 0:
      return "mdi-trophy";
    case 1:
      return "mdi-medal";
    case 2:
      return "mdi-medal-outline";
    default:
      return "mdi-account";
  }
}

function getColour(index: number) {
  switch (index) {
    case 0:
      return "#FFD700";
    case 1:
      return "#C0C0C0";
    case 2:
      return "#CD7F32";
    default:
      return "#000000";
  }
}
</script>

<style scoped lang="scss">
.margin-right-8 {
  margin-right: 8px;
}
</style>
