<template>
  <div class="admin-requests">
    <h3 class="dashboard-title">{{ dynamicHeader }}</h3>

    <!-- Botones de exportación -->
    <div class="export-buttons">
      <button @click="downloadReport" class="btn-download">
        📄 Exportar Reporte PDF
      </button>
      <button @click="downloadExcel" class="btn-download">
        📊 Exportar Reporte Excel
      </button>
    </div>

    <!-- Controles de Filtro y Búsqueda -->
    <div class="filters">
      <!-- Input para búsqueda por ID, cliente o servicio -->
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar por ID, cliente o servicio">
      
      <!-- Select para filtrar por estado -->
      <select v-model="filterStatus" @change="updateFilters">
        <option value="">Todos los Estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobado">Aprobado</option>
        <option value="rechazado">Rechazado</option>
        <option value="en_progreso">En Progreso</option>
        <option value="completado">Completado</option>
        <option value="cancelado">Cancelado</option>
      </select>

      <input type="date" v-model="startDate" @change="updateFilters">
      <input type="date" v-model="endDate" @change="updateFilters">
      
      <!-- Select para elegir la clave de ordenamiento -->
      <select v-model="sortKey">
        <option value="preferredDate">Fecha Preferida</option>
        <!-- Puedes agregar más opciones como "priority" si lo manejas -->
      </select>
      
      <!-- Select para definir el orden -->
      <select v-model="sortOrder">
        <option value="asc">Ascendente</option>
        <option value="desc">Descendente</option>
      </select>
    </div>

    <!-- Mensajes de carga o error -->
    <p v-if="isLoading">Cargando solicitudes...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- Tabla de solicitudes (usamos la lista paginada para aplicar filtros y paginación) -->
    <table v-if="!isLoading && paginatedRequests.length > 0" class="table table-striped">
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
        <tr v-for="request in paginatedRequests" :key="request.id">
          <td>{{ request.id }}</td>
          <td>{{ request.client?.name || "Sin asignar" }}</td>
          <td>{{ request.service?.name }}</td>
          <td :class="statusClass(request.status)">
            <i :class="statusIcon(request.status)"></i>
            {{ capitalizeStatus(request.status) }}
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
            <!-- Botón para enviar notificación -->
            <button class="icon-btn text-primary" @click="openNotificationModal(request)">
              <i class="fas fa-envelope"></i>
              <span class="tooltip">Enviar notificación</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mensaje si no hay resultados tras filtrar -->
    <p v-if="!isLoading && filteredRequests.length === 0">
      No hay solicitudes que cumplan con los filtros.
    </p>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">
        <i class="fas fa-arrow-left"></i> Anterior 
      </button>  
      <span class="page-indicator">Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">
      Siguiente <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <!-- Modal para enviar notificación -->
    <div v-if="showNotificationModal" class="modal-overlay" @click.self="closeNotificationModal">
      <div class="modal-content">
        <h4>Enviar Notificación al Usuario</h4>
        <p v-if="modalUserName">Usuario: {{ modalUserName }}</p>
        <textarea v-model="modalMessage" placeholder="Escribe tu mensaje aquí..." rows="4"></textarea>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="sendNotification">Enviar</button>
          <button class="btn btn-secondary" @click="closeNotificationModal">Cancelar</button>
        </div>
        <p v-if="modalErrorMessage" class="error-message">{{ modalErrorMessage }}</p>
        <p v-if="modalSuccessMessage" class="success-message">{{ modalSuccessMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import { useToast } from "vue-toastification";
import "vue-toastification/dist/index.css";

export default {
  name: "AdminRequests",
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      // Datos obtenidos del backend
      requests: [],
      isLoading: false,
      errorMessage: "",
      // Filtros y ordenamiento
      searchQuery: "",
      filterStatus: "",
      sortKey: "preferredDate", // Cambia si tienes otro campo relevante
      sortOrder: "desc",
      // Paginación
      currentPage: 1,
      pageSize: 10,
      // Variables para el modal de notificación
      showNotificationModal: false,
      modalUserId: null,
      modalUserName: "",
      modalMessage: "",
      modalErrorMessage: "",
      modalSuccessMessage: ""
    };
  },
  created() {
    this.fetchRequests();
  },
  computed: {
    filteredRequests() {
      let result = [...this.requests];

      // FILTRAR POR RANGO DE FECHAS (Si el usuario selecciona fechas válidas)
      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        result = result.filter(r => {
        const requestDate = new Date(r.preferredDate);
        return requestDate >= start && requestDate <= end;
      });
    }
      
      // Filtrado por búsqueda
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(r =>
          String(r.id).toLowerCase().includes(query) ||
          (r.client && r.client.name.toLowerCase().includes(query)) ||
          (r.service && r.service.name.toLowerCase().includes(query))
        );
      }
      
      // Filtrado por estado
      if (this.filterStatus) {
        result = result.filter(r => r.status === this.filterStatus);
      }
      
      // Ordenamiento
      result.sort((a, b) => {
        const modifier = this.sortOrder === "asc" ? 1 : -1;
        const aValue = a[this.sortKey];
        const bValue = b[this.sortKey];
        if (aValue < bValue) return -1 * modifier;
        if (aValue > bValue) return 1 * modifier;
        return 0;
      });
      
      return result;
    },
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredRequests.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.pageSize);
    },
    dynamicHeader() {
    // Si no hay filtro (o si está vacío), se asume "Pendientes" por defecto.
    if (!this.filterStatus || this.filterStatus === "") {
      return "Todas las Solicitudes";
    }
    // Según el valor del filtro, retorna un título correspondiente.
    switch (this.filterStatus.toLowerCase()) {
      case "pendiente":
        return "Solicitudes Pendientes";
      case "aprobado":
        return "Solicitudes Aprobadas";
      case "rechazado":
        return "Solicitudes Rechazadas";
      case "en_progreso":
        return "Solicitudes en Progreso";
      case "completado":
        return "Solicitudes Completadas";
      case "cancelado":
        return "Solicitudes Canceladas";
      default:
        return "Todas las Solicitudes";
      }
    }
  },
  methods: {
    updateFilters() {
    this.currentPage = 1; // Reinicia la paginación al aplicar un filtro
  },
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
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    async updateRequestStatus(requestId, newStatus) {
      try {
        await axios.put(`/requests/${requestId}/status`, { status: newStatus }, {
          headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] }
        });
        this.fetchRequests();
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error al actualizar solicitud.";
        console.error("Error al actualizar solicitud:", error);
      }
    },
    goToDetails(requestId) {
      this.$router.push({ name: "request-details", params: { id: requestId } });
    },
    capitalizeStatus(status) {
      if (!status) return "";
      const statusMap = { "en_progreso": "Activo" };
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
    },
    async downloadReport() {
      try {
        const token = this.$store.getters["auth/token"];
        const apiUrl = process.env.VUE_APP_API_URL;
        const response = await axios.get(`${apiUrl}/requests/export`, {
          headers: { Authorization: "Bearer " + token },
          responseType: "blob"
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "reporte_servicios.pdf");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.toast.success("📄 El reporte PDF se ha descargado exitosamente");
      } catch (error) {
        console.error("Error al descargar el reporte PDF:", error);
        this.toast.error("❌ Hubo un problema al descargar el reporte PDF");
      }
    },
    async downloadExcel() {
      try {
        const token = this.$store.getters["auth/token"];
        const apiUrl = process.env.VUE_APP_API_URL;
        const response = await axios.get(`${apiUrl}/requests/export/excel`, {
          headers: { Authorization: "Bearer " + token },
          responseType: "blob"
        });
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "reporte_servicios.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.toast.success("📊 El reporte Excel se ha descargado exitosamente");
      } catch (error) {
        console.error("Error al descargar el reporte Excel:", error);
        this.toast.error("❌ Hubo un problema al descargar el reporte Excel");
      }
    },
    openNotificationModal(request) {
      if (request.client && request.client.id) {
        this.modalUserId = request.client.id;
        this.modalUserName = request.client.name || "Usuario";
        this.modalMessage = "";
        this.modalErrorMessage = "";
        this.modalSuccessMessage = "";
        this.showNotificationModal = true;
      } else {
        console.error("La solicitud no cuenta con un cliente asignado.");
      }
    },
    closeNotificationModal() {
      this.showNotificationModal = false;
    },
    async sendNotification() {
      try {
        await axios.post(
          "/notifications/send",
          { userId: this.modalUserId, message: this.modalMessage },
          { headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] } }
        );
        this.modalSuccessMessage = "Notificación enviada exitosamente.";
        setTimeout(() => {
          this.closeNotificationModal();
        }, 1500);
      } catch (error) {
        this.modalErrorMessage =
          error.response?.data?.message || "Error al enviar la notificación.";
        console.error("Error en sendNotification:", error);
      }
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
  border-collapse: collapse;
  margin-top: 20px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  padding: 5px;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s, opacity 0.3s;
}

