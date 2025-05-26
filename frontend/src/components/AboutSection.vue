<template>
  <section class="page-section" id="about">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Sobre Nosotros</h2>
        <h3 class="section-subheading text-muted">Nuestra historia y pasión.</h3>
      </div>
      <ul class="timeline">
        <li v-for="event in timeline" :key="event.year">
          <div class="timeline-image">
            <img class="rounded-circle img-fluid" :src="event.image" alt="..." />
          </div>
          <div class="timeline-panel">
            <div class="timeline-heading">
              <h4>{{ event.year }}</h4>
              <h4 class="subheading">{{ event.title }}</h4>
            </div>
            <div class="timeline-body">
              <p class="text-muted">{{ event.description }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: "AboutSection",
  data() {
    return {
      timeline: [
        { year: "2009-2011", title: "Nuestros Inicios", description: "Comenzamos con un sueño de crear soluciones digitales", image: require('@/assets/img/about/1.jpg') },
        { year: "2011-2015", title: "Expansión", description: "Crecimos y ayudamos a más negocios a transformar su presencia online", image: require('@/assets/img/about/2.jpg') },
        { year: "2015-2023", title: "Liderazgo en el mercado", description: "Nos consolidamos como referentes en tecnología web", image: require('@/assets/img/about/3.jpg') },
      ],
    };
  },
};
</script>
