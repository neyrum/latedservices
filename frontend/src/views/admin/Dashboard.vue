<template>
  <div class="wrapper">
    <Navbar />
    <Sidebar @section-change="setActiveSection" />
    <div class="content-wrapper">
      <div class="container-fluid mt-4">
        <!-- Sección Overview -->
        <DashboardHome v-if="activeSection === 'overview'" @section-change="setActiveSection" />

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

        <!-- Sección de Chat -->
        <template v-else-if="activeSection === 'chat'">
          <h2 class="dashboard-title">Comunicación en Tiempo Real</h2>
          <!-- Se renderiza el chat solo si existen userId y receiverId -->
          <div v-if="userId && receiverId">
            <ChatComponent
              :userId="userId"
              :receiverId="receiverId"
              :role="isAdmin ? 'admin' : 'client'"
              @receiver-changed="updateReceiverId"
            />
          </div>
          <div v-else>
            <p>Cargando datos del usuario...</p>
          </div>
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
import ChatComponent from "@/components/ChatComponent.vue";

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
    ChatComponent,
  },
  data() {
    return {
      activeSection: "overview", // Sección por defecto
      receiverId: null,         // Se asigna dinámicamente, se actualizará al montar o mediante evento
    };
  },
  computed: {
    // Retorna el ID del usuario si existe en el store (caso cliente o admin)
    userId() {
      return this.$store.state.auth.userData?.id || null;
    },
    // Determina si el usuario autenticado es admin o superadmin
    isAdmin() {
      const role = this.$store.state.auth.userData?.role;
      return role === "admin" || role === "superadmin";
    },
  },
  methods: {
    // Cambia la sección activa del dashboard
    setActiveSection(section) {
      this.activeSection = section;
    },
    // Actualiza el receiverId a partir del evento recibido del ChatComponent
    updateReceiverId(newReceiverId) {
      this.receiverId = newReceiverId;
    },
  },
  mounted() {
    // Asigna un valor inicial a receiverId; se puede obtener del store u otro mecanismo – aquí se asigna 1 como fallback
    if (this.$store.state.chat && this.$store.state.chat.activeReceiverId) {
      this.receiverId = this.$store.state.chat.activeReceiverId;
    } else {
      this.receiverId = 1; // O asigna null si prefieres forzar la selección
    }
    console.log("Datos del usuario en store:", this.$store.state.auth.userData);
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
  margin-top: 60px; /* Espacio para el Navbar */
  margin-left: 250px; /* Espacio para el Sidebar */
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
