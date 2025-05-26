<template>
  <div>
    <Navbar />

    <!-- Encabezado -->
    <header class="masthead" data-aos="fade-up" data-aos-duration="1000">
      <div class="container">
        <div class="masthead-subheading">Bienvenido a Nuestro Portal de Servicios</div>
        <div class="masthead-heading text-uppercase">Nos esforzamos en ofrecer un servicios de calidad.</div>
        <a class="btn btn-primary btn-xl text-uppercase" href="#services">Descubre Más</a>
      </div>
    </header>

    <!-- Sección de Servicios -->
    <ServicesSection />

    <!-- Sección de Portafolio -->
    <Portfolio />

    <!-- Sección Sobre Nosotros -->
    <AboutSection />
    <!-- Sección del equipo integrada -->
    <Team />

    <!-- Sección de Contacto -->
    <ContactForm />

    <!-- Pie de Página -->
    <Footer />
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
import ServicesSection from "../components/ServicesSection.vue";
import Portfolio from "../components/Portfolio.vue";
import AboutSection from "../components/AboutSection.vue";
import Team from "../components/Team.vue";
import ContactForm from "../components/ContactForm.vue";
import Footer from "../components/Footer.vue";

export default {
  name: "Home",
  components: {
    Navbar,
    ServicesSection,
    Portfolio,
    AboutSection,
    Team,
    ContactForm,
    Footer,
  },
};
</script>
