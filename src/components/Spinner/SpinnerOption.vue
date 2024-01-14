<template></template>

<script setup lang="ts">
import { stringToColour } from "../../logic/string-to-colour";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  isSelected: {
    type: Boolean,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  numOfItems: {
    type: Number,
    required: true,
  },
});

const rotationFactor = 360 / props.numOfItems;
const itemRotation = rotationFactor * props.index;
const colours = stringToColour(props.label);
</script>

<style scoped lang="scss">
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
