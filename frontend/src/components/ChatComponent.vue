<template>
  <div class="chat-container">
    <!-- Caja de mensajes -->
    <div class="chat-box" ref="chatBox">
      <transition-group name="message" tag="div">
        <!-- Se recorren solo los mensajes activos (sin deleted_at) -->
        <div
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="chat-message"
          :class="{ 'own-message': isOwnMessage(msg) }"
          @click="updateMessageStatus(msg)"
        >
          <!-- Encabezado con el nombre en la parte superior y el botón de eliminar (cruz) -->
          <div class="message-info">
            <strong class="user-name">{{ labelForMessage(msg) }}</strong>
            <!-- La cruz se mostrará solo cuando pases el ratón sobre el contenedor .message-info -->
            <button
              v-if="isOwnMessage(msg)"
              @click.stop="deleteMessage(msg.id)"
              class="delete-btn"
            >
              ✖
            </button>
          </div>
          <div class="message-content" v-html="formatMessage(msg.content)"></div>
        </div>
      </transition-group>
    </div>

    <!-- Caja de entrada de mensajes -->
    <div class="chat-input-container">
      <div class="input-wrapper">
        <button class="emoji-button" @click="toggleEmojiPicker">😀</button>
        <input
          v-model="newMessage"
          placeholder="Escribe un mensaje..."
          @keyup.enter="sendMessage"
        />
        <button class="send-icon-button" @click="sendMessage">
          <svg class="send-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
          </svg>
        </button>
      </div>
      <!-- Selector de emojis -->
      <div v-if="showEmojiPicker" class="emoji-picker-container">
        <emoji-picker @emoji-click="addEmoji" class="emoji-picker" />
      </div>
    </div>

    <!-- Botón de hard delete visible solo para administradores -->
    <div v-if="role === 'admin' || role === 'superadmin'" class="hard-delete-container">
      <button @click="deleteAllMessages">
        🗑️ Eliminar todos los mensajes eliminados
      </button>
    </div>
  </div>
</template>

<script>
import socket from "@/plugins/socket";
import axios from "@/plugins/axios";
import { toRaw } from "vue";
import 'emoji-picker-element';

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
      loadingMessages: false,
      currentPage: 1,
      totalPages: 1
    };
  },
  computed: {
    filteredMessages() {
      return this.messages.filter(msg => !msg.deleted_at);
    },
    userName() {
      return (this.$store.state.auth.userData && this.$store.state.auth.userData.name) || "Usuario";
    }
  },
  mounted() {
    if (!this.userId) {
      console.warn("User ID no definido, no se cargan los mensajes.");
      return;
    }
    this.loadMessages();

    socket.on("newMessage", message => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    socket.on("messageUpdated", data => {
      const index = this.messages.findIndex(m => m.id === data.id);
      if (index !== -1) {
        this.$set(this.messages, index, { ...this.messages[index], status: data.status });
      }
    });
  },
  methods: {
    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker;
    },
    addEmoji(event) {
      this.newMessage += event.detail.unicode;
      this.showEmojiPicker = false;
    },
    formatMessage(content) {
      if (!content || typeof content !== "string") return "";
      return content
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.*?)\*/g, "<i>$1</i>");
    },
    loadMessages() {
      if (this.loadingMessages) return;
      this.loadingMessages = true;
      axios
        .get(`/messages?senderId=${this.userId}&receiverId=${this.receiverId}&page=${this.currentPage}&limit=20`)
        .then(response => {
          this.messages = response.data.messages || [];
          this.totalPages = response.data.totalPages || 1;
          this.loadingMessages = false;
          this.$nextTick(() => this.scrollToBottom());
        })
        .catch(error => {
          console.error("Error al cargar mensajes:", error);
          this.loadingMessages = false;
        });
    },
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
        .catch(error => console.error("Error al enviar mensaje:", error));
    },
    updateMessageStatus(msg) {
      if (msg.status !== "read") {
        socket.emit("updateMessageStatus", { id: msg.id, status: "read" });
      }
    },
    deleteMessage(id) {
      axios
        .delete(`/messages/${id}`)
        .then(() => {
          this.messages = this.messages.map(msg =>
            msg.id === id ? { ...msg, deleted_at: new Date() } : msg
          );
        })
        .catch(error => console.error("Error al eliminar mensaje:", error));
    },
    deleteAllMessages() {
      axios
        .delete("/messages/all")
        .then(() => {
          this.messages = this.messages.filter(msg => !msg.deleted_at);
        })
        .catch(error => console.error("Error al eliminar todos los mensajes:", error));
    },
    isOwnMessage(msg) {
      return msg.senderId === this.userId;
    },
    labelForMessage(msg) {
      const rawMsg = toRaw(msg);
      if (this.role === "admin" || this.role === "superadmin") {
        return this.isOwnMessage(rawMsg)
          ? "Administrador"
          : "Cliente " + (rawMsg.senderName?.trim() || "Desconocido");
      }
      return this.isOwnMessage(rawMsg)
        ? "Cliente " + this.userName
        : "Administrador";
    },
    scrollToBottom() {
      const chatBox = this.$refs.chatBox;
      if (chatBox) {
        this.$nextTick(() => {
          chatBox.scrollTop = chatBox.scrollHeight;
        });
      }
    }
  },
  watch: {
    userId(newVal) {
      if (newVal) this.loadMessages();
    },
    messages() {
      this.$nextTick(() => this.scrollToBottom());
    }
  }
};
</script>

