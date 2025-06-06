<template>
  <div class="dashboard-home">
    <!-- Vista para Super Administradores -->
    <template v-if="isSuperAdmin">
      <h2 class="dashboard-title">Super Admin Dashboard</h2>
      <p class="dashboard-subtitle">
        Bienvenido, {{ userData.name }}. Aquí puedes administrar todo el sistema.
      </p>
      <div class="cards">
        <!-- Se recorre el arreglo modificado que incluye imágenes y botones -->
        <DashboardCard 
          v-for="card in updatedSuperAdminCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :image="card.image"
          :buttonText="card.buttonText"
          :buttonIcon="card.buttonIcon"
          @navigate="card.navigate"
        />
      </div>
    </template>

    <!-- Vista para Administradores -->
    <template v-else-if="isAdmin">
      <h2 class="dashboard-title">Admin Dashboard</h2>
      <div class="cards">
        <DashboardCard
          v-for="card in adminCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
        />
      </div>
    </template>

    <!-- Vista para Usuarios Regulares -->
    <template v-else-if="isUser">
      <h2 class="dashboard-title">User Dashboard</h2>
      <p class="dashboard-subtitle">
        Bienvenido, {{ userData.name }}. Aquí tienes tu información personalizada.
      </p>
      <div class="cards">
        <!-- Tarjetas para usuario: se muestran sin personalización especial -->
        <DashboardCard title="Servicios Activos" :value="userServicesCount || 0" />
        <DashboardCard title="Solicitudes Pendientes" :value="userPendingCountComputed" />
      </div>
    </template>

    <!-- Vista genérica para roles sin contenido específico -->
    <template v-else>
      <h2 class="dashboard-title">Dashboard</h2>
      <p class="dashboard-subtitle">
        Tu rol no tiene contenido específico.
      </p>
    </template>

    <!-- Sección de gráficos (para Admin/SuperAdmin) -->
    <div
      class="stats-container"
      v-if="(isSuperAdmin || isAdmin) && requestsChartData.labels.length"
    >
      <DashboardChart title="Solicitudes Totales" :chartData="requestsChartData" />
      <DashboardChart title="Servicios Activos" :chartData="servicesChartData" />
    </div>

    <!-- Gráfico de evolución total de usuarios (para Admin/SuperAdmin) -->
    <div
      class="stats-container"
      v-if="(isSuperAdmin || isAdmin) && totalUsersChartData.labels.length"
    >
      <DashboardLineChart title="Evolución Total de Usuarios" :chartData="totalUsersChartData" />
    </div>

    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import DashboardCard from "@/components/DashboardCard.vue";
import DashboardChart from "@/components/DashboardChart.vue";
import DashboardLineChart from "@/components/DashboardLineChart.vue";
import RequestHistory from "@/views/client/RequestHistory.vue"; // se importa, pero no se usa aquí
import { mapState } from "vuex";

