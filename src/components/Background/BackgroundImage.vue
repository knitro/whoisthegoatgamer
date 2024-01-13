<template>
  <div class="background" :style="headerStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { CSSProperties, ref } from "vue";

const props = defineProps({
  src: {
    type: String, // Image pass through must be "imported".
    // Eg. import distanceLandImageUrl from "@/assets/images/distance-land.png";
    required: true,
  },
});

const headerStyle: CSSProperties = {
  backgroundImage: "url(" + props.src + ")",
};
</script>

<style scoped lang="scss">
.background {
  min-width: 100vw;
  min-height: 100vh;
  background-size: cover;
}
</style>
