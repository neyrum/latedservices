<template>
  <div class="portfolio-modal modal fade" :id="modalId" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="close-modal" data-bs-dismiss="modal">
          <img src="@/assets/img/close-icon.svg" alt="Close modal" />
        </div>
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="modal-body">
                <!-- Project details -->
                <h2 class="text-uppercase">{{ project.title }}</h2>
                <p class="item-intro text-muted">{{ project.subtitle }}</p>
                <img class="img-fluid d-block mx-auto" :src="project.image" :alt="project.title" loading="lazy" />
                <p>{{ project.description }}</p>
                <ul class="list-inline">
                  <li><strong>Cliente:</strong> {{ project.client }}</li>
                  <li><strong>Categoría:</strong> {{ project.category }}</li>
                </ul>
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
    modalId: String,
    project: Object,
  },
};
</script>
