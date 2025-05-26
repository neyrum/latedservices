<template>
  <div class="user-menu d-flex align-items-center">
    <span class="text-light me-2 welcome-text">Bienvenido, {{ userName }}</span>
    <div class="dropdown">
      <a
        class="nav-link dropdown-toggle d-flex align-items-center"
        href="#"
        id="userDropdown"
        role="button"
        @click.prevent.stop="toggleDropdown"
        :aria-expanded="dropdownOpen"
      >
      <img
  :src="userProfilePicture || '/default-profile.jpg'"
  alt="Foto de Perfil"
  class="rounded-circle me-2"
  width="40"
  height="40"
  @error="handleImageError"
/>


      </a>
      <!-- El menú siempre se renderiza y se le añade la clase "show" si dropdownOpen es true -->
      <ul class="dropdown-menu dropdown-menu-end mt-2" :class="{ show: dropdownOpen }">
        <li>
          <router-link
            class="dropdown-item"
            to="/profile"
            exact-active-class="active"
          >
            Mi Perfil
          </router-link>
        </li>
        <li>
          <router-link
            class="dropdown-item"
            to="/client/services"
            exact-active-class="active"
          >
            Servicios
          </router-link>
        </li>
        <li>
          <router-link
            class="dropdown-item"
            to="/dashboard"
            exact-active-class="active"
          >
            Dashboard
          </router-link>
        </li>
        <li>
          <button class="dropdown-item" @click="logout">Cerrar Sesión</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { eventBus } from "@/utils/eventBus";
import defaultProfileImage from '@/assets/img/default-profile.jpg';

export default {
  name: 'UserMenu',
  props: {
    userName: {
      type: String,
      required: true
    },
    userProfilePicture: {
      type: String,
      required: false,
      default: defaultProfileImage
    }
  },
  data() {
    return {
      dropdownOpen: false
    };
  },
  mounted() {
    // Escucha para cerrar el dropdown si se hace clic fuera del componente
    document.addEventListener('click', this.handleClickOutside);

    // 🔹 Escuchar el evento con `mitt`
    eventBus.on("profileUpdated", (newProfilePicture) => {
      this.userProfilePicture = newProfilePicture;
      console.log("Imagen de perfil actualizada en UserMenu.");
    });
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);

    // 🔹 Eliminar el evento al desmontar el componente
    eventBus.off("profileUpdated");
  },
  methods: {
    toggleDropdown() {
      // Al abrir/cerrar el menú, dispara el evento para cerrar las notificaciones
      window.dispatchEvent(new CustomEvent('closeNotifications'));
      this.dropdownOpen = !this.dropdownOpen;
    },
    handleClickOutside(event) {
      // Si el clic ocurre fuera del componente, se cierra el dropdown
      if (!this.$el.contains(event.target)) {
        this.dropdownOpen = false;
      }
    },
    logout() {
      this.$emit('logout');
    },
    handleImageError(event) {
     event.target.src = defaultProfileImage;
    }
  }
};
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Estilo para subir el mensaje "Bienvenido, ..." */
.welcome-text {
  align-self: flex-start;
  margin-top: 8px; /* Ajusta este valor a tus necesidades */
}

.dropdown {
  position: relative;
}

.nav-link.dropdown-toggle {
  cursor: pointer;
}

.rounded-circle {
  object-fit: cover;
}

/* Estilos personalizados para el contenedor del menú */
.dropdown-menu {
  background-color: #ffffff;      /* Fondo blanco */
  border: 1px solid #cccccc;      /* Borde gris claro */
  border-radius: 6px;             /* Bordes redondeados */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Sombra sutil */
  padding: 5px 0;
  z-index: 2000;
  min-width: 150px;
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;  /* Separación del toggler */
  display: none;    /* Oculto por defecto */
}

/* Cuando dropdownOpen es true se añade la clase "show" y cambia a display: block */
.dropdown-menu.show {
  display: block;
}

/* Estilos para cada opción del menú */
.dropdown-item {
  padding: 8px 12px;
  color: #333333;
  transition: background-color 0.3s ease;
  text-decoration: none;
  display: block;
}

/* Cambio de fondo y color al hacer hover o focus */
.dropdown-item:hover,
.dropdown-item:focus {
  background-color: #f0f0f0;
  color: #202020;
}

/* Estilo para la opción activa */
.dropdown-item.active {
  background-color: #345996;
  color: #ffffff;
}

/* Para el botón "Cerrar Sesión" dentro del dropdown */
.dropdown-item button {
  background: none;
  border: none;
  padding: 0;
  color: inherit;
  width: 100%;
  text-align: left;
}
</style>
