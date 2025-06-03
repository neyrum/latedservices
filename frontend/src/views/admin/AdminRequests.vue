<template>
  <div class="admin-requests">
    <h3 class="dashboard-title">Solicitudes Pendientes</h3>

     <!-- Botones de exportación -->
    <div class="export-buttons">
      <button @click="downloadReport" class="btn-download">
        📄 Exportar Reporte PDF
      </button>

      <button @click="downloadExcel" class="btn-download">
        📊 Exportar Reporte Excel
      </button>
    </div>

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

            <!-- Botón para enviar notificación -->
            <button class="icon-btn text-primary" @click="openNotificationModal(request)">
              <i class="fas fa-envelope"></i>
              <span class="tooltip">Enviar notificación</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!isLoading && requests.length === 0">No hay solicitudes pendientes.</p>

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
import "vue-toastification/dist/index.css"; // Importa los estilos de Toastification

export default {
  name: "AdminRequests",
  setup() {
  const toast = useToast();
    return { toast };
},
  data() {
    return {
      requests: [],
      isLoading: false,
      errorMessage: "",
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
    
    async downloadReport() {
    try {
      const token = this.$store.getters["auth/token"];
      const apiUrl = process.env.VUE_APP_API_URL;
      // Se hace la solicitud GET con header de autorización y responseType blob
      const response = await axios.get(`${apiUrl}/requests/export`, {
        headers: { Authorization: "Bearer " + token },
        responseType: "blob"
      });
      // Crear un objeto Blob a partir de los datos de la respuesta
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      // Crear un enlace temporal para disparar la descarga
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
      // Solicitud GET para Excel con el header del token y responseType blob
      const response = await axios.get(`${apiUrl}/requests/export/excel`, {
        headers: { Authorization: "Bearer " + token },
        responseType: "blob"
      });
      // Crear blob y objeto URL para el archivo Excel
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
        await axios.post("/notifications/send", {
          userId: this.modalUserId,
          message: this.modalMessage
        }, {
          headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] }
        });
        this.modalSuccessMessage = "Notificación enviada exitosamente.";
        setTimeout(() => {
          this.closeNotificationModal();
        }, 1500);
      } catch (error) {
        this.modalErrorMessage = error.response?.data?.message || "Error al enviar la notificación.";
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

/* Opcional: Ajustes para la tabla y botones de acción */
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
</style>
