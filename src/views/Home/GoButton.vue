<template>
  <v-card
    class="mx-auto home-card"
    max-width="300"
    height="100%"
    @click="clickFunction"
    :disabled="isDisabled"
  >
    <div class="image-container">
      <img class="image-back" :src="imageBackground" />
      <img class="image-fore" :src="imageForeground" />
      <div v-for="arrow in arrows">
        <v-icon
          class="arrow"
          :style="{
            top: arrow.yPos + 'px',
            width: arrow.size + 'px',
            animationDuration: arrow.animationTime + 's',
          }"
          color="#DCA198"
        >
          mdi-arrow-right
        </v-icon>
      </div>
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
import { VCard, VCardText } from "vuetify/lib/components/index.mjs";

defineProps({
  imageBackground: {
    type: String,
    required: true,
  },
  imageForeground: {
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
  isDisabled: {
    type: Boolean,
    required: true,
  },
});

interface Arrow {
  yPos: number;
  size: number;
  animationTime: number;
}

const arrows = createArrows(24);

function createArrows(numOfArrows: number): Arrow[] {
  const arrowArray: Arrow[] = [];

  const generateRandomNumber = (min: number, max: number, dp = 0) =>
    Number((Math.random() * max).toFixed(dp)) + min;

  for (let i = 0; i < numOfArrows; i++) {
    arrowArray.push({
      yPos: generateRandomNumber(0, 260),
      size: generateRandomNumber(10, 40),
      animationTime: generateRandomNumber(1, 3, 1),
    });
  }
  return arrowArray;
}
</script>

<style scoped lang="scss">
:root {
  --y-pos: 0px;
  --size: 10px;
  --animation-time: 1s;
}
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
    .image-back {
      opacity: 1;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
    .image-fore {
      opacity: 1;
      position: absolute;
      max-width: 100%;
      max-height: 100%;
    }
    .arrow {
      opacity: 1;
      position: absolute;
      left: -50px;
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

    .image-fore {
      animation: travel-over-right 1.5s ease-in-out forwards;
    }

    .arrow {
      opacity: 1;
      position: absolute;
      animation-name: travel-over-right;
      animation-fill-mode: forwards;
      animation-timing-function: ease-in-out;
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

@keyframes travel-over-right {
  0% {
    transform: translateX(0vw);
  }

  100% {
    transform: translateX(100vw);
  }
}
</style>
