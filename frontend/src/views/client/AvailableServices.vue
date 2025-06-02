<template>
  <div class="content">
    <Navbar />
    <div class="container mt-5">
      <h2 class="mb-4 text-center">Servicios Disponibles</h2>

      <!-- Mensaje de error global-->
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
              
              <!-- Mostrar Precio, si existe -->
              <p v-if="service.price" class="card-text">
                <strong>Precio:</strong> ${{ service.price }}
              </p>

              <!-- Botón de solicitud, siempre abajo -->
              <div class="mt-auto text-center">
                <button class="btn btn-primary btn-sm rounded-pill shadow-sm" @click="openConfirmationModal(service)">
                  Solicitar Servicio
                </button>
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancelar
              </button>
              <button type="button" class="btn btn-primary" @click="openRequestForm">
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
                  <span v-if="errors.description" class="text-danger">{{ errors.description }}</span>
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
                  <span v-if="errors.priority" class="text-danger">{{ errors.priority }}</span>
                </div>
                
                <div class="form-group">
                <label for="preferredDate">Fecha Preferida</label>
                <input type="date" id="preferredDate" v-model="form.preferredDate" class="form-control" required />
                <span v-if="errors.preferredDate" class="text-danger">{{ errors.preferredDate }}</span>
                </div>

                <!-- Campo para Facultad/Area o Identidad Laboral -->
              <div class="form-group">
              <label for="street">Facultad/Area o Identidad Laboral</label>
              <input type="text"id="street" v-model="form.street"class="form-control" placeholder="Ingresa la facultad, area o identidad laboral" required />
              <span v-if="errors.street" class="text-danger">{{ errors.street }}</span>
              </div>

              <!-- Campo para Departamneto -->
             <div class="form-group mt-3">
             <label for="city">Departamneto</label>
             <input type="text" id="city" v-model="form.city" class="form-control" placeholder="Ingresa el departamento al q pertenece" required />
             <span v-if="errors.city" class="text-danger">{{ errors.city }}</span>
             </div>

              <!-- Campo para Código Postal 
              <div class="form-group mt-3">
              <label for="zip">Código Postal</label>
              <input type="text" id="zip" v-model="form.zip" class="form-control" placeholder="Ingresa el código postal" required />
              <span v-if="errors.zip" class="text-danger">{{ errors.zip }}</span>
              </div> -->

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
import defaultProfile from '@/assets/img/default-profile.jpg';

export default {
  name: "AvailableServices",
  components: { Navbar },
  data() {
    return {
      services: [],
      requestedServices: [],
      selectedService: null,
      form: {
        description: "",
        priority: "medium",
        preferredDate: "", 
        street: "",
        city: "",
        zip: "",
      },
      errors: {},
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
        this.errorMessage = error.response?.data?.message || "Error al cargar los servicios.";
      } finally {
        this.isLoading = false;
      }
    },
    openConfirmationModal(service) {
      this.selectedService = service;
      const modal = new bootstrap.Modal(document.getElementById("confirmationModal"));
      modal.show();
    },
    openRequestForm() {
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById("confirmationModal"));
      confirmationModal.hide();

      const requestFormModal = new bootstrap.Modal(document.getElementById("requestFormModal"));
      requestFormModal.show();
    },

    // Método de validación del formulario
    validateForm() {
      // Reiniciar errores
      this.errors = {};

    
      // Validar la descripción (mínimo 10 a máximo 500 caracteres)
      const description = this.form.description ? this.form.description.trim() : "";
      if (!description || description.length < 50) {
      this.errors.description = "La descripción debe tener al menos 50 caracteres.";
      } else if (description.length > 500) {
      this.errors.description = "La descripción debe tener como máximo 500 caracteres.";
      }
      
      // Validar el campo de prioridad (aunque el select tiene required, se valida por precaución)
      if (!this.form.priority) {
        this.errors.priority = "La prioridad es obligatoria.";
      }

      // Validar la fecha preferida
      if (!this.form.preferredDate) {
        this.errors.preferredDate = "La fecha preferida es obligatoria.";
      }
      else {
    // Intentamos crear una fecha a partir del valor ingresado
    const selectedDate = new Date(this.form.preferredDate);
    // Si la fecha es inválida, se asigna un mensaje
    if (isNaN(selectedDate.getTime())) {
      this.errors.preferredDate = "La fecha preferida debe ser una fecha válida.";
      // Establecemos la fecha de hoy a medianoche para la comparación
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Verificamos que la fecha seleccionada sea mayor que hoy
      if (selectedDate <= today) {
        this.errors.preferredDate = "La fecha preferida debe ser una fecha futura.";
      }
    }
  }


      // Validar campos de dirección
      if (!this.form.street || !this.form.street.trim()) {
        this.errors.street = "La calle es obligatoria.";
      }
      if (!this.form.city || !this.form.city.trim()) {
        this.errors.city = "La ciudad es obligatoria.";
      }
     // if (!this.form.zip || !this.form.zip.trim()) {
     //   this.errors.zip = "El código postal es obligatorio.";
     // } 

      // Si no hay propiedades en el objeto errors, retorna true
      return Object.keys(this.errors).length === 0;
    },
    async submitRequest() {
      // Primero, valida el formulario
      if (!this.validateForm()) {
        return; // Si hay errores, no se envía la solicitud
      }
      
      this.isSubmitting = true;

      // Obtener el rol del usuario desde Vuex (usar this.$store)
      const userData = this.$store.getters["auth/userData"];
      const userRole = userData ? userData.role : undefined;
      console.log("Rol del usuario:", userRole);

      // Validar que el usuario tenga permisos para solicitar el servicio
      if (userRole !== "client") {
        alert("No tienes permisos para solicitar un servicio.");
        this.isSubmitting = false;
        return;
      }

      // Construir el objeto address a partir de los nuevos campos
      const addressObj = {
       street: this.form.street.trim(),
       city: this.form.city.trim(),
      // zip: this.form.zip.trim(),
  };

      try { 
        
        console.log("Solicitud enviada:", {
          serviceId: this.selectedService.id,
          details: this.form.description,
          priority: this.form.priority,
          preferredDate: this.form.preferredDate,
          address: addressObj,
          status: "pendiente",
        });

        const response = await axios.post(
          "/requests",
          {
            serviceId: this.selectedService.id,
            details: this.form.description,
            priority: this.form.priority,
            preferredDate: this.form.preferredDate,
            address: addressObj,
            status: "pendiente",
          },
          {
            headers: {
              Authorization: `Bearer ${this.$store.getters["auth/token"]}`,
            },
          }
        );

        this.requestedServices.push({
          id: response.data.id,
          serviceName: this.selectedService.name,
          status: "Pendiente",
        });

        // Reiniciar el formulario
        this.form.description = "";
        this.form.priority = "medium";
        this.form.preferredDate = "";
        this.form.street = "";
        this.form.city = "";
        //this.form.zip = "";

        const requestFormModal = bootstrap.Modal.getInstance(document.getElementById("requestFormModal"));
        requestFormModal.hide();
      } catch (error) {
        console.log("Error Response:", error.response);
        this.errorMessage = error.response?.data?.message || "Error al enviar la solicitud.";
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
.text-danger {
  font-size: 0.875em;
  color: red; /* o el color que prefieras */
  margin-top: 0.25em;
}
</style>