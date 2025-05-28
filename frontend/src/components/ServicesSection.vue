<template>
  <section id="services" class="page-section">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Servicios</h2>
        <h3 class="section-subheading text-muted">Explora lo que ofrecemos.</h3>
      </div>

      <div v-if="loading" class="text-center">
        <p>Cargando servicios...</p>
      </div>

      <div class="row text-center">
        <!-- Servicios dinámicos: cada tarjeta se convierte en un enlace clicable -->
        <router-link
          v-for="service in services"
          :key="'dynamic-' + service.id"
          :to="{ name: 'AvailableServices' }"
          class="col-md-4 text-decoration-none"
        >
          <span class="fa-stack fa-4x">
            <i class="fas fa-circle fa-stack-2x text-primary"></i>
            <i
              :class="service.icon || 'fas fa-concierge-bell'"
              class="fa-stack-1x fa-inverse"
            ></i>
          </span>
          <img
            :src="service.image || '/assets/img/default-service.jpg'"
            alt="Imagen del servicio"
            class="service-image"
          />
          <h4 class="my-3">{{ service.name }}</h4>
          <p class="text-muted">{{ service.description }}</p>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "axios";

export default {
  name: "ServicesSection",
  data() {
    return {
      services: [],
      loading: true,
    };
  },
  async mounted() {
    try {
      const response = await axios.get(
        `${process.env.VUE_APP_API_URL}/services`
      );
      this.services = response.data;
    } catch (error) {
      console.error("Error al obtener servicios:", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style>
.service-image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-radius: 10px;
}
</style>

<style scoped>
.card {
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.card-img-top {
  height: 200px;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}
.card-body {
  text-align: center;
}
</style>
