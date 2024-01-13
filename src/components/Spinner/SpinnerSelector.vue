<template>
  <div>
    <v-container>
      <v-row>
        <div class="spinner-container">
          <div
            class="wheel"
            :style="{
              height: height + 'px',
              width: width + 'px',
              transition: wheelStyleSpeed,
              transform: wheelStyleRotation,
            }"
          >
            <spinner-option
              v-for="(item, index) in items"
              v-bind:key="item.label + '-' + index"
              :label="item.label + index"
              :isSelected="false"
              :index="index"
              :numOfItems="items.length"
            ></spinner-option>
          </div>
          <div
            class="pointer"
            :style="{
              height: height + 'px',
              width: width + 'px',
            }"
          ></div>
        </div>
      </v-row>
      <v-row>
        <v-btn
          x-large
          color="deep-purple"
          dark
          @click="pickRandomItem"
          class="spinner-selector-random-button"
          :min-height="70"
          :max-height="70"
          :min-width="600"
          :max-width="600"
          v-show="state == 0"
          :disabled="items.length <= 1"
        >
          Pick a Random Map
        </v-btn>
        <v-btn
          x-large
          color="deep-purple"
          dark
          @click="reset"
          class="spinner-selector-random-button"
          :min-height="70"
          :max-height="70"
          :min-width="600"
          :max-width="600"
          v-show="state == State.DISPLAY_RESULT"
        >
          Re-Roll
        </v-btn>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { SpinnerItem } from "./SpinnerInterfaces";
import SpinnerOption from "./SpinnerOption.vue";
import { GameEntry } from "@/firebase/database/database-interfaces";

const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  items: {
    type: Array as PropType<SpinnerItem[]>,
    default: () => [], // use a factory function
  },
  setterFunction: {
    type: Function as PropType<(game: SpinnerItem) => void>,
    required: true,
  },
});

enum State {
  STAND_BY,
  ROLLING,
  FINISHED_ROLLING,
  DISPLAY_RESULT,
}

const selectedItem = ref<SpinnerItem | null>(null);
const state = ref<State>(State.STAND_BY);
const wheelStyleRotation = ref("");
const wheelStyleSpeed = ref("");

//Spinner Variables

function pickRandomItem() {
  if (state.value == State.ROLLING) {
    return;
  }
  state.value = State.ROLLING;

  const maxValue = props.items.length;
  const randomNumber = Math.floor(Math.random() * maxValue); // Number of rotations
  let selectedIndex = maxValue - randomNumber;
  if (selectedIndex == maxValue) {
    selectedIndex = 0;
  }

  const minimumCycleLoops = 4;
  const rotationAmount =
    360 * minimumCycleLoops + (360 * randomNumber) / maxValue;
  const time = 4;

  wheelStyleSpeed.value = "transform " + time + "s ease-in-out";
  wheelStyleRotation.value = "rotate( " + rotationAmount + "deg)";

  const displayResultCallback = () => {
    if (selectedItem.value == null) {
      console.log("ERROR: Selected Item is null");
      return;
    }
    state.value = State.DISPLAY_RESULT;
    props.setterFunction(selectedItem.value);
  };

  const finishedRollingCallback = (selectedIndex: number) => {
    state.value = State.FINISHED_ROLLING;
    selectedItem.value = props.items[selectedIndex];
    const delayBeforeResultDisplay = 2000; // in ms
    setTimeout(displayResultCallback, delayBeforeResultDisplay);
  };
  setTimeout(finishedRollingCallback, time * 1000, selectedIndex);

  console.log(selectedIndex);
}

function reset() {
  state.value = State.STAND_BY;
  wheelStyleRotation.value = "rotate(0deg)";
}

console.log(props.items);
</script>

<style scoped lang="scss">
.spinner-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner-container .wheel {
  position: relative;
  top: 0;
  left: 0;
  border-radius: 50%;
  overflow: hidden;
  background: #333;
  box-shadow: 0 0 0 5px orange 0 0 15px greenyellow 0 0 0 18px purple;
}

.spinner-container .pointer {
  position: absolute;
  clip-path: polygon(0 0, 3% 0, 17% 17%, 0 3%);

  background: red;
}
</style>
./SpinnerInterfaces