export default {
  name: "DashboardHome",
  components: { DashboardCard, DashboardChart, DashboardLineChart, RequestHistory },
  data() {
    return {
      summary: {
        totalRequests: 0,
        activeServices: 0,
        pendingRequests: 0,
        totalUsers: 0,
        systemLogs: 0,
      },
      userServicesCount: 0,
      errorMessage: "",
      // Datos para las gráficas
      requestsChartData: { labels: [], datasets: [] },
      servicesChartData: { labels: [], datasets: [] },
      totalUsersChartData: { labels: [], datasets: [] },
    };
  },
  computed: {
    userData() {
      return this.$store.getters["auth/userData"] || {};
    },
    userRole() {
      return this.userData.role || "";
    },
    isSuperAdmin() {
      return this.userRole === "superadmin";
    },
    isAdmin() {
      return this.userRole === "admin";
    },
    isUser() {
      return this.userRole === "client";
    },
    adminCards() {
      return [
        { title: "Total de Solicitudes", value: this.summary.totalRequests || 0 },
        { title: "Servicios Activos", value: this.summary.activeServices || 0 },
        { title: "Solicitudes Pendientes", value: this.summary.pendingRequests || 0 },
      ];
    },
    superAdminCards() {
      return [
        { title: "Total de Usuarios", value: this.summary.totalUsers || 0 },
        { title: "Total de Solicitudes", value: this.summary.totalRequests || 0 },
        { title: "Solicitudes Pendientes", value: this.summary.pendingRequests || 0 },
        { title: "Servicios Activos", value: this.summary.activeServices || 0 },
     // { title: "Registros del Sistema", value: this.summary.systemLogs || 0 },
      ];
    },
    // Creamos un arreglo modificado para SuperAdmin que incluye imagen y navegación para cada tarjeta
    updatedSuperAdminCards() {
      return this.superAdminCards.map(card => {
        if (card.title === "Total de Usuarios") {
          return {
            ...card,
            // Asegúrate de tener la imagen en la ruta indicada; con require se resuelve la ruta correctamente.
            image: require("@/assets/img/user-icon.png"),
            buttonText: "Ver usuarios",
            buttonIcon: "fas fa-users",
            navigate: this.goToUsersPage,
          };
        } else if (card.title === "Total de Solicitudes") {
          return {
            ...card,
            image: require("@/assets/img/document-icon.png"),
            buttonText: "Ver solicitudes",
            buttonIcon: "fas fa-file-alt",
            navigate: this.goToRequestsPage,
          };
        } else if (card.title === "Servicios Activos") {
          return {
            ...card,
            image: require("@/assets/img/activo-digital icon.png"),
            buttonText: "Ver servicios",
            buttonIcon: "fas fa-chart-line",
            navigate: this.goToServicesPage,
          };
        } else if (card.title === "Solicitudes Pendientes") {
          return {
            ...card,
            image: require("@/assets/img/solicitud-pendiente icon.png"),
            buttonText: "Ver pendientes",
            buttonIcon: "fas fa-hourglass-half",
            navigate: () => { /* Función de navegación para pendientes, si se requiere */ },
          };
        } else if (card.title === "Registros del Sistema") {
          return {
            ...card,
            buttonText: "Ver registros",
            buttonIcon: "fas fa-list",
            navigate: () => { /* Función de navegación para registros, si se requiere */ },
          };
        }
        return card;
      });
    },
    // Mapeamos del módulo Vuex 'requests'
    ...mapState("requests", {
      requests: (state) => state.requests,
    }),
    // Propiedad computada para calcular solicitudes pendientes
    userPendingCountComputed() {
      if (!this.requests) return 0;
      return this.requests.filter(req => req.status === "pending").length;
    },
  },
  created() {
    this.fetchSummary();
    this.fetchUserStats();
    this.fetchActiveServices();
    // Despachar acción para obtener solicitudes reales del usuario
    this.$store.dispatch("requests/fetchRequests");
  },
  methods: {
    async fetchSummary() {
      try {
        const response = await axios.get("/admin/summary");
        this.summary = response.data;

        // Actualizamos datos para los gráficos (simulación y algunos valores fijos)
        this.requestsChartData = {
          labels: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo",
            "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ],
          datasets: [
            {
              label: "Solicitudes Totales",
              backgroundColor: "#345896",
              data: [
                this.summary.totalRequests,
                25,
                40,
                35,
                50,
              ],
            },
          ],
        };

        this.servicesChartData = {
          labels: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo",
            "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ],
          datasets: [
            {
              label: "Servicios Activos",
              backgroundColor: "#28a745",
              data: [
                this.summary.activeServices,
                20,
                30,
                35,
                45,
              ],
            },
          ],
        };

        this.totalUsersChartData = {
          labels: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo",
            "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ],
          datasets: [
            {
              label: "Total de Usuarios",
              borderColor: "#FF6384",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              data: [100, 150, 200, 250, 500, this.summary.totalUsers || 300],
              fill: true,
            },
          ],
        };
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al cargar datos de resumen.";
      }
    },
    async fetchUserStats() {
      try {
        // Lógica para obtener estadísticas adicionales del usuario (aquí se puede agregar si es necesario)
      } catch (error) {
        console.error("Error al cargar datos del usuario", error);
      }
    },
    async fetchActiveServices() {
      try {
        const response = await axios.get("/services/active", {
          headers: {
            Authorization: `Bearer ${this.$store.getters["auth/token"]}`,
          },
        });
        this.userServicesCount = response.data.data.length;
        console.log("Servicios activos obtenidos:", response.data.data);
      } catch (error) {
        console.error("Error al obtener servicios activos:", error);
        this.errorMessage =
          error.response?.data?.message || "Error al cargar servicios activos.";
      }
    },
    goToUsersPage() {
    // Emite el evento "section-change" con el valor "usersManagement"
    this.$emit("section-change", "usersManagement");
    },
    // Si tienes otros métodos de navegación (requests, services), puedes también adaptarlos
    goToRequestsPage() {
    this.$emit("section-change", "manageRequests");
    },
    goToServicesPage() {
    this.$emit("section-change", "manageServices");
    },
  },
};
</script>

<style scoped>
.dashboard-home {
  padding: 20px;
  text-align: center;
}

.dashboard-title {
  font-size: 26px;
  font-weight: bold;
  color: #345896;
  margin-bottom: 20px;
  text-transform: uppercase;
}

.dashboard-subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
}

.cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-top: 20px;
}

.error {
  margin-top: 20px;
  color: #d9534f;
  font-size: 14px;
}
</style>