.icon-btn:hover {
  transform: scale(1.2);
  opacity: 0.8;
}

.icon-btn:disabled {
  color: gray !important;
  cursor: not-allowed;
  opacity: 0.5;
}

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

.icon-btn:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.bg-warning {
  background-color: #ffc107;
}

.bg-info {
  background-color: #17a2b8;
}

.bg-danger {
  background-color: #dc3545;
}

.bg-primary {
  background-color: #007bff;
}

.bg-success {
  background-color: #28a745;
}

.bg-secondary {
  background-color: #6c757d;
}

.bg-light {
  background-color: #f8f9fa;
}

.text-dark {
  color: black;
}

.text-white {
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.error-message {
  color: #dc3545;
}

.success-message {
  color: #28a745;
}

/* Ajustes para la tabla y botones de acción */
.action-buttons {
  display: flex;
  gap: 5px;
}

.export-buttons {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.btn-download {
  background-color: #345996;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-download:hover {
  background-color: #0056b3;
}

/* Controles de filtros */
.filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}
.filters input,
.filters select {
  padding: 5px;
  font-size: 14px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #345996;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s;
  box-shadow: 0px 4px 6px rgba(0, 123, 255, 0.3);
}

.pagination-btn:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.pagination-btn:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
  box-shadow: none;
}

.page-indicator {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

</style>
