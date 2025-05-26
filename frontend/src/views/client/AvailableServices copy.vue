<template>
  <div class="content">
    <Navbar />
    <div class="container mt-5">
      <h2 class="mb-4 text-center">Servicios Disponibles</h2>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Mensaje de carga -->
      <div v-if="isLoading" class="text-center">
        <p>Cargando servicios...</p>
      </div>

      <!-- Mensaje cuando no hay servicios -->
      <div v-if="!isLoading && services.length === 0 && !errorMessage" class="alert alert-info" role="alert">
        No tenemos servicios disponibles en este momento.
      </div>

      <!-- Lista de servicios -->
      <div v-if="!isLoading && services.length > 0" class="row">
        <div v-for="service in services" :key="service.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">{{ service.name }}</h5>
              <p class="card-text">{{ service.description }}</p>
             
              <!-- Precio, si existe -->
             <p v-if="service.price" class="card-text"><strong>Precio:</strong> ${{ service.price }}</p>

             <!-- Botón siempre abajo -->
            <div class="mt-auto text-center">
            <button class="btn btn-primary btn-sm rounded-pill shadow-sm" @click="openConfirmationModal(service)">Solicitar Servicio</button>
             </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación -->
      <div
        class="modal fade"
        id="confirmationModal"
        tabindex="-1"
        aria-labelledby="confirmationModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirmationModalLabel">Confirmar Solicitud</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              ¿Estás seguro de que deseas solicitar el servicio "{{ selectedService?.name }}"?
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="openRequestForm"
              >
                Sí, Solicitar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal del Formulario -->
      <div
        class="modal fade"
        id="requestFormModal"
        tabindex="-1"
        aria-labelledby="requestFormModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="requestFormModalLabel">Formulario de Solicitud</h5>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitRequest">
                <div class="form-group">
                  <label for="description">Descripción</label>
                  <textarea
                    id="description"
                    v-model="form.description"
                    class="form-control"
                    rows="4"
                    placeholder="Describe el servicio que necesitas"
                    required
                  ></textarea>
                </div>
                <div class="form-group">
                  <label for="priority">Prioridad</label>
                  <select
                    id="priority"
                    v-model="form.priority"
                    class="form-control"
                    required
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
                <button
                  type="submit"
                  class="btn btn-primary mt-3"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? "Enviando..." : "Enviar Solicitud" }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Servicios Solicitados -->
      <div v-if="requestedServices.length > 0" class="mt-5">
        <h3 class="mb-4">Servicios Solicitados</h3>
        <ul class="list-group">
          <li
            v-for="request in requestedServices"
            :key="request.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{{ request.serviceName }}</span>
            <span class="badge bg-primary">{{ request.status }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Navbar from "@/components/Navbar.vue";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

export default {
  name: "AvailableServices",
  components: { Navbar },
  data() {
    return {
      services: [],
      requestedServices: [], // Lista de servicios solicitados
      selectedService: null, // Servicio seleccionado para el modal
      form: {
        description: "",
        priority: "medium",
      },
      errorMessage: "",
      isLoading: true,
      isSubmitting: false,
    };
  },
  async created() {
    await this.fetchServices();
  },
  methods: {
    async fetchServices() {
      this.isLoading = true;
      try {
        const response = await axios.get("/services");
        this.services = response.data;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al cargar los servicios.";
      } finally {
        this.isLoading = false;
      }
    },
    openConfirmationModal(service) {
      this.selectedService = service;
      const modal = new bootstrap.Modal(
        document.getElementById("confirmationModal")
      );
      modal.show();
    },
    openRequestForm() {
      const confirmationModal = bootstrap.Modal.getInstance(
        document.getElementById("confirmationModal")
      );
      confirmationModal.hide();

      const requestFormModal = new bootstrap.Modal(
        document.getElementById("requestFormModal")
      );
      requestFormModal.show();
    },
    async submitRequest() {
      this.isSubmitting = true;

      // 🔹 Obtener el rol del usuario desde Vuex
  const userRole = this.store.getters["auth/userRole"];
  console.log("Rol del usuario:", userRole);

  // 🚨 Validar que el usuario tenga permisos para solicitar el servicio
  if (userRole !== "client") {
    alert("No tienes permisos para solicitar un servicio.");
    this.isSubmitting = false;
    return;
  }
      try {
        const response = await axios.post("/requests", {
          serviceId: this.selectedService.id,
          description: this.form.description,
          priority: this.form.priority,
          preferredDate: this.form.preferredDate || null,
      address: this.form.address || null,
    }, {
      headers: {
        Authorization: `Bearer ${this.store.getters["auth/token"]}`, // 🔥 Enviar token JWT
      },
        });
        this.requestedServices.push({
          id: response.data.id,
          serviceName: this.selectedService.name,
          status: "Pendiente",
        });
        const requestFormModal = bootstrap.Modal.getInstance(
          document.getElementById("requestFormModal")
        );
        requestFormModal.hide();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al enviar la solicitud.";
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
.content {
  margin-top: 70px;
}
.container {
  max-width: 1200px;
}
.card {
  border-radius: 0.25rem;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
}
</style>