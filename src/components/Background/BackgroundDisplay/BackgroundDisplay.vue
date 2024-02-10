<template>
  <div>
    <SolidColour class="parallelogram-left"></SolidColour>
    <FloatingShapes class="parallelogram-right"></FloatingShapes>
    <slot />
  </div>
</template>

<script setup lang="ts">
import SolidColour from "./SolidColour.vue";
import FloatingShapes from "./FloatingShapes.vue";
</script>

<style scoped lang="scss">
.parallelogram-left {
  position: absolute;
  width: 60vw;
  height: 100vh;
  animation: slide-in-and-skew-left 2s forwards;
}

.parallelogram-right {
  position: absolute;
  width: 80vw;
  height: 100vh;
  animation: slide-in-and-skew-right 2s forwards;
}

@keyframes slide-in-and-skew-left {
  0% {
    transform: translateX(-60vw);
  }

  100% {
    transform: translateX(-20vw) skew(-18deg);
  }
}

@keyframes slide-in-and-skew-right {
  0% {
    transform: translateX(160vw);
  }

  100% {
    transform: translateX(39vw) skew(-18deg);
  }
}
</style>
