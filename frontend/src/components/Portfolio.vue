<template>
  <section id="portfolio" class="page-section bg-light">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Portafolio</h2>
        <h3 class="section-subheading text-muted">Ejemplos de nuestro trabajo.</h3>
      </div>
      <div class="row">
        <div v-for="item in portfolioItems" :key="item.id" class="col-lg-4 col-sm-6 mb-4">
          <div class="portfolio-item">
            <a class="portfolio-link" data-bs-toggle="modal" :href="'#' + item.modalId">
              <div class="portfolio-hover">
                <div class="portfolio-hover-content"><i class="fas fa-plus fa-3x"></i></div>
              </div>
              <img class="img-fluid" :src="item.image" :alt="item.title" loading="lazy" />
            </a>
            <div class="portfolio-caption">
              <div class="portfolio-caption-heading">{{ item.title }}</div>
              <div class="portfolio-caption-subheading text-muted">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modales de proyectos -->
      <PortfolioModal v-for="item in portfolioItems" :key="item.id" :modalId="item.modalId" :project="item" />
    </div>
  </section>
</template>

<script>
import PortfolioModal from "./PortfolioModal.vue";

export default {
  name: "Portfolio",
  components: { PortfolioModal },
  data() {
    return {
      portfolioItems: [
        { id: 1, modalId: "portfolioModal1", image: require('@/assets/img/portfolio/1.jpg'), title: "Threads", description: "Illustration" },
        { id: 2, modalId: "portfolioModal2", image: require('@/assets/img/portfolio/2.jpg'), title: "Explore", description: "Graphic Design" },
        { id: 3, modalId: "portfolioModal3", image: require('@/assets/img/portfolio/3.jpg'), title: "Finish", description: "Identity" },
      ],
    };
  },
};
</script>
