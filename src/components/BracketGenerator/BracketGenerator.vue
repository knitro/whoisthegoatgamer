<template>
  <v-card title="Bracket Generator" class="overflow-y-auto" max-height="400px">
    <v-list>
      <v-list-item
        v-if="bracketArray.length == 0"
        title="No Bracket Data Generated"
      ></v-list-item>
      <v-list-group
        v-for="(bracketMatch, matchIndex) in bracketArray"
        v-bind:key="'bracket_match_' + bracketMatch.id"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-account-group"
            :title="bracketMatch.name"
          ></v-list-item>
        </template>
        <div
          v-for="(bracketPairing, pairingIndex) in bracketMatch.pairings"
          v-bind:key="'bracket_pairing_' + bracketMatch.id"
        >
          <v-list-subheader>{{
            "Pairing " + (pairingIndex + 1)
          }}</v-list-subheader>
          <v-list-item
            v-for="player in bracketPairing.players"
            v-bind:key="bracketMatch.id + '_' + player.id"
            :title="player.name"
          >
            <template v-slot:prepend>
              <v-avatar color="grey-lighten-1" class="margin-right-8">
                <v-img :src="'https://robohash.org/' + player.id + '.png'" />
              </v-avatar>
            </template>
            <template v-slot:append>
              <v-list-item-action start>
                <v-checkbox-btn
                  @change="advancingPlayerCheck(player)"
                  :disabled="bracketArray.length - 1 != matchIndex || !isHost"
                ></v-checkbox-btn>
              </v-list-item-action>
            </template>
          </v-list-item>
        </div>
      </v-list-group>
    </v-list>
    <v-card-text v-if="bracketArray.length != 0">
      Select players that are advancing to the next round
    </v-card-text>
    <v-card-actions>
      <v-text-field
        v-model.number="bracketSize"
        :rules="[rules.required, rules.numbersOnly]"
        label="Number of Players per Game"
        density="compact"
      >
        <template v-slot:append>
          <v-btn
            @click="pressGenerateRound"
            :disabled="
              !isHost &&
              (bracketArray.length == 0 || advancingPlayers.length >= 2)
            "
            >Generate Round</v-btn
          >
        </template>
      </v-text-field>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import {
  VCard,
  VList,
  VListItem,
  VListSubheader,
} from "vuetify/lib/components/index.mjs";
import { PropType, ref } from "vue";
import {
  BracketMatch,
  BracketPairing,
  BracketPlayer,
} from "./BracketGeneratorInterfaces";
import { addBracketOnlineMatch } from "@/firebase/database/database-match";
import { Player } from "@/firebase/database/database-interfaces";

const props = defineProps({
  bracketArray: {
    type: Array as PropType<BracketMatch[]>,
    required: true,
  },
  matchId: {
    type: String,
    required: true,
  },
  isHost: {
    type: Boolean,
    required: true,
  },
  playerList: {
    type: Array as PropType<Player[]>,
    required: true,
  },
});

const advancingPlayers = ref<BracketPlayer[]>([]);
const bracketSize = ref(2);

const rules = {
  required: (value: string) => !!value || "Required.",
  numbersOnly: (value: string) => !Number.isNaN(Number.parseFloat(value)),
};

function advancingPlayerCheck(player: BracketPlayer) {
  if (advancingPlayers.value.includes(player)) {
    // Remove Player
    advancingPlayers.value = advancingPlayers.value.filter((currentPlayer) => {
      player.id == currentPlayer.id;
    });
  } else {
    advancingPlayers.value.push(player);
  }
}

async function pressGenerateRound() {
  console.log(advancingPlayers.value);
  let playersForNextRound = advancingPlayers.value;

  if (props.bracketArray.length == 0) {
    // First Round Generation. Get entire player list
    playersForNextRound = props.playerList.map((player) => {
      return {
        name: player.name,
        id: player.id,
        hadBye: false,
      };
    });
  }

  if (playersForNextRound.length < 2) {
    // Ignore any requests that don't have enough players going into the next round
    return;
  }

  const round = generateBracket(playersForNextRound, bracketSize.value);

  await addBracketOnlineMatch(
    props.matchId,
    round,
    "Round of " + playersForNextRound.length,
  );
}

function generateBracket(
  playerList: BracketPlayer[],
  matchSize: number,
): BracketPairing[] {
  const sortedPlayerList = playerList
    .map((value) => ({ player: value, sort: Math.random() }))
    .sort((a, b) => {
      // Sort playerList by players with BYE first
      if (a.player.hadBye && !b.player.hadBye) {
        return -1;
      } else if (!a.player.hadBye && b.player.hadBye) {
        return 1;
      } else {
        return a.sort - b.sort;
      }
    })
    .map((value) => value.player);

  const matches: BracketPairing[] = [];
  for (let i = 0; i < sortedPlayerList.length; i += matchSize) {
    const playersInMatch = sortedPlayerList.slice(i, i + matchSize);
    const bracketPairing: BracketPairing = {
      id: "",
      players: playersInMatch,
      isBye: i + matchSize > sortedPlayerList.length,
    };
    matches.push(bracketPairing);
  }
  return matches;
}
</script>

<style scoped lang="scss">
.margin-right-8 {
  margin-right: 8px;
}
</style>
