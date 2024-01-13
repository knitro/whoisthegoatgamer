<template>
  <div>
    <app-bar :title="title" :items="items" isFixed></app-bar>
  </div>
</template>

<script setup lang="ts">
import AppBar from "./AppBar.vue";
import { AppBarItem } from "./AppBarInterfaces";

const props = defineProps({
  title: {
    type: String,
    required: false,
    default: "WhoIsTheGoatGamer",
  },
});

const items: AppBarItem[] = [
  { label: "Home", icon: "mdi-home", link: "/home" },
  { label: "Online", icon: "mdi-web", link: "/online" },
];
</script>

<style scoped lang="scss">
.header-spacer {
  padding: 40px;
}
</style>
