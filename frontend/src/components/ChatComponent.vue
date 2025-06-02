<template>
  <div class="chat-container">
    <div class="chat-box" ref="chatBox">
      <transition-group name="message" tag="div">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="chat-message"
          :class="{ 'own-message': isOwnMessage(msg) }"
          @click="updateMessageStatus(msg)"
        >
          <div class="message-info">
            <strong>{{ labelForMessage(msg) }}:</strong>
          </div>
          <!-- Se muestra el mensaje con formato enriquecido -->
          <div class="message-content" v-html="formatMessage(msg.content)"></div>
        </div>
      </transition-group>
    </div>

    <div class="chat-input-container">
      <!-- Este contenedor se posiciona de forma relativa para ubicar el picker de emojis -->
      <div class="input-wrapper">
        <button class="emoji-button" @click="toggleEmojiPicker">😀</button>
        <input
          v-model="newMessage"
          placeholder="Escribe un mensaje..."
          @keyup.enter="sendMessage"
        />
        <!-- Botón enviar con ícono similar al de Telegram -->
        <button class="send-icon-button" @click="sendMessage">
          <svg class="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
      <!-- Contenedor del selector de emojis, posicionado de manera absoluta -->
      <div v-if="showEmojiPicker" class="emoji-picker-container">
        <emoji-picker @emoji-click="addEmoji" class="emoji-picker" />
      </div>
    </div>
  </div>
</template>

<script>
import socket from "@/plugins/socket";
import axios from "@/plugins/axios";
import { toRaw } from "vue";
import 'emoji-picker-element'; // Importa el componente de selector de emojis

export default {
  name: "ChatComponent",
  props: {
    userId: { type: [Number, String], required: false },
    receiverId: { type: [Number, String], required: true },
    role: { type: String, default: "client" }
  },
  data() {
    return {
      messages: [],
      newMessage: "",
      showEmojiPicker: false,
      notificationVisible: false,
      notificationText: "",
      currentPage: 1,
      totalPages: 1,
      loadingMessages: false,
      emojiMap: {
        smile: "😃",
        heart: "❤️",
        thumbs_up: "👍",
        fire: "🔥",
        party: "🎉"
      }
    };
  },
  computed: {
    userName() {
      return (
        (this.$store.state.auth.userData &&
          this.$store.state.auth.userData.name) ||
        "Usuario"
      );
    }
  },
  mounted() {
    if (!this.userId) {
      console.warn("User ID no definido. Se omite la carga inicial de mensajes.");
      return;
    }
    this.loadMessages();

    // Escuchar nuevos mensajes vía Socket.io
    socket.on("newMessage", (message) => {
      if (Array.isArray(this.messages)) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });

    // Escuchar actualizaciones de estado de mensajes
    socket.on("messageUpdated", (data) => {
      const index = this.messages.findIndex((m) => m.id === data.id);
      if (index !== -1) {
        this.$set(this.messages, index, { ...this.messages[index], status: data.status });
      }
    });

    // Escuchar notificaciones en tiempo real
    socket.on(`notification-${this.userId}`, (notification) => {
      this.showNotification(notification.title, notification.body);
    });
  },
  methods: {
    // Alterna el estado de visibilidad del selector de emojis
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    // Agrega el emoji seleccionado al mensaje y oculta el selector
    addEmoji(event) {
      this.newMessage += event.detail.unicode;
      this.showEmojiPicker = false;
    },
    // Solicita permiso y muestra una notificación en el navegador
    showNotification(title, body) {
      if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, { body });
          }
        });
      }
    },
    // Aplica formato: **texto** a negritas, *texto* a cursivas y :emoji: se sustituye usando emojiMap
    formatMessage(content) {
      if (!content || typeof content !== "string") return "";
      return content
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>")
        .replace(/:(\w+):/g, (match, emoji) => this.emojiMap[emoji] || match);
    },
    // Carga mensajes desde la API con paginación
    loadMessages() {
      if (this.loadingMessages) return;
      this.loadingMessages = true;
      axios
        .get(
          `/messages?senderId=${this.userId}&receiverId=${this.receiverId}&page=${this.currentPage}&limit=20`
        )
        .then((response) => {
          this.messages = Array.isArray(response.data.messages)
            ? response.data.messages
            : [];
          this.totalPages = response.data.totalPages || 1;
          this.loadingMessages = false;
          this.$nextTick(() => this.scrollToBottom());
        })
        .catch((error) => {
          console.error("Error al cargar mensajes:", error);
          this.loadingMessages = false;
        });
    },
    // Envía el mensaje actual
    sendMessage() {
      if (!this.newMessage.trim()) return;
      const message = {
        senderId: this.userId,
        senderName: this.userName,
        receiverId: this.receiverId,
        content: this.newMessage
      };
      socket.emit("newMessage", message);
      axios
        .post("/messages/send", message)
        .then(() => {
          this.newMessage = "";
          this.scrollToBottom();
        })
        .catch((error) => console.error("Error al enviar mensaje:", error));
    },
    // Actualiza el estado del mensaje a "read" si es necesario
    updateMessageStatus(msg) {
      if (msg.status !== "read") {
        socket.emit("updateMessageStatus", { id: msg.id, status: "read" });
      }
    },
    // Comprueba si el mensaje pertenece al usuario actual
    isOwnMessage(msg) {
      return msg.senderId === this.userId;
    },
    // Devuelve la etiqueta basada en el rol y origen del mensaje
    labelForMessage(msg) {
      const rawMsg = toRaw(msg);
      if (this.role === "admin" || this.role === "superadmin") {
        return this.isOwnMessage(rawMsg)
          ? "Administrador"
          : "Cliente " + (rawMsg.senderName?.trim() || "Desconocido");
      } else {
        return this.isOwnMessage(rawMsg)
          ? "Cliente " + this.userName
          : "Administrador";
      }
    },
    // Realiza scroll hasta el último mensaje
    scrollToBottom() {
      const chatBox = this.$refs.chatBox;
      if (chatBox) {
        this.$nextTick(() => {
          chatBox.scrollTop = chatBox.scrollHeight;
        });
      }
    },
    // Carga la siguiente página de mensajes, si hay más
    loadNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.loadMessages();
      }
    }
  },
  watch: {
    userId(newVal) {
      if (newVal) this.loadMessages();
    },
    messages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: 100%;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px auto;
}

