<template>
  <div class="manage-portfolio">
    <h3 class="title">Administración del Portafolio</h3>

    <!-- Botón para mostrar/ocultar formulario -->
    <button @click="showForm = !showForm" class="btn-toggle">
      <i class="fas" :class="showForm ? 'fa-times' : 'fa-plus-circle'"></i>
      <span v-if="!showForm"> Agregar Proyecto</span>
    </button>

    <!-- Formulario de creación/edición -->
    <div v-if="showForm" class="form-container">
      <form @submit.prevent="submitProject">
        <div class="input-group">
          <label for="name">Nombre del Proyecto</label>
          <input
            v-model="project.name"
            type="text"
            id="name"
            placeholder="Ejemplo: Desarrollo Web"
            required
          />
        </div>

        <div class="input-group">
          <label for="description">Descripción</label>
          <textarea
            v-model="project.description"
            id="description"
            placeholder="Breve descripción"
            required
          ></textarea>
        </div>

        <!-- Grupo personalizado para la selección de archivo -->
        <div class="input-group file-group">
          <span class="file-title">Subir imágen o video</span>
          <!-- Label que integra el icono y el recuadro -->
          <label for="media" class="file-select-box">
            <span class="upload-btn">
              <i class="fas fa-cloud-upload-alt"></i>
            </span>
            <span class="select-text">
              {{ selectedFileName || 'Seleccionar archivos' }}
            </span>
          </label>
          <input
            type="file"
            ref="fileInput"
            accept="image/*,video/*"
            @change="handleMediaUpload"
            id="media"
            class="file-input"
            required
          />
        </div>

        <div class="input-group checkbox-group">
          <label>
            <input type="checkbox" v-model="project.featured" /> Destacar en Portafolio
          </label>
        </div>

        <div class="button-group">
          <button type="submit" class="btn-icon">
            Agregar
          </button>
        </div>
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
              <source :src="item.mediaUrl" type="video/mp4" />
              Tu navegador no soporta videos.
            </video>
          </template>
          <template v-else>
            <img :src="item.mediaUrl" alt="Imagen del proyecto" class="service-image" />
          </template>
          <h4>{{ item.name }}</h4>
          <p>{{ item.description }}</p>
          <div class="action-buttons">
            <i class="fas fa-trash-alt delete-icon" @click="deleteProject(item.id)"></i>
          </div>
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
      showForm: false,
      loading: true,
      selectedFileName: "" // Aquí se guardará el nombre del archivo seleccionado
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
        const response = await axios.get("/portfolio/projects");
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
      this.selectedFileName = file ? file.name : "";
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
        this.showForm = false;
        this.selectedFileName = "";
      } catch (error) {
        console.error("Error al crear el proyecto:", error);
        alert("❌ Ocurrió un error al crear el proyecto.");
      }
    },
    async deleteProject(id) {
      if (!this.isAdmin) return;
      try {
        await axios.delete(`/portfolio/projects/${id}`);
        this.portfolioItems = this.portfolioItems.filter(item => item.id !== id);
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
.manage-portfolio {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.title {
  font-size: 22px;
  color: #345896;
  font-weight: bold;
  margin-bottom: 15px;
}

.btn-toggle {
  background: #345896;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  margin-bottom: 20px;
}

.btn-toggle:hover {
  background: #274270;
  transform: scale(1.05);
}

/* Sección para selección de archivo */
.file-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.file-title {
  font-size: 14px;
  color: #345896;
  margin-bottom: 5px;
}

/* Contenedor para la selección de archivo */
.file-select-box {
  display: inline-flex;
  align-items: center;
  width: 220px;  /* Ancho fijo */
  border: 1px solid #345896;
  border-radius: 5px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}

.file-select-box:hover {
  background: rgba(52, 88, 150, 0.1);
}

.upload-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #345896;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 16px;
  flex-shrink: 0;
}

.select-text {
  flex-grow: 1;
  font-size: 14px;
  color: #345896;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Input file oculto */
.file-input {
  display: none;
}

/* Estilos para el Formulario */
.form-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-group label {
  margin-bottom: 5px;
  font-size: 14px;
  color: #345896;
}

.input-group input,
.input-group textarea {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* Checkbox */
.checkbox-group {
  margin-bottom: 15px;
  font-size: 16px;
}

/* Grupo de botones */
.button-group {
  display: flex;
  gap: 10px;
}

/* Botón para enviar (Agregar) en tonalidad azul */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #345896, #274270);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.btn-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon:active {
  transform: scale(0.95);
  box-shadow: none;
}

/* Lista de proyectos */
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.delete-icon {
  font-size: 22px;
  color: red;
  cursor: pointer;
  transition: color 0.3s, transform 0.2s;
}

.delete-icon:hover {
  color: darkred;
  transform: scale(1.1);
}
</style>
