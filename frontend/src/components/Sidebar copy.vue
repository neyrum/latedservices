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

      <div class="menu-dropdown">
        <button @click="toggleServices">
          <i class="fas fa-cogs"></i> Gestión de Servicios
          <i class="fas" :class="{ 'fa-chevron-down': !showServices, 'fa-chevron-up': showServices }"></i>
        </button>
        <div v-show="showServices" class="dropdown-content">
          <!-- Para este ejemplo, se decide que al hacer clic se muestre la sección "manageServices" -->
          <button class="dropdown-item" @click="changeSection('manageServices')">
            Ver / Agregar Servicio
          </button>
        </div>
      </div>

      <div class="menu-dropdown">
        <button @click="toggleUsers">
          <i class="fas fa-users"></i> Gestión de Usuarios
          <i class="fas" :class="{ 'fa-chevron-down': !showUsers, 'fa-chevron-up': showUsers }"></i>
        </button>
        <div v-show="showUsers" class="dropdown-content">
          <!-- Al hacer clic, se muestra la sección para administración de usuarios -->
          <button class="dropdown-item" @click="changeSection('usersManagement')">
            Lista / Agregar Usuario
          </button>
        </div>
      </div>
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
    };
  },
  methods: {
    toggleServices() {
      this.showServices = !this.showServices;
    },
    toggleUsers() {
      this.showUsers = !this.showUsers;
    },
    changeSection(section) {
      // Emitir el evento "section-change" con el nombre de la sección
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