.chat-box {
  height: 400px;
  padding: 15px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}
.message-enter,
.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.chat-message {
  margin-bottom: 10px;
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 20px;
  word-wrap: break-word;
  cursor: pointer;
}
.own-message {
  background-color: #cce4ff;
  margin-left: auto;
  text-align: right;
}
.chat-message:not(.own-message) {
  background-color: #ffffff;
  margin-right: auto;
  text-align: left;
  border: 1px solid #345896;
}

.message-info {
  font-size: 12px;
  color: #555;
  margin-bottom: 5px;
}
.message-content {
  font-size: 16px;
  color: #333;
}

/* Contenedor del input */
.chat-input-container {
  padding: 10px 15px;
  border-top: 1px solid #ddd;
  background-color: #fff;
  position: relative; /* Para posicionar el picker de emojis de forma absoluta */
}

/* Input y botones integrados */
.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 10px;
  background-color: #fff;
}
.input-wrapper input {
  flex: 1;
  padding: 5px 10px;
  font-size: 16px;
  border: none;
  outline: none;
}
.emoji-button {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-right: 5px;
}
.send-icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
}
.send-icon {
  width: 24px;
  height: 24px;
  fill: #345896;
  transition: fill 0.3s;
}
.send-icon-button:hover .send-icon {
  fill: #2a447b;
}

/* Contenedor del emoji-picker (popup elegante) */
.emoji-picker-container {
  position: absolute;
  bottom: calc(100% + 5px); /* Ubica el picker encima del input */
  left: 0;
  right: 0;
  margin: auto;
  width: 95%; /* Ancho relativo para dar un toque elegante */
  max-height: 300px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  overflow-y: auto;
  z-index: 100;
}

/* Personalización adicional del emoji-picker interno */
.emoji-picker {
  --emoji-picker-background-color: #fff;
  --emoji-picker-body-background-color: #fff;
  --emoji-picker-border-color: #ccc;
  --emoji-picker-category-button-background-color: #fff;
  --emoji-picker-text-color: #333;
  --num-columns: 6;
  --emoji-size: 2rem;
  --background: rgb(255, 255, 255);
  width: 100%;
  height: auto;
  border: none;
}
</style>
