<template>
  <div>
    <v-card class="scroller-container">
      <ConfettiExplosion
        v-if="doConfetti"
        :particleCount="200"
        :force="0.3"
        :duration="3000"
      />
      <v-card
        class="scroller-item"
        :style="
          'background: ' +
          stringToColour(selectedItem ? selectedItem.label : 'Random Game')
            .backgroundColour
        "
      >
        <span class="text">
          {{ selectedItem ? selectedItem.label : "Random Game" }}
        </span>
      </v-card>
    </v-card>

    <v-btn
      block
      x-large
      color="green"
      dark
      @click="pickRandomItem"
      class="spinner-selector-random-button"
      :min-height="70"
      :max-height="70"
      v-show="state == 0"
      :disabled="items.length <= 1"
    >
      Roll a Random Game
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { SpinnerItem } from "./SpinnerInterfaces";
import { stringToColour } from "@/logic/string-to-colour";
import ConfettiExplosion from "vue-confetti-explosion";

const props = defineProps({
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
const doConfetti = ref(false);

//Spinner Variables
const MIN_LOOPS = 4; // Minimum number of loops before stopping
const MAX_ADDED_LOOPS = 6; // Maximum number additional loops before stopping
const CHANGE_DELAY = 1000; // The maximum time between roll changes

function pickRandomItem() {
  if (state.value == State.ROLLING) {
    return;
  }
  state.value = State.ROLLING;

  // Ignore if the number of selected items is less than 2 (no need for random)
  if (props.items.length < 2) {
    return;
  }

  // Perform Rolling Animation
  const numOfLoops = Math.floor(Math.random() * MAX_ADDED_LOOPS) + MIN_LOOPS;

  // Generate the Random Index Selection (excluding deselected items)
  const numOfItems = props.items.length;
  const randomNumber = Math.floor(Math.random() * numOfItems);

  const numberOfChangesLeft = numOfLoops * numOfItems + randomNumber;

  // Create Roll Timeout Function and Execute
  const roll = (numberOfChangesLeft: number, index: number) => {
    // Select Corresponding Index to Highlight
    const selectedIndex = index < numOfItems ? index : 0;
    selectedItem.value = props.items[selectedIndex];

    // Slow Down Cycle Speed in relation to the number of cycles left
    const changeSpeed = CHANGE_DELAY / numberOfChangesLeft; // Reciprocal Function

    if (numberOfChangesLeft > 0) {
      setTimeout(roll, changeSpeed, numberOfChangesLeft - 1, selectedIndex + 1);
    } else {
      // Rolling has Finished
      state.value = State.FINISHED_ROLLING;
      displaySelectedAnimation();
    }
  };
  roll(numberOfChangesLeft, 0);
}

function displaySelectedAnimation() {
  const animationRun = () => {
    state.value = State.DISPLAY_RESULT;
    doConfetti.value = false;
    if (selectedItem.value == null) {
      console.log("ERROR");
      return;
    }
    props.setterFunction(selectedItem.value);
  };
  doConfetti.value = true;
  setTimeout(animationRun, 2000);
}
</script>

<style scoped lang="scss">
.scroller-container {
  border: 2px solid #333;
  height: 200px;
  margin-bottom: 16px;

  .scroller-item {
    height: 200px;
    line-height: 200px;
    text-align: center;
    span.text {
      display: inline-block;
      vertical-align: middle;
      line-height: normal;
      font-size: 36px;
    }
  }
}
</style>
