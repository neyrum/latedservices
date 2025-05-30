<template>
  <div v-if="isAdmin" class="portfolio-admin">
    <h2 class="dashboard-title">Gestión del Portafolio</h2>

    <!-- Indicador de carga -->
    <p v-if="loading">🔄 Cargando proyectos...</p>

    <!-- Tarjeta del formulario -->
    <div class="card">
      <h3>Agregar Nuevo Proyecto</h3>
      <form @submit.prevent="submitProject">
        <label>Nombre del Proyecto:</label>
        <input v-model="project.name" type="text" class="input-field" placeholder="Ejemplo: Desarrollo Web" required />

        <label>Descripción:</label>
        <textarea v-model="project.description" class="textarea-field" placeholder="Breve descripción" required></textarea>

        <label>Imagen o Video:</label>
        <input type="file" @change="handleMediaUpload" accept="image/*,video/*" class="file-input" required />

        <label>
          <input type="checkbox" v-model="project.featured" /> Destacar en Portafolio
        </label>

        <button type="submit" class="btn-primary">Guardar</button>
      </form>
    </div>

    <!-- Lista de proyectos -->
    <div class="portfolio-list">
      <h3>Proyectos Existentes</h3>
      <div v-if="portfolioItems.length === 0 && !loading">
        <p>No hay proyectos en el Portafolio.</p>
      </div>
      <div v-else class="service-grid">
        <div v-for="item in portfolioItems" :key="item.id" class="service-card">
          <template v-if="item.mediaUrl.includes('.mp4')">
            <video controls class="service-video">
              <source :src="item.mediaUrl" type="video/mp4">
              Tu navegador no soporta videos.
            </video>
          </template>
          <template v-else>
            <img :src="item.mediaUrl" alt="Imagen del proyecto" class="service-image" />
          </template>
          <h4>{{ item.name }}</h4>
          <p>{{ item.description }}</p>
          <button @click="deleteProject(item.id)" class="btn-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";

export default {
  data() {
    return {
      isAdmin: false,
      portfolioItems: [],
      project: { name: "", description: "", media: null, featured: false },
      loading: true // Estado de carga
    };
  },
  async created() {
    try {
      const user = await axios.get("/users/me");
      this.isAdmin = user.data.role === "admin" || user.data.role === "superadmin";
      this.fetchPortfolioItems();
    } catch (error) {
      console.error("Error al verificar usuario:", error);
      alert("❌ No se pudo obtener el usuario. Verifica tu sesión.");
      this.loading = false;
    }
  },
  methods: {
    async fetchPortfolioItems() {
      this.loading = true;
      try {
        const response = await axios.get("/portfolio/projects"); // Ajusta la ruta si es necesario
        this.portfolioItems = response.data;
      } catch (error) {
        console.error("Error al cargar el portafolio:", error);
        alert("❌ Ocurrió un error al cargar los proyectos.");
      }
      this.loading = false;
    },
    handleMediaUpload(event) {
      const file = event.target.files[0];
      this.project.media = file;
    },
    async submitProject() {
      if (!this.isAdmin) return;

      try {
        const formData = new FormData();
        formData.append("name", this.project.name);
        formData.append("description", this.project.description);
        formData.append("featured", this.project.featured ? "true" : "false");
        formData.append("media", this.project.media);

        await axios.post("/portfolio/projects", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        alert("✅ Proyecto creado exitosamente.");
        this.fetchPortfolioItems();
      } catch (error) {
        console.error("Error al crear el proyecto:", error);
        alert("❌ Ocurrió un error al crear el proyecto.");
      }
    },
    async deleteProject(id) {
      if (!this.isAdmin) return;

      try {
        await axios.delete(`/portfolio/projects/${id}`);
        this.portfolioItems = this.portfolioItems.filter(item => item.id !== id); // Eliminar localmente sin recargar
        alert("✅ Proyecto eliminado.");
      } catch (error) {
        console.error("Error al eliminar proyecto:", error);
        alert("❌ Ocurrió un error al eliminar el proyecto.");
      }
    }
  }
};
</script>

<style scoped>
.portfolio-admin {
  max-width: 900px;
  margin: 20px auto;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.input-field,
.textarea-field,
.file-input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.btn-primary {
  background: #345896;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-primary:hover {
  background: #283e69;
}

.portfolio-list {
  margin-top: 30px;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.service-card {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.service-image {
  width: 100%;
  border-radius: 5px;
}

.btn-danger {
  background: red;
  color: white;
  padding: 8px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
