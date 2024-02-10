<template>
  <background-display>
    <v-btn
      v-show="state != HomeState.SELECT"
      class="top-left-button"
      :class="backButtonClass"
      size="x-large"
      prependIcon="mdi-arrow-left"
      @click="onBackButtonPress"
    >
      Go Back</v-btn
    >
    <div class="online-view-center">
      <GoatGamerLogo class="logo"></GoatGamerLogo>
      <v-container id="home-page">
        <HomeSelect
          v-show="state == HomeState.SELECT"
          :setHomeState="setHomeState"
        ></HomeSelect>
        <HomeCreate v-show="state == HomeState.CREATE"></HomeCreate>
        <HomeJoin v-show="state == HomeState.JOIN"></HomeJoin>
      </v-container>
    </div>
  </background-display>
</template>

<script setup lang="ts">
import BackgroundDisplay from "@/components/Background/BackgroundDisplay/BackgroundDisplay.vue";
import { VContainer } from "vuetify/lib/components/index.mjs";
import GoatGamerLogo from "@/components/GoatGamerLogo/GoatGamerLogo.vue";
import { ref } from "vue";
import HomeSelect from "./HomeSelect.vue";
import HomeCreate from "./HomeCreate.vue";
import HomeJoin from "./HomeJoin.vue";
import { HomeState } from "@/common/enums";

const state = ref<HomeState>(HomeState.SELECT);
const backButtonClass = ref("");

function setHomeState(stateParam: HomeState) {
  state.value = stateParam;
}

function onBackButtonPress() {
  state.value = HomeState.SELECT;
  backButtonClass.value = "is-deleting";
  setTimeout(() => {
    backButtonClass.value = "";
  }, 500);
}
</script>

<style scoped lang="scss">
.top-left-button {
  margin: 16px;
  transition:
    opacity 0.5s,
    transform 0.5s,
    height 0.5s,
    display 0.5s allow-discrete;
}

@starting-style {
  .top-left-button {
    opacity: 0;
    height: 0;
  }
}

.is-deleting {
  opacity: 0;
  height: 0;
  display: none;
  transform: skewX(50deg) translateX(-25vw);
}

.logo {
  margin: auto;
  padding-bottom: 16px;
}

.online-view-center {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  width: 100%;
}

.online-view-overlay {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  width: 600px;
}

.online-view-text-input {
  font-size: 28px;
}
</style>
