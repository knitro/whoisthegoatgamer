<template>
  <v-card title="Chat">
    <v-list max-height="400px" lines="three" class="chat-list">
      <v-list-item
        v-for="chatLog in chatLogs"
        v-bind:key="'chat_' + chatLog.id"
        :prependAvatar="'https://robohash.org/' + chatLog.authorId + '.png'"
      >
        <v-list-item-title>
          <div v-if="playerIdNameMapping.get(chatLog.authorId)">
            {{ playerIdNameMapping.get(chatLog.authorId) }}
          </div>
          <v-chip v-else>Match Bot</v-chip>
        </v-list-item-title>
        <template v-slot:prepend>
          <v-avatar
            :color="
              chatLog.authorId == 'match-bot'
                ? 'pink-lighten-2'
                : 'grey-lighten-1'
            "
          >
            <v-img :src="'https://robohash.org/' + chatLog.authorId + '.png'" />
          </v-avatar>
        </template>
        <a
          v-if="
            chatLog.authorId == 'match-bot' &&
            (chatLog.message.startsWith('https://') ||
              chatLog.message.startsWith('steam://'))
          "
          :href="chatLog.message"
          target="_blank"
        >
          {{ chatLog.message }}
        </a>
        <div v-else>
          {{ chatLog.message }}
        </div>
        <v-divider></v-divider>
      </v-list-item>

      <v-list-item
        v-if="chatLogs.length == 0"
        subtitle="No messages yet"
      ></v-list-item>
      <div ref="bottomOfChatRef" class="bottom-of-scroll"></div>
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
import { ref, watch, nextTick } from "vue";
import { ChatLog } from "@/firebase/database/database-interfaces";
import { onMounted } from "vue";
import {
  addToChatHistoryOnlineMatch,
  getChatLogListener,
} from "@/firebase/database/database-chat";
import { onUnmounted } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  playerIdNameMapping: {
    type: Map<string, string>,
    required: true,
  },
});

const chatLogs = ref<ChatLog[]>([]);
const text = ref("");
const bottomOfChatRef = ref<HTMLDivElement>();

const router = useRouter();
const unsubscribeFunction = ref<() => void>(() => {});

async function getChatLogs() {
  const updater = (a: ChatLog) => {
    chatLogs.value.push(a);
    scrollToBottom();
  };

  const accessDenied = () => {
    console.log("Access Denied");
  };

  unsubscribeFunction.value = await getChatLogListener(
    props.code,
    updater,
    accessDenied,
  );
}

function clearTextField() {
  text.value = "";
}

async function sendMessage() {
  const textValue = text.value;
  text.value = "";
  await addToChatHistoryOnlineMatch(props.code, textValue);
}

async function scrollToBottom() {
  await nextTick();
  if (bottomOfChatRef.value) {
    // Use el.scrollIntoView() to instantly scroll to the element

    bottomOfChatRef.value.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }
}

onMounted(() => {
  getChatLogs();
});

onUnmounted(() => {
  unsubscribeFunction.value();
});
</script>

<style scoped lang="scss">
.chat-list {
  overflow-y: scroll;
  height: 400px;
}

.bottom-of-scroll {
  scroll-padding-bottom: 200px;
}
</style>
