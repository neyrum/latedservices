<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
    <div class="container">
      <!-- Logo y nombre del proyecto -->
      <router-link class="navbar-brand fw-bold text-uppercase" to="/">
        <img
          :src="logo"
          alt="Logo de Servicios de Lated"
          class="d-inline-block align-text-top me-2 logo"
        />
        Plataforma de Servicios
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <template v-if="!isServiciosDisponiblesPage && !isDashboardPage">
            <li class="nav-item">
              <a class="nav-link" href="#services">Servicios</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#portfolio">Portafolio</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#about">Sobre Nosotros</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#team">Equipo</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#contact">Contacto</a>
            </li>
          </template>

          <li class="nav-item" v-if="!isHomePage">
            <router-link class="nav-link" to="/">
              <i class="fas fa-home text-white fs-4"></i>
            </router-link>
          </li>

          <li class="nav-item d-none d-lg-block align-items-center mt-2">
            <span class="text-white mx-3">|</span>
          </li>

          <li class="nav-item ms-2" v-if="!isAuthenticated">
            <router-link class="nav-link btn-custom" to="/login">Accede</router-link>
          </li>
          <li class="nav-item ms-2" v-if="!isAuthenticated">
            <router-link class="nav-link btn-custom" to="/register">Regístrate</router-link>
          </li>

          <!-- Menú de usuario -->
          <UserMenu
            v-if="isAuthenticated"
            :userName="userName"
            :userProfilePicture="userProfilePicture"
            @logout="logout"
          />

          <!-- Campana de notificaciones -->
          <li class="nav-item ms-2" v-if="isAuthenticated">
            <Notifications />
          </li>

          <!-- Botón para cambiar entre Modo Oscuro/Claro (solo iconos) ubicado después de las notificaciones -->
          <li class="nav-item ms-2">
            <ThemeToggle />
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import logo from "@/assets/img/lated-logo.png";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { computed } from "vue";
import UserMenu from "./UserMenu.vue";
import Notifications from "./UserNotifications.vue";
import ThemeToggle from "@/components/ThemeToggle.vue";

export default {
  name: "Navbar",
  components: { UserMenu, Notifications, ThemeToggle },
  setup() {
    const store = useStore();
    const router = useRouter();

    const isAuthenticated = computed(() => store.getters["auth/isAuthenticated"]);
    const userName = computed(() => store.getters["auth/userData"]?.name || "Usuario");
    const userProfilePicture = computed(
      () => store.getters["auth/userData"]?.profilePicture || "default-profile.jpg"
    );

    const isServiciosDisponiblesPage = computed(
      () => router.currentRoute.value.path === "/client/services"
    );
    const isDashboardPage = computed(() => router.currentRoute.value.path === "/dashboard");
    const isHomePage = computed(() => router.currentRoute.value.path === "/");

    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/login");
    };

    return {
      isAuthenticated,
      userName,
      userProfilePicture,
      logout,
      isServiciosDisponiblesPage,
      isHomePage,
      isDashboardPage,
      logo,
    };
  },
};
</script>

<style scoped>
.navbar {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-size: 1.5rem;
  letter-spacing: 1px;
}

.btn-custom {
  color: white;
  border-radius: 25px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.btn-custom:hover {
  color: rgb(108, 233, 255);
}

/* Ajustes para el logo */
.navbar-brand img.logo {
  width: 50px; /* Ajusta el tamaño según sea necesario */
  height: auto;
  border-radius: 4px;
  filter: brightness(0) invert(1);
}
</style>
