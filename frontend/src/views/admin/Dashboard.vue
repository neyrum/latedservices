<template>
  <div class="wrapper">
    <Navbar />
    <!-- Escuchamos el evento "section-change" para actualizar activeSection -->
    <Sidebar @section-change="setActiveSection" />
    <div class="content-wrapper">
      <div class="container-fluid mt-4">
        <!-- Sección Overview -->
        <DashboardHome v-if="activeSection === 'overview'" />
        
        <!-- Sección de Gestión de Servicios -->
        <template v-else-if="activeSection === 'manageServices'">
          <h2 class="dashboard-title">Gestión de Servicios</h2>
          <ManageServices mode="manage" />
        </template>

        <!-- Sección de Gestión de Portafolio -->
        <template v-else-if="activeSection === 'portfolioManagement'">
          <h2 class="dashboard-title">Gestión de Portafolio</h2>
          <ManagePortfolio />
        </template>
        
        <!-- Sección de Gestión de Usuarios -->
        <template v-else-if="activeSection === 'usersManagement'">
          <h2 class="dashboard-title">Gestión de Usuarios</h2>
          <UsersManagement />
        </template>

        <!-- Sección para gestionar solicitudes -->
       <template v-else-if="activeSection === 'manageRequests'">
       <h2 class="dashboard-title">Gestión de Solicitudes</h2>
       <AdminRequests />
       </template>

        <!-- Sección para Historial de Solicitudes -->
        <template v-else-if="activeSection === 'requestHistory'">
          <h2 class="dashboard-title">Historial de Solicitudes</h2>
          <RequestHistory />
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import Sidebar from "@/components/Sidebar.vue";
import ManageServices from "@/views/admin/ManageServices.vue";
import ManagePortfolio from "@/views/admin/ManagePortfolio.vue";
import DashboardHome from "@/views/admin/DashboardHome.vue";
import UsersManagement from "@/views/admin/UsersManagement.vue";
import AdminRequests from "@/views/admin/AdminRequests.vue";
import RequestHistory from "@/views/client/RequestHistory.vue";

export default {
  name: "Dashboard",
  components: {
    Navbar,
    Sidebar,
    ManageServices,
    ManagePortfolio,
    DashboardHome,
    UsersManagement,
    AdminRequests,
    RequestHistory,
  },
  data() {
    return {
      activeSection: "overview", // Por defecto se muestra el overview
    };
  },
  methods: {
    setActiveSection(section) {
      this.activeSection = section;
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content-wrapper {
  flex: 1;
  margin-top: 60px;    /* Espacio para el Navbar */
  margin-left: 250px;  /* Espacio para el Sidebar */
  padding: 20px;
  transition: margin-left 0.3s ease;
}
.dashboard-title {
  font-size: 24px;
  font-weight: bold;
  color: #345896;
  margin-bottom: 15px;
}
</style>