<style scoped>
/* Estilos modernos con acento azul oscuro (#345996) */

/* Contenedor principal del chat */
.chat-container {
  font-family: 'Roboto', sans-serif;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px auto;
  max-width: 400px;
}

/* Caja de mensajes */
.chat-box {
  height: 400px;
  padding: 20px;
  background: linear-gradient(135deg, #f9f9f9, #ffffff);
  overflow-y: auto;
}

/* Animaciones para los mensajes */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}
.message-enter,
.message-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Estilo de cada mensaje */
.chat-message {
  margin-bottom: 12px;
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 20px;
  word-wrap: break-word;
  background-color: #e9efff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Mensajes propios con alineación a la derecha */
.own-message {
  background-color: #cce4ff;
  margin-left: auto;
  text-align: right;
}
.chat-message:not(.own-message) {
  background-color: #ffffff;
  margin-right: auto;
  text-align: left;
  border: 1px solid #d7e2f0;
}

/* Encabezado del mensaje (nombre y botón de eliminar) */
.message-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px; /* Aumentar ligeramente el tamaño de la cabecera */
  color: #345996; /* Color azul oscuro */
  margin-bottom: 4px;
}
.user-name {
  font-weight: bold;
  font-size: 16px; /* Mayor tamaño para el nombre */
}

/* Botón de eliminación: la cruz se muestra solo al hacer hover sobre el contenedor de la cabecera */
.message-info .delete-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #345996;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.message-info:hover .delete-btn {
  display: inline;
}
.delete-btn:hover {
  opacity: 1;
}

/* Contenido del mensaje */
.message-content {
  font-size: 18px; /* Aumentamos el tamaño del texto en los mensajes */
  color: #333;
}

/* Caja de entrada de mensaje */
.chat-input-container {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  background-color: #fafafa;
  position: relative;
}
.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 30px;
  padding: 8px 12px;
  background-color: #fff;
}
.input-wrapper input {
  flex-grow: 1;
  border: none;
  outline: none;
  font-size: 18px; /* También se aumenta el tamaño de letra en el input */
  padding: 8px;
}
.emoji-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 22px;
  margin-right: 8px;
}
.send-icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.send-icon {
  width: 28px;
  height: 28px;
  fill: #345896;
  transition: fill 0.3s;
}
.send-icon-button:hover .send-icon {
  fill: #2a447b;
}

/* Contenedor del emoji-picker */
.emoji-picker-container {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  width: 95%;
  max-height: 300px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 100;
}
.emoji-picker {
  --num-columns: 6;
  --emoji-size: 2rem;
  --background: rgb(255, 255, 255);
  width: 100%;
  height: auto;
  border: none;
}

/* Botón de hard delete (solo admin) */
.hard-delete-container {
  margin: 15px;
  text-align: center;
}
.hard-delete-container button {
  background: #ff4d4d;
  color: #fff;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}
.hard-delete-container button:hover {
  background: #e60000;
}
</style>
