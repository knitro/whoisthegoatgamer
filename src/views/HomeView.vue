<template>
  <div>
    <app-bar-goat-gamer title="Home"></app-bar-goat-gamer>
    <v-container id="home-page">
      <v-row>
        <v-col
          v-for="(cardData, index) in homeCardData"
          v-bind:key="index + '-' + cardData.header"
          cols="4"
        >
          <home-card
            :image="cardData.image"
            :header="cardData.header"
            :subheader="cardData.subheader"
            :link="cardData.link"
          ></home-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
import HomeCard from "@/components/Home/HomeCard.vue";
import { HomeCardItem } from "@/components/Home/HomeCardInterfaces";
import distanceLandImageUrl from "@/assets/images/distance-land.png";
import { VContainer, VRow, VCol } from "vuetify/lib/components/index.mjs";

const homeCardData: HomeCardItem[] = [
  {
    image: distanceLandImageUrl,
    header: "Online",
    subheader: "Create your own private online lobby to find the GOAT gamer!",
    link: "/online",
  },
];
</script>
