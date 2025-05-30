<template>
  <section id="portfolio" class="page-section bg-light">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Portafolio</h2>
        <h3 class="section-subheading text-muted">Ejemplos de nuestro trabajo.</h3>
      </div>
      <div v-if="portfolioItems.length === 0">
        <p>No hay proyectos disponibles en el portafolio.</p>
      </div>
      <div v-else class="row">
        <PortfolioItem v-for="item in portfolioItems" :key="item.id" :project="item" />
      </div>
      <PortfolioModal v-for="item in portfolioItems" :key="item.id" :modalId="String(item.id)" :project="item" />
    </div>
  </section>
</template>

<script>
import axios from "@/plugins/axios";
import PortfolioItem from "./PortfolioItem.vue";
import PortfolioModal from "./PortfolioModal.vue";

export default {
  name: "Portfolio",
  components: { PortfolioItem, PortfolioModal },
  data() {
    return {
      portfolioItems: []
    };
  },
  created() {
    this.fetchPortfolioItems();
  },
  methods: {
    async fetchPortfolioItems() {
      try {
        const response = await axios.get("/portfolio/projects");
        this.portfolioItems = response.data.map(item => ({
          ...item,
          isVideo: item.mediaUrl.includes(".mp4") // ✅ Diferencia imágenes y videos
        }));
      } catch (error) {
        console.error("Error al cargar el portafolio:", error);
      }
    }
  }
};
</script>
