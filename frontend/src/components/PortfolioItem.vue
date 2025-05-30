<template>
  <div class="portfolio-item">
    <a class="portfolio-link" data-bs-toggle="modal" :href="'#' + project.id">
      <div class="portfolio-hover">
        <div class="portfolio-hover-content">
          <i class="fas fa-plus fa-3x"></i>
        </div>
      </div>
      <!-- Si el medio es video se muestra el tag <video>, de lo contrario una imagen -->
      <template v-if="isVideo">
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
      <!-- Se agregan los nuevos detalles: cliente y categoría -->
      <div class="portfolio-details">
        <span>Cliente: {{ project.client }}</span> | 
        <span>Categoría: {{ project.category }}</span>
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
    // Limita la descripción a 100 caracteres y agrega "..." si es muy larga.
    truncatedDescription() {
      const maxLength = 100;
      if (this.project.description.length > maxLength) {
        return this.project.description.slice(0, maxLength) + "...";
      }
      return this.project.description;
    },
    // Determina si el medio es un video revisando si la URL incluye ".mp4".
    isVideo() {
      if (this.project.mediaUrl && typeof this.project.mediaUrl === "string") {
        return this.project.mediaUrl.toLowerCase().includes(".mp4");
      }
      return false;
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
  text-decoration: none;
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

.portfolio-caption {
  text-align: center;
  margin-top: 15px;
}

.portfolio-caption-heading {
  font-size: 18px;
  font-weight: bold;
  color: #345896;
}

.portfolio-caption-subheading {
  font-size: 14px;
  color: #888;
  margin-top: 5px;
}

.portfolio-details {
  font-size: 13px;
  color: #555;
  margin-top: 8px;
}
</style>
