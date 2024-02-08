<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { requestPermission } from "./firebase/messaging/messaging-token-permission";

onMounted(() => {
  requestPermission();
});
</script>
./firebase/messaging/messaging-token-permission
