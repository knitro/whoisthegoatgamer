<template>
  <v-card class="goat-card curved-border">
    <span class="name">
      <v-icon icon="mdi-trophy"></v-icon>
      {{ topPlayer ? topPlayer.playerName : "ERROR" }}
      <v-icon icon="mdi-trophy"></v-icon>
    </span>
    <br />
    <span class="underlabel">is the GOAT Gamer</span>
  </v-card>
</template>

<script setup lang="ts">
import { VCard } from "vuetify/lib/components/index.mjs";
import { PropType } from "vue";
import { LeaderboardScore } from "@/logic/LeaderboardLogic";

const props = defineProps({
  topPlayer: {
    type: Object as PropType<LeaderboardScore>,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.margin-right-8 {
  margin-right: 8px;
}
</style>

<style scoped lang="scss">
.margin-right-8 {
  margin-right: 8px;
}

.goat-card {
  height: 200px;
  line-height: 100px;
  text-align: center;
  .name {
    font-size: 72px;
  }
  .underlabel {
    font-size: 18px;
  }
}

.curved-border {
  border-radius: 16px;
}
</style>
