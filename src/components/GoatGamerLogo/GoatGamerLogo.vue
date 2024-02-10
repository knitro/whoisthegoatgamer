<template>
  <div id="container">
    <v-img id="logo" :src="logoLarge" max-height="200"></v-img>
    <div id="text-parent">
      <div id="text-1">Who is the</div>
      <div id="text-2">Goat Gamer</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoLarge from "@/assets/logo/large-logo.png";
</script>

<style scoped lang="scss">
#container {
  width: 800px;
  display: flex;
}

#logo {
  position: relative;
  top: 0;
  left: 0;
}

#text-parent {
  top: 0;
}

#text-1 {
  font-family: "Honk";
  font-size: 64px;
  color: white;
  line-height: 0.7;
}

#text-2 {
  font-family: "Honk";
  font-size: 128px;
  color: white;
  line-height: 0.5;
}
</style>
