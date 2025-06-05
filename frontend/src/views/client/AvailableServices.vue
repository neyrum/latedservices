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
      <div class="modal fade" id="confirmationModal" tabindex="-1" aria-labelledby="confirmationModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="confirmationModalLabel">Confirmar Solicitud</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              ¿Estás seguro de que deseas solicitar el servicio "{{ selectedService?.name }}"?
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" @click="openRequestForm">Sí, Solicitar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal del Formulario -->
      <div class="modal fade" id="requestFormModal" tabindex="-1" aria-labelledby="requestFormModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="requestFormModalLabel">Formulario de Solicitud</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
              <form @submit.prevent="submitRequest">
                <div class="form-group">
                  <label for="description">Descripción</label>
                  <textarea id="description" v-model="form.description" class="form-control" rows="4" placeholder="Describe el servicio que necesitas" required></textarea>
                  <span v-if="errors.description" class="text-danger">{{ errors.description }}</span>
                </div>

                <div class="form-group">
                  <label for="priority">Prioridad</label>
                  <select id="priority" v-model="form.priority" class="form-control" required>    
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
                 <label for="facultyOrWorkIdentity">Facultad/Área o Identidad Laboral</label>
                 <input type="text" id="facultyOrWorkIdentity" v-model="form.facultyOrWorkIdentity" class="form-control" placeholder="Ingresa la facultad, área o identidad laboral" required />
                 <span v-if="errors.facultyOrWorkIdentity" class="text-danger">{{ errors.facultyOrWorkIdentity }}</span>
               </div>

              <!-- Campo para Departamneto -->
              <div class="form-group mt-3">
                <label for="department">Departamento</label>
                <input type="text" id="department" v-model="form.department" class="form-control" placeholder="Ingresa el departamento al que pertenece" required />
                <span v-if="errors.department" class="text-danger">{{ errors.department }}</span>
              </div>

              <button type="submit" class="btn btn-primary mt-3" :disabled="isSubmitting">
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
        facultyOrWorkIdentity: "",
        department: ""
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

      // 🔹 Validar Facultad/Área o Identidad Laboral
      if (!this.form.facultyOrWorkIdentity || !this.form.facultyOrWorkIdentity.trim()) {
        this.errors.facultyOrWorkIdentity = "Este campo es obligatorio.";
    }
      // 🔹 Validar Departamento
      if (!this.form.department || !this.form.department.trim()) {
        this.errors.department = "El departamento es obligatorio.";
    } 

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

      try { 
        // 🔹 Definir la estructura del objeto a enviar
        const requestData = {
          serviceId: this.selectedService.id,
          details: this.form.description,
          priority: this.form.priority,
          preferredDate: this.form.preferredDate,
          facultyOrWorkIdentity: this.form.facultyOrWorkIdentity.trim(),
          department: this.form.department.trim(),
          status: "pendiente",
        };

        console.log("Solicitud enviada:", requestData); // 🔹 Para depuración antes de enviarlo

        // 🔹 Enviar la solicitud con `requestData`
        const response = await axios.post(
          "/requests",
          requestData,
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
        this.form.facultyOrWorkIdentity = "";
        this.form.department = "";

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