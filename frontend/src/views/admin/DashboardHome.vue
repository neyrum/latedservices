<template>
  <div class="dashboard-home">
    <!-- Vista para Super Administradores -->
    <template v-if="isSuperAdmin">
      <h2 class="dashboard-title">Super Admin Dashboard</h2>
      <p class="dashboard-subtitle">
        Bienvenido, {{ userData.name }}. Aquí puedes administrar todo el sistema.
      </p>
      <div class="cards">
        <DashboardCard
          v-for="card in superAdminCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
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
        <!-- Aquí se muestra la cantidad de servicios activos (simulada o real) -->
        <DashboardCard title="Servicios Activos" :value="userServicesCount || 0" />
        <!-- Se utiliza la propiedad computada para contar dinámicamente las solicitudes pendientes -->
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

    <!-- Sección de gráficos de los datos existentes (para Admin/SuperAdmin) -->
    <div
      class="stats-container"
      v-if="(isSuperAdmin || isAdmin) && requestsChartData.labels.length"
    >
      <DashboardChart title="Solicitudes Totales" :chartData="requestsChartData" />
      <DashboardChart title="Servicios Activos" :chartData="servicesChartData" />
    </div>

    <!-- Sección de gráfico para la evolución del total de usuarios (para Admin/SuperAdmin) -->
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
      // Eliminamos el valor estático de userPendingCount; usaremos la propiedad computada.
      errorMessage: "",
      // Datos para gráficas:
      requestsChartData: {
        labels: [],
        datasets: [],
      },
      servicesChartData: {
        labels: [],
        datasets: [],
      },
      totalUsersChartData: {
        labels: [],
        datasets: [],
      },
    };
  },
  computed: {
    userData() {
      // Obtiene los datos del usuario desde Vuex
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
        { title: "Servicios Activos", value: this.summary.activeServices || 0 },
        { title: "Solicitudes Pendientes", value: this.summary.pendingRequests || 0 },
        { title: "Registros del Sistema", value: this.summary.systemLogs || 0 },
      ];
    },
    // Mapear el estado 'requests' del módulo Vuex 'requests'
    ...mapState("requests", {
      requests: (state) => state.requests,
    }),
    // Propiedad computada para contar las solicitudes pendientes filtrando por status "pending"
    userPendingCountComputed() {
      if (!this.requests) return 0;
      return this.requests.filter(req => req.status === "pending").length;
    },
  },
  created() {
    this.fetchSummary();
    this.fetchUserStats();
    this.fetchActiveServices();
    // Despacha la acción para obtener la información real de solicitudes del usuario
    this.$store.dispatch("requests/fetchRequests");
  },
  methods: {
    async fetchSummary() {
      try {
        const response = await axios.get("/admin/summary");
        this.summary = response.data;

        // Actualizar datos del gráfico de solicitudes
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

        // Actualizar datos del gráfico de servicios
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

        // Datos simulados para gráfico de evolución de usuarios (reemplaza según tu API)
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
        // Para los servicios activos, se simula un valor o lo obtienes desde otra API
        // this.userServicesCount = 3;
        // Ya no se asigna userPendingCount de forma estática, pues se calcula con la propiedad computada.
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
      // Se actualiza la propiedad 'userServicesCount' con la cantidad de servicios activos
      this.userServicesCount = response.data.data.length;
      console.log("Servicios activos obtenidos:", response.data.data);
    } catch (error) {
      console.error("Error al obtener servicios activos:", error);
      this.errorMessage =
        error.response?.data?.message || "Error al cargar servicios activos.";
    }
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
