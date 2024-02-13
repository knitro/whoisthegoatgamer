<template>
  <background-diagonal>
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
    <div class="middle-padding-top">
      <v-container id="home-page">
        <v-row align-content="center" justify="center">
          <v-col cols="12" sm="11" md="10" lg="8" xl="6">
            <v-img :src="logoFull" class="logo" />
          </v-col>
        </v-row>
        <HomeSelect
          v-show="state == HomeState.SELECT"
          :setHomeState="setHomeState"
        ></HomeSelect>
        <HomeCreate v-show="state == HomeState.CREATE"></HomeCreate>
        <HomeJoin v-show="state == HomeState.JOIN"></HomeJoin>
      </v-container>
    </div>
  </background-diagonal>
</template>

<script setup lang="ts">
import BackgroundDiagonal from "@/components/Background/BackgroundDiagonal/BackgroundDiagonal.vue";
import logoFull from "@/assets/logo/logo-full.png";
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
  position: absolute;
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
  // max-width: 50vw;
  margin: auto;
  padding-bottom: 16px;
}

.middle-padding-top {
  padding-top: 20vh;
}
</style>
