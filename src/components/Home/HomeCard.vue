<template>
  <v-card
    class="mx-auto home-card"
    max-width="300"
    height="100%"
    @click="clickFunction"
  >
    <div class="image-container">
      <img
        class="card-image image-1"
        :src="image1"
      ></img>
      <img
        class="card-image image-2"
        :src="image2"
      ></img>
      <img
        class="card-image image-3"
        :src="image3"
      ></img>
    </div>
    <div class="home-card-bottom">
      <v-card-text class="pt-6" style="position: relative">
        <div
          class="text-h6 font-weight-light mb-2 card-text card-text-light-grey"
        >
          {{ subheader }}
        </div>
        <div class="text-h4 font-weight-light mb-2 card-text card-text-purple">
          {{ header }}
        </div>
      </v-card-text>
      <div class="corner-bottom-right">
        <v-icon class="continue-arrow-icon">mdi-arrow-right-thin</v-icon>
      </div>
      <div class="fill-on-hover"></div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { PropType } from "vue";

const props = defineProps({
  image1: {
    type: String,
    required: true,
  },
  image2: {
    type: String,
    required: true,
  },
  image3: {
    type: String,
    required: true,
  },
  header: {
    type: String,
    required: true,
  },
  subheader: {
    type: String,
    required: true,
  },
  clickFunction: {
    type: Function as PropType<() => void>,
    required: true,
  },
});
</script>

<style scoped lang="scss">
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.5;
  position: absolute;
  width: 100%;
}

.home-card {
  background-color: #f5f5f5;
  border-radius: 16px;
  transition: 0.2s; /* Animation */
  .card-text-light-grey {
    color: #a89796;
  }
  .card-text-purple {
    color: #9c27b0;
  }
  overflow: hidden;
  .fill-on-hover {
    position: absolute;
    z-index: -10;
    bottom: 0px;
    right: 0px;
    background: rgba(242, 97, 87, 1);
    height: 16px;
    width: 16px;
    border-radius: 16px;
    transform-origin: 50% 50%;
    transition: transform 0.5s ease-out;
  }

  .image-container {
    position: relative;
    height: 300px;
    width: 300px;
    .image-1 {
      opacity: 1;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
    .image-2 {
      opacity: 0;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
    .image-3 {
      opacity: 0;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
  }
}

.home-card:hover {
  transform-origin: 50% 50%;
  transform: scale(1.05);

  .card-text {
    transition: all 0.3s ease-out;
    color: rgba(255, 255, 255, 0.8);
  }

  .fill-on-hover {
    z-index: -10;
    transform: scale(100);
  }

  .image-container {
    height: 300px;
    width: 300px;
    position: relative;
    .image-1 {
      animation: image-1-animate 1.5s ease-in-out forwards;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
    .image-2 {
      animation: image-2-animate 1.5s ease-in-out forwards;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
    .image-3 {
      animation: image-3-animate 1.5s ease-in-out forwards;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
  }
}

.corner-bottom-right {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 32px;
  height: 32px;
  overflow: hidden;
  bottom: 0;
  right: 0;
  background-color: rgba(242, 97, 87, 1);
  border-radius: 32px 0px 0px 0px;
  z-index: 10;
}

.continue-arrow-icon {
  margin-top: 4px;
  margin-right: -8px;
  color: white;
  font-family: courier, sans;
  z-index: 9;
}

@keyframes image-1-animate {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes image-2-animate {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes image-3-animate {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
