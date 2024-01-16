<template>
  <v-card class="goat-card">
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
import { PropType, onMounted, ref } from "vue";
import { GameHistory, Player } from "@/firebase/database/database-interfaces";
import { LeaderboardScore, calculateScore } from "@/logic/LeaderboardLogic";

const props = defineProps({
  playerList: {
    type: Array as PropType<Player[]>,
    required: true,
  },
  gameHistory: {
    type: Array as PropType<GameHistory[]>,
    required: true,
  },
  pointsToWin: {
    type: Number,
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
});

const topPlayer = ref<LeaderboardScore>();

onMounted(async () => {
  const leaderboard = await calculateScore(
    props.playerList,
    props.gameHistory,
    props.pointsToWin,
    props.matchId,
  );
  if (leaderboard.length > 0) {
    topPlayer.value = leaderboard[0];
  }
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
</style>
