<template>
  <div>
    <app-bar-goat-gamer title="Match Lobby"></app-bar-goat-gamer>
    <div class="online-view-pick-ban-center">
      <v-card
        class="mx-auto"
        max-width="344"
        :loading="matchData !== null && matchData?.playerRequests.length == 0"
      >
        <v-img :src="WaitingImage" height="200px"></v-img>

        <v-card-title> Waiting for your Opponents ... </v-card-title>

        <v-card-subtitle>
          Your code is: <b>{{ code }}</b>
        </v-card-subtitle>

        <v-divider></v-divider>
        <div v-show="matchData && matchData?.playerList.length > 0">
          <v-list :disabled="!isHost">
            <v-list-subheader>Player List</v-list-subheader>
            <v-list-item
              v-for="(player, index) in matchData?.playerList"
              v-bind:key="'player_' + player.id"
            >
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
              <v-list-item-title>
                {{ player.name }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

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

        <v-divider></v-divider>
        <v-row>
          <v-col>
            <v-btn
              @click="startMatch()"
              variant="flat"
              prepend-icon="mdi-play"
              color="green"
              :disabled="!isHost"
              >Start Game</v-btn
            >
          </v-col>
          <v-col>
            <v-btn
              v-if="isHost"
              @click="cancelMatch()"
              variant="flat"
              prepend-icon="mdi-close-octagon"
              color="red"
              >Cancel Game</v-btn
            >
            <v-btn
              v-else
              @click="removeSelf()"
              variant="flat"
              prepend-icon="mdi-close-octagon"
              color="red"
              >Leave Game</v-btn
            >
          </v-col>
        </v-row>
      </v-card>
    </div>
  </div>
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
import AppBarGoatGamer from "@/components/AppBar/AppBarGoatGamer.vue";
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
        router.push("/online");
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
    router.push("/online");
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
  router.push("/online");
}

async function removeSelf() {
  if (matchData.value && auth.currentUser) {
    await removeFromLobby(auth.currentUser.uid);
    router.push("/online");
  }
}

onMounted(() => {
  getMatch();
});
</script>

<style scoped lang="scss">
.online-view-pick-ban-center {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 1000px;
}
</style>
