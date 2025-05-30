<template>
  <div class="portfolio-modal modal fade" :id="String(modalId)" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="close-modal" data-bs-dismiss="modal">
          <img src="@/assets/img/close-icon.svg" alt="Cerrar Modal" />
        </div>
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="modal-body">
                <h2 class="text-uppercase">{{ project.name }}</h2>
                <template v-if="project.isVideo">
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
  }
};
</script>
