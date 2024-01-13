<template>
  <div></div>
</template>

<script setup lang="ts">
import { auth } from "@/firebase/firebase";
import { onMounted } from "vue";

onMounted(() => {
  auth.signOut();
});
</script>
