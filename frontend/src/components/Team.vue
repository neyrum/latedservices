<template>
  <section class="page-section bg-light" id="team">
    <div class="container">
      <div class="text-center">
        <h2 class="section-heading text-uppercase">Nuestro Increíble Equipo</h2>
        <h3 class="section-subheading text-muted">
          Los talentos que hacen posible nuestro éxito.
        </h3>
      </div>
      <div class="row">
        <div v-for="member in teamList" :key="member.name" class="col-lg-4">
          <div class="team-member">
            <img
              class="mx-auto rounded-circle"
              :src="resolveImage(member.image)"
              :alt="`Foto de ${member.name}`"
            />
            <h4>{{ member.name }}</h4>
            <p class="text-muted">{{ member.role }}</p>
            <!-- Botones de redes sociales -->
            <a
              class="btn btn-dark btn-social mx-2"
              :href="member.twitter"
              aria-label="Perfil de Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a
              class="btn btn-dark btn-social mx-2"
              :href="member.facebook"
              aria-label="Perfil de Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a
              class="btn btn-dark btn-social mx-2"
              :href="member.linkedin"
              aria-label="Perfil de LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-lg-8 mx-auto text-center">
          <p class="large text-muted">
            Cada miembro de nuestro equipo aporta su experiencia para alcanzar grandes logros.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";
import { teamMembers } from "@/data/teamData";

export default {
  name: "Team",
  setup() {
    // Se asignan los datos importados a un ref
    const teamList = ref(teamMembers);
    
    /**
     * Función para resolver la ruta de la imagen.
     * - Si la ruta comienza con "@/assets" se utiliza require() para que Webpack la procese.
     * - Si no, se retorna la ruta tal cual.
     */
    const resolveImage = (imagePath) => {
      try {
        if (imagePath.startsWith("@/assets")) {
          return require(`${imagePath}`);
        }
        return imagePath;
      } catch (error) {
        console.error("No se pudo cargar la imagen:", imagePath, error);
        // En caso de error, se retorna una imagen por defecto (asegúrate de tenerla en la ruta indicada)
        return require("@/assets/img/default-profile.jpg");
      }
    };

    return { teamList, resolveImage };
  }
};
</script>
