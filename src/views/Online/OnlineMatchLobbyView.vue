<template>
  <background-display>
    <div class="online-view-overlay">
      <v-card
        class="curved-border"
        :loading="matchData !== null && matchData?.playerRequests.length == 0"
      >
        <v-row no-gutters>
          <v-col cols="7">
            <v-row align-content="center" justify="center">
              <v-col cols="12">
                <v-img :src="WaitingImage" class="curved-border"></v-img>
                <v-card-title>Waiting for your Opponents ... </v-card-title>
                <v-card-subtitle>
                  Your code is: <b>{{ code }}</b>
                </v-card-subtitle>
              </v-col>
              <v-col cols="4">
                <v-btn
                  @click="startMatch()"
                  variant="flat"
                  rounded
                  prepend-icon="mdi-play"
                  color="green"
                  :disabled="!isHost"
                >
                  Start Game
                </v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn
                  v-if="isHost"
                  @click="cancelMatch()"
                  variant="flat"
                  rounded
                  prepend-icon="mdi-close-octagon"
                  color="red"
                >
                  Cancel Game
                </v-btn>
                <v-btn
                  v-else
                  @click="removeSelf()"
                  variant="flat"
                  rounded
                  prepend-icon="mdi-close-octagon"
                  color="red"
                >
                  Leave Game
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="5">
            <v-list>
              <v-list-subheader>Player List</v-list-subheader>
              <v-list-item
                v-for="player in matchData?.playerList"
                v-bind:key="'confirm_' + player.id"
                :prependAvatar="'https://robohash.org/' + player.id + '.png'"
              >
                <v-list-item-title>{{ player.name }}</v-list-item-title>
                <template v-slot:append>
                  <v-btn
                    v-if="
                      auth.currentUser &&
                      auth.currentUser.uid != player.id &&
                      isHost
                    "
                    @click="removeFromLobby(player.id)"
                    variant="text"
                    color="red"
                    icon="mdi-exit-run"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>

        <v-card-title> </v-card-title>

        <v-divider></v-divider>

        <v-expand-transition>
          <div v-show="matchData && matchData?.playerRequests.length > 0">
            <v-divider></v-divider>
            <v-list :disabled="!isHost">
              <v-list-subheader>Opponent Requests</v-list-subheader>

              <v-list-item
                v-for="(request, index) in matchData?.playerRequests"
                v-bind:key="'request_' + request.id"
                :title="request.name"
              >
                <template v-slot:append>
                  <v-btn
                    v-if="isHost"
                    @click="acceptRequest(request)"
                    variant="text"
                    color="green"
                    icon="mdi-check"
                    slot="append"
                  ></v-btn>
                  <v-btn
                    v-if="isHost"
                    @click="declineRequest(request)"
                    variant="text"
                    color="red"
                    icon="mdi-close"
                    slot="append"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-expand-transition>
      </v-card>
    </div>
  </background-display>
</template>

<script setup lang="ts">
import {
  Match,
  MatchState,
  Player,
  PlayerRequest,
} from "@/firebase/database/database-interfaces";
import {
  VCard,
  VImg,
  VCardTitle,
  VCardSubtitle,
  VExpandTransition,
  VDivider,
  VList,
  VBtn,
  VListSubheader,
  VListItem,
} from "vuetify/lib/components/index.mjs";
import { onMounted, ref } from "vue";
import WaitingImage from "@/assets/images/outhouse.png";
import { useRouter } from "vue-router";
import { auth } from "@/firebase/firebase";
import {
  getOnlineMatchListener,
  cancelOnlineMatch,
} from "@/firebase/database/database";
import { removePlayerRequestOnlineMatch } from "@/firebase/database/database-request";
import {
  addPlayerListOnlineMatch,
  removePlayerListOnlineMatch,
} from "@/firebase/database/database-players";
import { updateStateOnlineMatch } from "@/firebase/database/database-match";
import BackgroundDisplay from "@/components/Background/BackgroundDisplay/BackgroundDisplay.vue";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
});

const isHost = ref(false);
const matchData = ref<Match | null>(null);
const unsubscribeFunction = ref<() => void>(() => {});
const router = useRouter();

async function getMatch() {
  const updater = (a: Match) => {
    matchData.value = a;
    const currentUser = auth.currentUser;
    if (currentUser == null) {
      console.log("Error, user not logged in");
    }

    // Check if user is still in the Match or not
    if (currentUser) {
      const filterForCurrentUser = matchData.value.playerList.filter(
        (currentPlayer) => currentPlayer.id == currentUser.uid,
      );
      if (filterForCurrentUser.length == 0) {
        // At this point, the user is no longer in the lobby
        router.push("/home");
      }
    }

    // Check if user is host
    if (currentUser && currentUser.uid == a.hostId) {
      isHost.value = true;
    } else {
      isHost.value = false;
    }
  };

  const accessDenied = () => {
    router.push("/home");
  };

  unsubscribeFunction.value = await getOnlineMatchListener(
    props.code,
    updater,
    accessDenied,
  );
}

async function acceptRequest(request: PlayerRequest) {
  if (matchData.value == null) {
    return;
  }

  const addedPlayer: Player = {
    id: request.id,
    name: request.name,
    isReady: false,
    vetos: matchData.value.maxNumberOfVetos,
  };
  await addPlayerListOnlineMatch(props.code, addedPlayer);
  await removePlayerRequestOnlineMatch(props.code, request.id);
}

async function declineRequest(request: PlayerRequest) {
  await removePlayerRequestOnlineMatch(props.code, request.id);
}

async function removeFromLobby(playerId: string) {
  await removePlayerListOnlineMatch(props.code, playerId);
}

async function startMatch() {
  await updateStateOnlineMatch(props.code, MatchState.GAME);
}

async function cancelMatch() {
  await cancelOnlineMatch(props.code);
  router.push("/home");
}

async function removeSelf() {
  if (matchData.value && auth.currentUser) {
    await removeFromLobby(auth.currentUser.uid);
    router.push("/home");
  }
}

onMounted(() => {
  getMatch();
});
</script>

<style scoped lang="scss">
.curved-border {
  border-radius: 16px;
}

.online-view-overlay {
  position: absolute;
  top: 50vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  width: 1000px;
  border-radius: 16px;
  .ready-chip {
    margin-left: 8px;
    height: 36px;
  }
}
</style>
