<template>
  <section id="contact" class="page-section">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Contacto</h2>
        <h3 class="section-subheading text-muted">Envíanos un mensaje.</h3>
      </div>
      <form @submit.prevent="submitForm">
        <div class="row align-items-stretch mb-5">
          <div class="col-md-6">
            <div class="form-group">
              <input v-model="form.name" class="form-control" type="text" placeholder="Tu Nombre *" required />
            </div>
            <div class="form-group">
              <input v-model="form.email" class="form-control" type="email" placeholder="Tu Email *" required />
            </div>
            <div class="form-group mb-md-0">
              <input v-model="form.phone" class="form-control" type="tel" placeholder="Tu Teléfono *" required />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group form-group-textarea mb-md-0">
              <textarea v-model="form.message" class="form-control" placeholder="Tu Mensaje *" required></textarea>
            </div>
          </div>
        </div>
        <div class="text-center">
          <button class="btn btn-primary btn-xl text-uppercase" type="submit">Enviar Mensaje</button>
        </div>
      </form>
    </div>
  </section>
</template>

<script>
export default {
  name: "ContactForm",
  data() {
    return {
      form: { name: "", email: "", phone: "", message: "" },
    };
  },
  methods: {
    submitForm() {
      console.log("Formulario enviado:", this.form);
      alert("¡Mensaje enviado correctamente!");
    },
  },
};
</script>
