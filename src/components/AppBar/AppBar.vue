<template>
  <div>
    <v-app-bar color="#F26157" dark fixed elevate>
      <!-- <template v-slot:img="{ props }">
        <v-img
          v-bind="props"
          :src="background"
          gradient="to top right, rgba(242,97,87,.5), rgba(242,97,87,.9)"
          position="0% 35%"
        >
        </v-img>
      </template> -->
      <v-app-bar-nav-icon @click="showDrawer = true"></v-app-bar-nav-icon>
      <v-app-bar-title>
        <div id="title-text" @click="homeButtonPress">{{ title }}</div>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="profileButtonPress">
        <v-icon large>mdi-account-circle</v-icon>
      </v-btn>
      <div class="app-bar-rhs-padding"></div>
    </v-app-bar>

    <v-navigation-drawer v-model="showDrawer" absolute temporary>
      <v-list nav dense>
        <v-list-item
          v-for="(currentItem, index) in items"
          v-bind:key="'AppBarItem-' + index + '-' + currentItem.label"
          @click="sideBarButtonPress(currentItem.link)"
        >
          <template v-slot:prepend>
            <v-icon>{{ currentItem.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ currentItem.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { PropType, ref } from "vue";
import { AppBarItem } from "./AppBarInterfaces";
import {
  VAppBar,
  VAppBarNavIcon,
  VAppBarTitle,
  VSpacer,
  VBtn,
  VNavigationDrawer,
  VList,
  VListItem,
  VIcon,
} from "vuetify/lib/components/index.mjs";
import { auth } from "@/firebase/firebase";

const props = defineProps({
  title: String,
  items: Array as PropType<AppBarItem[]>,
});

const showDrawer = ref(false);
const group = ref(null); // What is this
// const accountIcon = ref("mdi-login");
// const background = "";
const router = useRouter();

function homeButtonPress() {
  router.push("/home");
}

function sideBarButtonPress(link: string) {
  router.push(link);
}

function profileButtonPress() {
  if (auth.currentUser == null) {
    router.push("/login");
  } else {
    // router.push("/profile");
  }
}
</script>

<style scoped lang="scss">
.app-bar-rhs-padding {
  // Padding is already added with the div addition for some reason
  padding-right: 0px; //8px;
}

#title-text:hover {
  cursor: pointer;
}

.v-toolbar.v-toolbar--absolute {
  width: auto !important;
  // position: fixed;
}
</style>
