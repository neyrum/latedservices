<template>
  <section id="services" class="page-section">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Servicios</h2>
        <h3 class="section-subheading text-muted">Explora lo que ofrecemos.</h3>
      </div>
      <div class="row text-center">
        <div v-for="service in services" :key="service.id" class="col-md-4">
          <span class="fa-stack fa-4x">
            <i class="fas fa-circle fa-stack-2x text-primary"></i>
            <i :class="service.icon" class="fa-stack-1x fa-inverse"></i>
          </span>
          <h4 class="my-3">{{ service.name }}</h4>
          <p class="text-muted">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ServicesSection",
  data() {
    return {
      services: [
        { id: 1, name: "E-Commerce", description: "Soluciones digitales para tu negocio", icon: "fas fa-shopping-cart" },
        { id: 2, name: "Responsive Design", description: "Diseño adaptable a todos los dispositivos", icon: "fas fa-laptop" },
        { id: 3, name: "Web Security", description: "Protege tu sitio web con seguridad avanzada", icon: "fas fa-lock" },
      ],
    };
  },
};
</script>
