<template>
  <div class="content">
    <Navbar />
    <div class="container mt-5">
      <h2 class="mb-4">Solicitar un Servicio</h2>

      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="alert alert-success" role="alert">
        {{ successMessage }}
      </div>

      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="alert alert-danger" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Indicador de carga -->
      <div v-if="isLoading" class="text-center">
        <p>Cargando detalles del servicio...</p>
      </div>

      <!-- Formulario de solicitud -->
      <form v-if="!isLoading && service" @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="serviceName">Nombre del Servicio</label>
          <input
            id="serviceName"
            type="text"
            class="form-control"
            :value="service.name"
            disabled
          />
        </div>
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
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
          {{ isSubmitting ? "Enviando..." : "Enviar Solicitud" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Navbar from "@/components/Navbar.vue";

export default {
  name: "RequestService",
  components: { Navbar },
  data() {
    return {
      service: null, // Detalles del servicio seleccionado
      form: {
        description: "",
        priority: "medium",
      },
      successMessage: "",
      errorMessage: "",
      isLoading: true, // Estado para manejar la carga de datos
      isSubmitting: false, // Estado para manejar el envío del formulario
    };
  },
  async created() {
    const serviceId = this.$route.query.serviceId;
    if (!serviceId) {
      this.errorMessage = "No se proporcionó un ID de servicio.";
      this.isLoading = false;
      return;
    }
    await this.fetchService(serviceId);
  },
  methods: {
    async fetchService(serviceId) {
      try {
        const response = await axios.get(`/services/${serviceId}`);
        this.service = response.data;
        this.errorMessage = "";
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al cargar los detalles del servicio.";
      } finally {
        this.isLoading = false;
      }
    },
    async submitRequest() {
      this.isSubmitting = true; // Activa el estado de envío
      try {
        await axios.post("/requests", {
          serviceId: this.service.id,
          description: this.form.description,
          priority: this.form.priority,
        });
        this.successMessage = "¡Solicitud enviada exitosamente!";
        this.errorMessage = "";
        this.form.description = ""; // Reinicia el formulario
        this.form.priority = "medium";
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error al enviar la solicitud.";
        this.successMessage = "";
      } finally {
        this.isSubmitting = false; // Desactiva el estado de envío
      }
    },
  },
};
</script>

<style scoped>
.content {
  margin-top: 70px; /* Ajusta este valor según la altura de tu Navbar */
}
.container {
  max-width: 600px;
}
</style>