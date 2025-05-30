<template>
  <teleport to="body">
    <div class="portfolio-modal modal fade" :id="String(modalId)" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <!-- Botón de cierre -->
          <div class="close-modal" data-bs-dismiss="modal">
            <img src="@/assets/img/close-icon.svg" alt="Cerrar Modal" />
          </div>
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-lg-8">
                <div class="modal-body">
                  <h2 class="text-uppercase">{{ project.name }}</h2>
                  
                  <!-- Se muestra el video si es un archivo .mp4, de lo contrario, una imagen -->
                  <template v-if="isVideo">
                    <video controls class="img-fluid d-block mx-auto">
                      <source :src="project.mediaUrl" type="video/mp4">
                      Tu navegador no soporta videos.
                    </video>
                  </template>
                  <template v-else>
                    <img
                      class="img-fluid d-block mx-auto"
                      :src="project.mediaUrl"
                      :alt="project.name"
                      loading="lazy"
                    />
                  </template>

                  <p>{{ project.description }}</p>

                  <!-- Detalles adicionales del proyecto -->
                  <div class="portfolio-details">
                    <p><strong>Cliente:</strong> {{ project.client }}</p>
                    <p><strong>Categoría:</strong> {{ project.category }}</p>
                  </div>

                  <button class="btn btn-primary btn-xl text-uppercase" data-bs-dismiss="modal" type="button">
                    <i class="fas fa-xmark me-1"></i> Cerrar Proyecto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
export default {
  name: "PortfolioModal",
  props: {
    modalId: {
      type: String,
      required: true
    },
    project: {
      type: Object,
      required: true
    }
  },
  computed: {
    // Determina si el recurso multimedia es un video basándose en la URL
    isVideo() {
      return this.project.mediaUrl?.toLowerCase().includes(".mp4");
    }
  },
  mounted() {
    this.$nextTick(() => {
      const modalElement = document.getElementById(this.modalId);
      if (modalElement) {
        new bootstrap.Modal(modalElement);
      }
    });
  }
};
</script>

<style scoped>
.portfolio-modal {
  /* Se pueden agregar más estilos si es necesario */
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
}

.close-modal {
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
}

.portfolio-details {
  margin-top: 15px;
  font-size: 16px;
  color: #555;
}
</style>
