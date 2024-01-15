<template>
  <v-card title="Chat" class="overflow-y-auto">
    <v-list max-height="400px">
      <v-list-item
        v-for="chatLog in chatLogs"
        v-bind:key="'chat_' + chatLog.id"
        :prependAvatar="'https://robohash.org/' + chatLog.authorId + '.png'"
        :title="playerIdNameMapping.get(chatLog.authorId) ?? 'Match Bot'"
      >
        <template v-slot:prepend>
          <v-avatar color="grey-lighten-1">
            <v-img :src="'https://robohash.org/' + chatLog.authorId + '.png'" />
          </v-avatar>
        </template>
        <v-list-item-subtitle>
          <a
            v-if="chatLog.authorId == 'match-bot'"
            :href="chatLog.message"
            target="_blank"
          >
            {{ chatLog.message }}
          </a>
          <div v-else>
            {{ chatLog.message }}
          </div>
        </v-list-item-subtitle>
        <v-divider></v-divider>
      </v-list-item>
      <v-list-item
        v-if="chatLogs.length == 0"
        subtitle="No messages yet"
      ></v-list-item>
    </v-list>
    <v-card-actions>
      <v-text-field
        v-model="text"
        append-icon="mdi-send"
        variant="filled"
        clear-icon="mdi-close-circle"
        clearable
        label="Your Message"
        type="text"
        @keydown.enter="sendMessage"
        @click:append="sendMessage"
        @click:clear="clearTextField"
      ></v-text-field>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { VCard } from "vuetify/lib/components/index.mjs";
import { PropType, ref } from "vue";
import { addToChatHistoryOnlineMatch } from "@/firebase/database/database-match";
import { ChatLog } from "@/firebase/database/database-interfaces";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  chatLogs: {
    type: Array as PropType<ChatLog[]>,
    required: true,
  },
  playerIdNameMapping: {
    type: Map<string, string>,
    required: true,
  },
});

const text = ref("");
const bottomOfChatRef = ref<HTMLDivElement>();

function clearTextField() {
  text.value = "";
}

async function sendMessage() {
  const textValue = text.value;
  text.value = "";
  await addToChatHistoryOnlineMatch(props.code, textValue);
}
</script>

<style scoped lang="scss"></style>
