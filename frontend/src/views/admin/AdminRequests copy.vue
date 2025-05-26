<template>
  <div class="admin-requests">
    <h3 class="dashboard-title">Solicitudes Pendientes</h3>

    <p v-if="isLoading">Cargando solicitudes...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <table v-if="requests.length > 0" class="table table-striped">
      <thead>
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Servicio</th>
          <th>Estado</th>
          <th>Fecha Preferida</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in requests" :key="request.id">
          <td>{{ request.id }}</td>
          <td>{{ request.client?.name || "Sin asignar" }}</td>
          <td>{{ request.service?.name }}</td>
          <td :class="statusClass(request.status)">
            <i :class="statusIcon(request.status)"></i> {{ capitalizeStatus(request.status) }}
          </td>
          <td>{{ new Date(request.preferredDate).toLocaleDateString() }}</td>
          <td class="action-buttons">
            <!-- Botón de Aprobación -->
            <button 
              class="icon-btn text-success" 
              @click="updateRequestStatus(request.id, 'aprobado')" 
              :disabled="!canTransition(request.status, 'aprobado')">
              <i class="fas fa-check-circle"></i>
              <span class="tooltip">Aprobar</span>
            </button>

            <!-- Botón de Rechazo -->
            <button 
              class="icon-btn text-danger" 
              @click="updateRequestStatus(request.id, 'rechazado')" 
              :disabled="!canTransition(request.status, 'rechazado')">
              <i class="fas fa-times-circle"></i>
              <span class="tooltip">Rechazar</span>
            </button>

            <!-- Botón de Detalles -->
            <button class="icon-btn text-info" @click="goToDetails(request.id)">
              <i class="fas fa-eye"></i>
              <span class="tooltip">Ver detalles</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!isLoading && requests.length === 0">No hay solicitudes pendientes.</p>
  </div>
</template>

<script>
import axios from "@/plugins/axios";

export default {
  name: "AdminRequests",
  data() {
    return {
      requests: [],
      isLoading: false,
      errorMessage: ""
    };
  },
  created() {
    this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      this.isLoading = true;
      try {
        const response = await axios.get("/requests", {
          headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] }
        });
        this.requests = response.data.data || response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error al cargar las solicitudes.";
      } finally {
        this.isLoading = false;
      }
    },
    async updateRequestStatus(requestId, newStatus) {
      try {
        await axios.put(`/requests/${requestId}/status`, { status: newStatus }, {
          headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] }
        });
        this.fetchRequests();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al actualizar solicitud.";
        console.error("Error al actualizar solicitud:", error);
      }
    },
    goToDetails(requestId) {
      console.log("Navegando a detalles de la solicitud ID:", requestId);
      this.$router.push({ name: "request-details", params: { id: requestId } });
    },
    capitalizeStatus(status) {
      if (!status) return "";
      
      const statusMap = {
        "en_progreso": "Activo"
      };

      return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    },
    canTransition(currentStatus, targetStatus) {
      const transitions = {
        pendiente: ["aprobado", "rechazado"],
        aprobado: ["en_progreso"],
        en_progreso: ["completado", "cancelado"],
        completado: [],
        cancelado: [],
        rechazado: []
      };
      return transitions[currentStatus]?.includes(targetStatus) || false;
    },
    statusClass(status) {
      const statusMap = {
        pendiente: "bg-warning text-dark",
        aprobado: "bg-info text-white",
        rechazado: "bg-danger text-white",
        en_progreso: "bg-primary text-white",
        completado: "bg-success text-white",
        cancelado: "bg-secondary text-white"
      };
      return statusMap[status] || "bg-light";
    },
    statusIcon(status) {
      const iconMap = {
        pendiente: "fas fa-hourglass-start text-warning",
        aprobado: "fas fa-check-circle text-info",
        rechazado: "fas fa-times-circle text-danger",
        en_progreso: "fas fa-spinner text-primary",
        completado: "fas fa-check text-success",
        cancelado: "fas fa-ban text-secondary"
      };
      return iconMap[status] || "fas fa-question-circle text-muted";
    }
  }
};
</script>

<style scoped>
.dashboard-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 15px;
}

.table {
  width: 100%;
  margin-top: 20px;
}

/* Estilo para los botones con íconos */
.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 5px;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s, opacity 0.3s;
}

/* Efecto al pasar el mouse */
.icon-btn:hover {
  transform: scale(1.2);
  opacity: 0.8;
}

/* Botón deshabilitado */
.icon-btn:disabled {
  color: gray !important;
  cursor: not-allowed;
  opacity: 0.5;
}

/* Estilo para mostrar el tooltip */
.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 5px 10px;
  font-size: 0.8rem;
  white-space: nowrap;
  border-radius: 4px;
  visibility: hidden;
  opacity: 0;
  transition: visibility 0.2s, opacity 0.2s;
}

/* Mostrar el tooltip cuando se pasa el cursor */
.icon-btn:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

/* Clases para colores de estado */
.bg-warning { background-color: #ffc107; }
.bg-info { background-color: #17a2b8; }
.bg-danger { background-color: #dc3545; }
.bg-primary { background-color: #007bff; }
.bg-success { background-color: #28a745; }
.bg-secondary { background-color: #6c757d; }
.bg-light { background-color: #f8f9fa; }

.text-dark { color: black; }
.text-white { color: white; }
</style>
