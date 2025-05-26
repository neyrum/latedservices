<template>
  <div class="notifications">
    <button @click="toggleNotifications" class="notification-btn">
      <i class="fas fa-bell"></i>
      <span v-if="notifications.length > 0" class="badge">{{ notifications.length }}</span>
    </button>
    <div v-if="notificationsOpen" class="notification-container">
      <template v-if="notifications.length > 0">
        <div 
          v-for="(notification, index) in notifications" 
          :key="index" 
          class="alert"
          :class="alertClass(notification.type)"
          role="alert"
        >
          {{ notification.message }}
          <button type="button" class="close" aria-label="Close" @click="removeNotification(index)">
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
export default {
  name: 'Notifications',
  data() {
    return {
      notificationsOpen: false,
      notifications: [
        { id: 1, type: "success", message: "Tu servicio ha sido aprobado" },
        { id: 2, type: "info", message: "Tienes una nueva respuesta en tu solicitud" }
      ]
    };
  },
  mounted() {
    // Listener para detectar clics fuera del componente.
    document.addEventListener('click', this.handleClickOutside);
    // Listener para detectar scroll y cerrar el componente.
    window.addEventListener('scroll', this.handleScroll);
    // Listener para el evento personalizado que cierra las notificaciones.
    window.addEventListener('closeNotifications', this.handleCloseNotifications);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('closeNotifications', this.handleCloseNotifications);
  },
  methods: {
    alertClass(type) {
      return `alert-${type}`;
    },
    toggleNotifications() {
      this.notificationsOpen = !this.notificationsOpen;
    },
    removeNotification(index) {
      this.notifications.splice(index, 1);
    },
    handleClickOutside(event) {
      // Si el clic ocurre fuera del componente, cierra el menú de notificaciones.
      if (!this.$el.contains(event.target)) {
        this.notificationsOpen = false;
      }
    },
    handleScroll() {
      // Al hacer scroll, cierra las notificaciones.
      this.notificationsOpen = false;
    },
    handleCloseNotifications() {
      // Maneja el evento personalizado para cerrar notificaciones.
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
  color: white; /* Color blanco para el botón y el icono */
  position: relative;
}

/* Asegura que el icono de Font Awesome herede el color blanco */
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

/* Estilos para cada notificación */
.alert {
  padding: 6px 10px;
  margin-bottom: 6px;
  font-size: 0.9rem;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Cambios de fondo según el tipo */
.alert-success {
  background-color: #d4edda;
  color: #155724;
}
.alert-info {
  background-color: #d1ecf1;
  color: #0c5460;
}

/* Estilo del botón de cerrar notificación */
.close {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: inherit;
}

/* Estilo para el mensaje cuando no hay notificaciones */
.empty-message {
  padding: 10px;
  text-align: center;
  color: #555;
  font-size: 0.9rem;
}
</style>
