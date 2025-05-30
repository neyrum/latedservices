<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>Dashboard</h3>
    </div>

    <nav class="sidebar-menu">
      <!-- Botón para volver al contenido principal ("overview") -->
      <button class="menu-item" @click="changeSection('overview')">
        <i class="fas fa-home"></i> Dashboard
      </button>

      <!-- Opciones solo para administradores -->
      <template v-if="isAdminOrSuperAdmin">

        <!-- Gestión de Servicios -->
        <div class="menu-dropdown">
          <button @click="toggleServices">
            <i class="fas fa-cogs"></i> Gestión de Servicios
            <i class="fas" :class="{ 'fa-chevron-down': !showServices, 'fa-chevron-up': showServices }"></i>
          </button>
          <div v-show="showServices" class="dropdown-content">
            <button class="dropdown-item" @click="changeSection('manageServices')">
              Ver / Agregar Servicio
            </button>
          </div>
        </div>

        <!-- Gestión del Portafolio -->
        <div class="menu-dropdown">
        <button @click="togglePortfolio">
          <i class="fas fa-briefcase"></i> Gestión de Portafolio
          <i class="fas" :class="{ 'fa-chevron-down': !showPortfolio, 'fa-chevron-up': showPortfolio }"></i>
        </button>
        <div v-show="showPortfolio" class="dropdown-content">
           <button class="dropdown-item" @click="changeSection('portfolioManagement')">
            Ver / Agregar al Portafolio
           </button>
          </div>
        </div>

        <!-- Gestión de Usuarios -->
        <div class="menu-dropdown">
          <button @click="toggleUsers">
            <i class="fas fa-users"></i> Gestión de Usuarios
            <i class="fas" :class="{ 'fa-chevron-down': !showUsers, 'fa-chevron-up': showUsers }"></i>
          </button>
          <div v-show="showUsers" class="dropdown-content">
            <button class="dropdown-item" @click="changeSection('usersManagement')">
              Lista / Agregar Usuario
            </button>
          </div>
        </div>

       <!-- Gestión de Solicitudes -->
       <div class="menu-dropdown">
         <button @click="toggleRequests">
         <i class="fas fa-list-alt"></i> Gestión de Solicitud
         <i class="fas" :class="{ 'fa-chevron-down': !showRequests, 'fa-chevron-up': showRequests }"></i>
         </button>
       <div v-show="showRequests" class="dropdown-content">
       <button class="dropdown-item" @click="changeSection('manageRequests')">
      Ver / Solicitudes
    </button>
  </div>
</div>

      </template>

      <!-- Opciones solo para clientes -->
      <template v-if="isUser">
        <div class="menu-dropdown">
          <button class="menu-item" @click="changeSection('requestHistory')">
            <i class="fas fa-history"></i> Historial de Solicitudes
          </button>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
  data() {
    return {
      showServices: false,
      showUsers: false,
      showRequests: false,
      showPortfolio: false,
    };
  },
  computed: {
    userData() {
      return this.$store.getters["auth/userData"] || {};
    },
    userRole() {
      return this.userData.role || "";
    },
    isAdminOrSuperAdmin() {
      return this.userRole === "admin" || this.userRole === "superadmin";
    },
    isUser() {
      return this.userRole === "client";
    },
  },
  methods: {
    toggleServices() {
      this.showServices = !this.showServices;
    },
    toggleUsers() {
      this.showUsers = !this.showUsers;
    },
     toggleRequests() {
    this.showRequests = !this.showRequests;
    },
    togglePortfolio() {
    this.showPortfolio = !this.showPortfolio;
  },
    changeSection(section) {
      this.$emit("section-change", section);
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: #345896;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.menu-item {
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}
.menu-dropdown {
  display: flex;
  flex-direction: column;
}
.menu-dropdown button {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  cursor: pointer;
  transition: 0.3s;
}
.menu-dropdown button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}
.dropdown-content {
  display: flex;
  flex-direction: column;
  padding-left: 15px;
}
.dropdown-item {
  padding: 8px;
  background: none;
  border: none;
  color: #aaa;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: 0.3s;
}
.dropdown-item:hover {
  color: white;
}
</style>
