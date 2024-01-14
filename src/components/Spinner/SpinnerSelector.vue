<template>
  <div>
    <div class="spinner-container">
      <div
        class="wheel"
        :style="{
          height: spinnerWidth + 'px',
          width: spinnerWidth + 'px',
          transition: wheelStyleSpeed,
          transform: wheelStyleRotation,
        }"
      >
        <div
          v-for="(item, index) in items"
          v-bind:key="item.label + '-' + index"
          class="spinner-option"
          :style="
            'transform: rotate(' +
            (360 * index) / items.length +
            'deg);' +
            'background: ' +
            stringToColour(item.label).backgroundColour
          "
        >
          <span
            class="label"
            :style="'transform: rotate(' + 360 / items.length + 'deg)'"
          >
            {{ item.label + index }}
          </span>
        </div>
      </div>
      <div
        class="pointer"
        :style="{
          height: spinnerWidth + 'px',
          width: spinnerWidth + 'px',
        }"
      ></div>
    </div>
    <v-btn
      block
      x-large
      color="deep-purple"
      dark
      @click="pickRandomItem"
      class="spinner-selector-random-button"
      :min-height="70"
      :max-height="70"
      v-show="state == 0"
      :disabled="items.length <= 1"
    >
      Pick a Random Map
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { PropType, ref } from "vue";
import { SpinnerItem } from "./SpinnerInterfaces";
import { stringToColour } from "@/logic/string-to-colour";

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
const wheelStyleRotation = ref("");
const wheelStyleSpeed = ref("");
const spinnerWidth = ref(500);

// const spinnerContainer = ref(null);

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
    reset();
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

// function resizeSpinner() {
//   const { width, height } = useElementSize(button.valu);
//   spinnerWidth.value = width.value;
//   console.log(spinnerWidth.value);
// }

// onMounted(() => {
//   window.addEventListener("resize", resizeSpinner);
//   resizeSpinner();
// });

// onUnmounted(() => {
//   window.removeEventListener("resize", resizeSpinner);
// });
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

.spinner-option .label {
  position: relative;
}

.spinner-option {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: bottom right;
  display: flex;
  justify-content: center;
  clip-path: polygon(
    0 0,
    54% 0,
    100% 100%,
    0 54%
  ); // See https://bennettfeely.com/clippy/
  align-items: center;
  user-select: none;
  cursor: pointer;
}
</style>
