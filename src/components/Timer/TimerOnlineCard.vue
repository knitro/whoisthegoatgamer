<template>
  <v-card title="Timer" class="curved-border">
    <div class="timer-label">{{ timeLabel }}</div>
    <v-card-actions v-if="isHost" class="centering">
      <v-btn
        v-show="timerInfoRef.isPaused && !isEditTime"
        class="button-padding"
        prepend-icon="mdi-timer-edit-outline"
        height="40"
        color="cyan-darken-1"
        variant="flat"
        rounded
        @click="editButtonPress"
      >
        Edit Timer
      </v-btn>
      <v-btn
        v-show="isEditTime"
        class="button-padding"
        prepend-icon="mdi-timer-edit-outline"
        height="40"
        color="cyan-darken-1"
        variant="flat"
        rounded
        @click="confirmEditButtonPress"
      >
        Set Time
      </v-btn>

      <v-btn
        v-show="timerInfoRef.isPaused && isEditTime"
        v-for="adjustmentAmount in timerAdjustments"
        height="40"
        variant="flat"
        rounded
        @click="adjustTimer(adjustmentAmount)"
        :color="adjustmentAmount > 0 ? 'green-lighten-1' : 'red-lighten-1'"
        :disabled="!isHost || !timerInfoRef.isPaused"
      >
        {{ adjustmentAmount > 0 ? "+" + adjustmentAmount : adjustmentAmount }}
      </v-btn>

      <v-btn
        v-show="timerInfoRef.isPaused && !isEditTime"
        class="button-padding"
        prepend-icon="mdi-play"
        height="40"
        color="green"
        variant="flat"
        rounded
        @click="startButtonPress()"
      >
        Start
      </v-btn>
      <v-btn
        v-show="!timerInfoRef.isPaused && !isEditTime"
        class="button-padding"
        prepend-icon="mdi-pause"
        height="40"
        color="red"
        variant="flat"
        rounded
        @click="pauseButtonPress()"
      >
        Pause
      </v-btn>
      <v-btn
        v-show="timerInfoRef.isPaused && !isEditTime"
        class="button-padding"
        prepend-icon="mdi-restart"
        height="40"
        color="orange-darken-1"
        variant="flat"
        rounded
        @click="resetTimer()"
      >
        Reset
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { TimerInfo } from "@/firebase/database/database-interfaces";
import {
  getTimerInfoListener,
  pauseTimer,
  startTimer,
  updateTimer,
} from "@/firebase/database/database-timer";
import { registerRuntimeCompiler } from "vue";
import { onUnmounted } from "vue";
import { onMounted, ref } from "vue";

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

const timerInfoRef = ref<TimerInfo>({ timeLeft: 0, isPaused: true });
const unsubscribeFunction = ref<() => void>(() => {});
const timeRef = ref(0); // Tracking time updates locally
const timeLabel = ref("00:00"); // Display of this time ref
const isEditTime = ref(false);
const isCountingDown = ref(false);

async function getTimerInfo() {
  const updater = (a: TimerInfo) => {
    timerInfoRef.value = a;

    if (a.isPaused) {
      // Check for pause timer
      isCountingDown.value = false;
      setTimerLabel(a.timeLeft);
      return;
    }

    // Account for drift if the timer has not started yet
    if (a.startTime && !isCountingDown.value) {
      const timeDrift = Date.now() - a.startTime; // Amount of time that should have been lost
      const updatedTime = a.timeLeft - timeDrift;
      timeRef.value = updatedTime;
    }

    // Ensure countdown is happening if not paused
    if (!isCountingDown.value) {
      startCountdown();
    }
  };

  const accessDenied = () => {
    console.log("Access Denied to Timer");
  };

  unsubscribeFunction.value = await getTimerInfoListener(
    props.matchId,
    updater,
    accessDenied,
  );
}

const timerAdjustments = [-5, -1, 1, 5];

function editButtonPress() {
  isEditTime.value = true;
}

async function confirmEditButtonPress() {
  await updateTimer(props.matchId, timeRef.value);
  isEditTime.value = false;
}

async function startButtonPress() {
  await startTimer(props.matchId);
}

async function pauseButtonPress() {
  await pauseTimer(props.matchId, timeRef.value);
  setTimerLabel();
}

async function resetTimer() {
  await pauseTimer(props.matchId, 0);
  setTimerLabel();
}

function adjustTimer(minutesToAdjust: number) {
  const msToAdjust = minutesToAdjust * 60 * 1000; // min * sec * ms
  timeRef.value += msToAdjust;
  setTimerLabel();
}

async function startCountdown() {
  if (timerInfoRef.value.startTime == null) {
    // Cannot start timer if startTime DNE
    return;
  }
  if (isCountingDown.value) {
    // Avoid double countdowns
    return;
  }
  if (timeRef.value <= 0) {
    // Cannot time below 0 seconds
    return;
  }
  isCountingDown.value = true;

  const interval = 100; // ms
  let expected = Date.now() + interval;
  setTimeout(step, interval);

  // Supporting Functions

  function step() {
    // Check if timer is finished or paused
    if (timeRef.value <= 0) {
      isCountingDown.value = false;
      return;
    } else if (timerInfoRef.value.isPaused) {
      isCountingDown.value = false;
      return;
    }

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
    const timeoutAmount = Math.max(0, interval - dt); // This takes into account any drift that may have happened
    setTimeout(step, timeoutAmount);
  }
}

function setTimerLabel(timeLeft?: number) {
  const timeToDisplay = timeLeft ? timeLeft : timeRef.value;

  const timeInSeconds = Math.floor(timeToDisplay / 1000);
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

  const updatedTimeLabel = minutesLabel + ":" + secondsLabel;
  timeLabel.value = updatedTimeLabel;
}

onMounted(() => {
  getTimerInfo();
});

onUnmounted(() => {
  unsubscribeFunction.value();
});
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

.centering {
  align-items: center;
  justify-content: center;
}
</style>
