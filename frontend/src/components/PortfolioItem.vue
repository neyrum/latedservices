<template>
  <div class="portfolio-item">
    <a class="portfolio-link" data-bs-toggle="modal" :href="'#' + project.id">
      <div class="portfolio-hover">
        <div class="portfolio-hover-content">
          <i class="fas fa-plus fa-3x"></i>
        </div>
      </div>
      <template v-if="project.isVideo">
        <video controls class="img-fluid" loading="lazy">
          <source :src="project.mediaUrl" type="video/mp4" />
          Tu navegador no soporta videos.
        </video>
      </template>
      <template v-else>
        <img
          class="img-fluid"
          :src="project.mediaUrl"
          :alt="project.name"
          loading="lazy"
        />
      </template>
    </a>
    <div class="portfolio-caption">
      <div class="portfolio-caption-heading">{{ project.name }}</div>
      <div class="portfolio-caption-subheading text-muted">
        {{ truncatedDescription }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PortfolioItem",
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  computed: {
    truncatedDescription() {
      const maxLength = 100; // Ajusta este valor según la cantidad deseada de caracteres.
      if (this.project.description.length > maxLength) {
        return this.project.description.slice(0, maxLength) + "...";
      }
      return this.project.description;
    }
  }
};
</script>

<style scoped>
.portfolio-item {
  position: relative;
  margin-bottom: 30px;
}

.portfolio-link {
  display: block;
  position: relative;
}

.portfolio-hover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
}

.portfolio-link:hover .portfolio-hover {
  opacity: 1;
}

.portfolio-hover-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}
</style>
