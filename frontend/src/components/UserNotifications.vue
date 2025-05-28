<template>
  <div class="notifications">
    <button @click="toggleNotifications" class="notification-btn">
      <i class="fas fa-bell"></i>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>
    <div v-if="notificationsOpen" class="notification-container">
      <template v-if="notifications.length > 0">
        <div 
          v-for="(notification, index) in notifications" 
          :key="notification.id" 
          class="alert"
          :class="alertClass(notification.type)"
          role="alert"
        >
          {{ notification.message }}
          <button 
            type="button" 
            class="close" 
            aria-label="Close" 
            @click="deleteNotification(notification.id)">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      </template>
      <template v-else>
        <div class="empty-message">
          No hay notificaciones.
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import axios from "@/plugins/axios";

export default {
  name: "UserNotifications",
  data() {
    return {
      notificationsOpen: false,
      notifications: [],
      socket: null
    };
  },
  computed: {
    unreadCount() {
      return this.notifications.filter(n => n.status === "unread").length;
    }
  },
  async mounted() {
    await this.fetchNotifications();
    
    // Inicializar conexión con Socket.io
    this.socket = io (process.env.VUE_APP_SOCKET_URL);

    // Escuchar nuevas notificaciones en tiempo real
    this.socket.on(`notification-${this.getUserId()}`, (newNotification) => {
      this.notifications.unshift(newNotification); // Agregar la nueva notificación a la lista
    });

    document.addEventListener("click", this.handleClickOutside);
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("closeNotifications", this.handleCloseNotifications);
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    document.removeEventListener("click", this.handleClickOutside);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("closeNotifications", this.handleCloseNotifications);
  },
  methods: {
    alertClass(type) {
      return `alert-${type || "info"}`;
    },
    async toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen;
      if (this.notificationsOpen) {
        await this.fetchNotifications();
      }
    },
    async fetchNotifications() {
      try {
        const response = await axios.get("/notifications");
        this.notifications = response.data;
      } catch (error) {
        console.error("❌ Error obteniendo notificaciones:", error);
      }
    },
    async deleteNotification(notificationId) {
      try {
        await axios.delete(`/notifications/${notificationId}`);
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
      } catch (error) {
        console.error("❌ Error eliminando la notificación:", error);
      }
    },
    getUserId() {
      // Extrae el userId de alguna fuente (ejemplo: store Vuex o localStorage)
      return 1; // Ajusta esto para obtener el ID del usuario actual
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.notificationsOpen = false;
      }
    },
    handleScroll() {
      this.notificationsOpen = false;
    },
    handleCloseNotifications() {
      this.notificationsOpen = false;
    }
  }
};
</script>

<style scoped>
.notifications {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}

.notification-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: white;
  position: relative;
}

.notification-btn i {
  font-size: 20px;
  color: white;
}

.badge {
  background: red;
  color: white;
  border-radius: 50%;
  padding: 5px;
  font-size: 12px;
  position: absolute;
  top: -5px;
  right: -10px;
}

.notification-container {
  position: absolute;
  top: 40px;
  right: 0;
  width: 220px;
  background: white;
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.alert {
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 0.9rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}
.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: inherit;
}

.empty-message {
  padding: 10px;
  text-align: center;
  color: #555;
  font-size: 0.9rem;
}
</style>
