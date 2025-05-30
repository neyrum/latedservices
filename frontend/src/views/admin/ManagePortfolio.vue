<template>
  <div class="manage-portfolio">
    <h3 class="title">Administración del Portafolio</h3>
    
    <!-- Botón para mostrar/ocultar formulario -->
    <button @click="toggleForm" class="btn-toggle">
      <i class="fas" :class="showForm ? 'fa-times' : 'fa-plus-circle'"></i>
      <span v-if="!showForm">{{ isEditing ? "Editar Proyecto" : "Agregar Proyecto" }}</span>
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
        
        <div class="input-group">
          <label for="category">Categoría</label>
          <input
            v-model="project.category"
            type="text"
            id="category"
            placeholder="Ejemplo: Diseño gráfico"
            required
          />
        </div>
        
        <div class="input-group">
          <label for="client">Cliente</label>
          <input
            v-model="project.client"
            type="text"
            id="client"
            placeholder="Ejemplo: Empresa X"
            required
          />
        </div>
        
        <!-- Grupo para selección de archivo -->
        <div class="input-group file-group">
          <span class="file-title">Subir imagen o video</span>
          <label for="media" class="file-select-box">
            <span class="upload-btn">
              <i class="fas fa-cloud-upload-alt"></i>
            </span>
            <span class="select-text">
              {{ selectedFileName || "Seleccionar archivo" }}
            </span>
          </label>
          <input
            type="file"
            ref="fileInput"
            accept="image/*,video/*"
            @change="handleMediaUpload"
            id="media"
            class="file-input"
          />
        </div>
        
        <div class="input-group checkbox-group">
          <label>
            <input type="checkbox" v-model="project.featured" />
            Destacar en Portafolio
          </label>
        </div>
        
        <div class="button-group">
          <button type="submit" class="btn-icon">
            {{ isEditing ? "Actualizar" : "Guardar Proyecto" }}
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
          <template v-if="!item.mediaUrl || item.mediaUrl === defaultImageUrl">
            <img :src="defaultImageUrl" alt="Imagen por defecto" class="service-image" />
          </template>
          <template v-else-if="item.mediaUrl.includes('.mp4')">
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
          <p class="category-client">
            Cliente: {{ item.client }} | Categoría: {{ item.category }}
          </p>
          <div class="action-buttons">
            <i class="fas fa-edit edit-icon" @click="editProject(item)"></i>
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
      project: {
        id: null,
        name: "",
        description: "",
        category: "",
        client: "",
        media: null,
        featured: false
      },
      showForm: false,
      isEditing: false,
      loading: true,
      selectedFileName: "",
      defaultImageUrl: process.env.VUE_APP_DEFAULT_IMAGE_URL // Define en .env, e.g. "http://localhost:3000/assets/img/default-placeholder.png"
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
    toggleForm() {
      this.showForm = !this.showForm;
      if (!this.showForm) {
        this.isEditing = false;
        this.resetForm();
      }
    },
    resetForm() {
      this.project = {
        id: null,
        name: "",
        description: "",
        category: "",
        client: "",
        media: null,
        featured: false
      };
      this.selectedFileName = "";
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = "";
      }
    },
    editProject(item) {
      // Cargamos el proyecto para editar y reiniciamos el campo file
      this.project = { ...item, media: null };
      this.selectedFileName = "";
      this.isEditing = true;
      this.showForm = true;
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
        formData.append("category", this.project.category);
        formData.append("client", this.project.client);
        formData.append("featured", this.project.featured ? "true" : "false");
        if (this.project.media) {
          formData.append("media", this.project.media);
        }
        if (this.isEditing && this.project.id) {
          await axios.put(`/portfolio/projects/${this.project.id}`, formData);
        } else {
          await axios.post("/portfolio/projects", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }
        alert("✅ Proyecto guardado exitosamente.");
        this.fetchPortfolioItems();
        this.toggleForm();
      } catch (error) {
        console.error("Error al guardar el proyecto:", error);
        alert("❌ Ocurrió un error al guardar el proyecto.");
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
  margin: 20px auto;
  max-width: 960px;
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
.form-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  max-width: 400px;
}
.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}
.input-group label {
  margin-bottom: 5px;
  color: #345896;
  font-weight: bold;
}
.input-group input,
.input-group textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
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
.file-select-box {
  display: inline-flex;
  align-items: center;
  width: 220px;
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
.file-input {
  display: none;
}
.checkbox-group {
  margin-bottom: 15px;
  font-size: 16px;
  color: #345896;
}
.button-group {
  display: flex;
  gap: 10px;
}
.btn-icon {
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
.portfolio-list {
  margin-top: 30px;
}
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}
.service-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.service-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
}
.service-video {
  width: 100%;
  border-radius: 8px;
}
.category-client {
  font-size: 14px;
  color: #555;
  margin: 10px 0;
}
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}
.delete-icon,
.edit-icon {
  font-size: 22px;
  cursor: pointer;
  transition: color 0.3s, transform 0.2s;
}
.delete-icon {
  color: red;
}
.delete-icon:hover {
  color: darkred;
  transform: scale(1.1);
}
.edit-icon {
  color: #345896;
}
.edit-icon:hover {
  transform: scale(1.1);
}
</style>
