<template>
  <div class="request-details container py-3">
    <h3 class="text-center mb-4">Detalles de la Solicitud #{{ request.id }}</h3>
    
    <!-- Área para actualizar estado (barra superior) -->
    <div v-if="!isLoading && request.id" class="mb-4">
      <div class="d-flex justify-content-end align-items-center">
        <select
          v-model="newStatus"
          class="form-select form-select-sm w-auto me-2"
          :disabled="allowedTransitions.length === 0"
        >
          <option disabled value="">Nuevo Estado</option>
          <option
            v-for="status in allowedTransitions"
            :key="status"
            :value="status"
          >
            {{ capitalizeStatus(status) }}
          </option>
        </select>
        <button
          class="btn btn-primary btn-sm"
          @click="updateStatus"
          :disabled="newStatus === request.status || allowedTransitions.length === 0"
        >
          Actualizar
        </button>
      </div>
      <div v-if="successMessage" class="alert alert-success mt-2 text-center p-1">
        {{ successMessage }}
      </div>
    </div>
    
    <!-- Spinner y mensaje de error -->
    <div v-if="isLoading" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
    <div v-if="errorMessage" class="alert alert-danger text-center p-2">
      {{ errorMessage }}
    </div>
    
    <!-- Contenido Principal (cuando ya se cargó la solicitud) -->
    <div v-if="!isLoading && request.id">
      <!-- Primera fila: Dos tarjetas en línea -->
      <div class="row mb-3">
        <!-- Columna Izquierda: Datos del Cliente y Dirección -->
        <div class="col-md-6 mb-3 d-flex justify-content-center">
          <div class="card flex-fill uniform-card">
            <!-- En este header se centra el título; se coloca un ícono de flecha en la esquina izquierda -->
            <div class="card-header p-2 center-header" :style="{ backgroundColor: '#455A64', color: '#fff', position: 'relative' }">
              <router-link class="back-icon" :to="'/dashboard'">
                <i class="fas fa-arrow-left"></i>
              </router-link>
              <span class="header-title">Datos del Cliente</span>
            </div>
            <div class="card-body p-2">
              <div class="mb-2">
                <h6 class="mb-1">Cliente</h6>
                <p class="mb-1" v-if="request.client">
                  <strong>Nombre:</strong> {{ request.client.name }}
                </p>
                <p class="mb-1" v-if="request.client">
                  <strong>Correo:</strong> {{ request.client.email }}
                </p>
                <p class="mb-0" v-if="request.client">
                  <strong>Teléfono:</strong> {{ request.client.phone }}
                </p>
              </div>
              <hr class="my-1">
              <div>
                <h6 class="mb-1">Datos Laborales</h6>
                <p class="mb-1" v-if="request.address">
                  <strong>Facultad/Area o Identidad Laboral:</strong> {{ request.address.street }}
                </p>
                <p class="mb-0" v-if="request.address">
                  <strong>Departamneto:</strong> {{ request.address.city }}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Columna Derecha: Información Básica y Administrador -->
        <div class="col-md-6 mb-3 d-flex justify-content-center">
          <div class="card flex-fill uniform-card">
            <div class="card-header p-2 center-header" :style="{ backgroundColor: '#2E3B55', color: '#fff' }">
              <span class="header-title">Información Básica y Administrador</span>
            </div>
            <div class="card-body p-2">
              <div class="mb-2">
                <h6 class="mb-1">Información Básica</h6>
                <p class="mb-1"><strong>Estado:</strong> {{ request.status }}</p>
                <p class="mb-0"><strong>Fecha Preferida:</strong> {{ new Date(request.preferredDate).toLocaleDateString() }}</p>
              </div>
              <hr class="my-1">
              <div>
                <h6 class="mb-1">Administrador</h6>
                <p class="mb-0" v-if="request.admin">
                  <strong>Nombre:</strong> {{ request.admin.name }}
                </p>
                <p class="mb-0" v-else>No asignado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Segunda fila: Servicio Solicitado | Detalles de la Solicitud -->
      <div class="row mb-3">
        <!-- Columna Izquierda: Servicio Solicitado -->
        <div class="col-md-6 mb-3 d-flex justify-content-center">
          <div class="card flex-fill uniform-card">
            <div class="card-header p-2 center-header" :style="{ backgroundColor: '#00796B', color: '#fff' }">
              <span class="header-title">Servicio Solicitado</span>
            </div>
            <div class="card-body p-2">
              <p class="mb-1" v-if="request.service">
                <strong>Nombre:</strong> {{ request.service.name }}
              </p>
              <p class="mb-1" v-if="request.service">
                <strong>Descripción:</strong> {{ request.service.description }}
              </p>
              <p class="mb-0" v-if="request.service">
                <strong>Precio:</strong> ${{ request.service.price }}
              </p>
            </div>
          </div>
        </div>
        <!-- Columna Derecha: Detalles de la Solicitud -->
        <div class="col-md-6 mb-3 d-flex justify-content-center">
          <div class="card flex-fill uniform-card">
            <div class="card-header p-2 center-header" :style="{ backgroundColor: '#546E7A', color: '#fff' }">
              <span class="header-title">Detalles de la Solicitud</span>
            </div>
            <div class="card-body p-2">
              <p class="mb-0">{{ request.details }}</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
export default {
  name: "RequestDetails",
  data() {
    return {
      isLoading: false,
      errorMessage: "",
      successMessage: "",
      request: {},
      newStatus: ""
    };
  },
  created() {
    this.fetchRequest();
  },
  computed: {
    allowedTransitions() {
      if (!this.request.status) return [];
      const current = this.request.status.toLowerCase();
      const transitions = {
        pendiente: ["aprobado", "rechazado"],
        aprobado: ["en_progreso"],
        en_progreso: ["completado", "cancelado"]
      };
      return transitions[current] || [];
    }
  },
  methods: {
    async fetchRequest() {
      this.isLoading = true;
      try {
        const id = this.$route.params.id;
        const response = await axios.get(`/requests/${id}`, {
          headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] }
        });
        this.request = response.data.data;
        this.newStatus = this.request.status;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al cargar los detalles.";
      } finally {
        this.isLoading = false;
      }
    },
    async updateStatus() {
      if (!this.newStatus || this.newStatus === this.request.status) {
        this.successMessage = "";
        return;
      }
      try {
        await axios.put(
          `/requests/${this.request.id}/status`,
          { status: this.newStatus },
          { headers: { Authorization: "Bearer " + this.$store.getters["auth/token"] } }
        );
        this.request.status = this.newStatus;
        this.successMessage = "¡El estado se actualizó correctamente!";
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al actualizar el estado.";
      }
    },
    capitalizeStatus(status) {
  const statusMap = {
    "en_progreso": "Activo" // Cambia "En Progreso" por "Activo"
  };
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);

    }
  }
};
</script>

<style scoped>
.request-details {
  margin-top: 20px;
  padding-bottom: 20px;
}

/* Tarjetas uniformes */
.uniform-card {
  width: 100%;
  min-height: 220px;
}
.card {
  border: none;
  border-radius: 8px;
  overflow: hidden;
}
.center-header {
  text-align: center;
  position: relative;
}
.header-title {
  display: block;
  width: 100%;
}
.card-header {
  font-size: 1rem;
  padding: 8px 12px;
}
.card-body {
  padding: 8px 12px;
  font-size: 0.9rem;
}
.back-icon {
  position: absolute;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  color: #fff;
  font-size: 1.2rem;
  text-decoration: none;
  transition: color 0.3s;
}
.back-icon:hover {
  color: #ccc;
}
</style>
