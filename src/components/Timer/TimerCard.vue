<template>
  <v-card title="Timer" class="curved-border">
    <div class="timer-label">{{ timeLabel }}</div>
    <v-card-actions>
      <v-btn
        v-for="adjustmentAmount in timerAdjustments"
        height="40"
        variant="text"
        width="40"
        @click="adjustTimer(adjustmentAmount)"
        :disabled="!isHost || !isPaused"
      >
        {{ adjustmentAmount > 0 ? "+" + adjustmentAmount : adjustmentAmount }}
      </v-btn>
      <v-btn
        v-if="isPaused"
        class="button-padding"
        prepend-icon="mdi-play"
        height="40"
        color="green"
        variant="flat"
        rounded
        @click="startButtonPress()"
        :disabled="!isHost"
      >
        Start
      </v-btn>
      <v-btn
        v-if="!isPaused"
        class="button-padding"
        prepend-icon="mdi-pause"
        height="40"
        color="red"
        variant="flat"
        rounded
        @click="pauseButtonPress()"
        :disabled="!isHost"
      >
        Pause
      </v-btn>
      <v-btn
        v-if="isPaused"
        class="button-padding"
        prepend-icon="mdi-restart"
        height="40"
        color="orange"
        variant="flat"
        rounded
        @click="resetTimer()"
        :disabled="!isHost"
      >
        Reset
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  matchId: {
    type: String,
    required: true,
  },
  isHost: {
    type: Boolean,
    required: true,
  },
});

const timeRef = ref(0);
const timeLabel = ref("00:00");
const isPaused = ref(true);

const timerAdjustments = [-5, -1, 1, 5];

function startButtonPress() {
  startCountdown();
}

function pauseButtonPress() {
  isPaused.value = true;
}

function resetTimer() {
  isPaused.value = true;
  timeLabel.value = "00:00";
  timeRef.value = 0;
}

function adjustTimer(minutesToAdjust: number) {
  const msToAdjust = minutesToAdjust * 60 * 1000; // min * sec * ms
  timeRef.value += msToAdjust;
  setTimerLabel();
}

function startCountdown() {
  isPaused.value = false;
  const interval = 100; // ms
  let expected = Date.now() + interval;
  setTimeout(step, interval);

  // Supporting Functions

  function step() {
    var dt = Date.now() - expected; // the Drift (positive for overshooting)
    if (dt > interval) {
      // Lots of Drift (eg. tab was inactive and timer did not count down) => Recover Time
      timeRef.value -= dt;
      expected += dt;
    } else {
      // Decrement time as normal
      expected += interval;
      timeRef.value -= interval;
    }
    setTimerLabel();

    // Check if timer is finished or paused
    if (timeRef.value <= 0) {
      resetTimer(); // We can reset as a finished timer looks the same as a reset timer.
    } else if (isPaused.value) {
      // Do nothing
    } else {
      const timeoutAmount = Math.max(0, interval - dt); // This takes into account any drift that may have happened
      setTimeout(step, timeoutAmount);
    }
  }
}

function setTimerLabel() {
  const timeInSeconds = Math.floor(timeRef.value / 1000);
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds % 60;

  function createTimeLabel(time: number) {
    if (time == 0) {
      return "00";
    }
    return time < 10 ? "0" + time : time + "";
  }

  const minutesLabel = createTimeLabel(minutes);
  const secondsLabel = createTimeLabel(seconds);

  timeLabel.value = minutesLabel + ":" + secondsLabel;
}
</script>

<style scoped lang="scss">
.timer-label {
  font-size: 80px;
  text-align: center;
}

.curved-border {
  border-radius: 16px;
}

.button-padding {
  padding-left: 16px;
  padding-right: 16px;
}
</style>
