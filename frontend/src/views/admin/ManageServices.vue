<template>
  <div class="manage-services">
    <h3 class="title">Administración de Servicios</h3>

    <!-- Botón para mostrar/ocultar formulario -->
    <button @click="showForm = !showForm" class="btn-toggle">
      <i class="fas" :class="showForm ? 'fa-times' : 'fa-plus-circle'"></i>
      <span v-if="!showForm"> Agregar Servicio</span>
    </button>

    <!-- Formulario de creación/edición -->
    <div v-if="showForm" class="form-container">
      <form @submit.prevent="saveService">
        <div class="input-group">
          <label for="name">Nombre del servicio</label>
          <input
            v-model="serviceData.name"
            type="text"
            id="name"
            placeholder="Nombre del servicio"
            required
          />
        </div>
        <div class="input-group">
          <label for="description">Descripción</label>
          <input
            v-model="serviceData.description"
            type="text"
            id="description"
            placeholder="Descripción del servicio"
            required
          />
        </div>
        <div class="input-group">
          <label for="price">Precio</label>
          <input
            v-model.number="serviceData.price"
            type="number"
            id="price"
            placeholder="Precio del servicio"
          />
        </div>

        <div class="input-group">
  <label for="icon">Selecciona un icono</label>
  <select v-model="serviceData.icon" id="icon">
    <option v-for="icon in availableIcons" :key="icon.class" :value="icon.class">
      {{ icon.name }}
    </option>
  </select>
</div>
        <!-- Vista previa del icono seleccionado -->
<div class="icon-preview">
  <span class="fa-stack fa-2x">
    <i class="fas fa-circle fa-stack-2x text-primary"></i>
    <i :class="serviceData.icon" class="fa-stack-1x fa-inverse"></i>
  </span>
</div>

        <div class="button-group">
  <button type="submit" class="btn-icon">
    <i class="fas fa-plus"></i> {{ isEditing ? 'Actualizar' : 'Agregar' }}
  </button>
  <button v-if="isEditing" @click="cancelEdit" class="btn btn-secondary">Cancelar</button>
</div>

      </form>
    </div>

    <!-- Lista de servicios -->
    <div class="service-list">
      <div class="card" v-for="service in services" :key="service.id">
        <div class="card-body">
          <h5 class="card-title">{{ service.name }}</h5>
          <p class="card-text">{{ service.description }}</p>
          <p class="card-text">
            Precio:
            {{ service.price !== null ? `$${parseFloat(service.price).toFixed(2)}` : "Gratuito" }}
          </p>
          
          <!-- Mostrar el icono del servicio -->
          <span class="fa-stack fa-2x">
            <i class="fas fa-circle fa-stack-2x text-primary"></i>
            <i :class="service.icon || 'fas fa-tools'" class="fa-stack-1x fa-inverse"></i>
          </span>

          <div class="action-buttons">
            <i class="fas fa-edit edit-icon" @click="editService(service)"></i>
            <i class="fas fa-trash-alt delete-icon" @click="deleteService(service.id)"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Importa axios según tu configuración
import axios from "@/plugins/axios";
// Importa los iconos desde el archivo icons.js (asegúrate que esté en src/data/icons.js)
import { availableIcons } from "../../data/icons.js";

export default {
  name: "ManageServices",
  data() {
    return {
      services: [],
      // Agregamos el campo icon con un valor por defecto
      serviceData: { name: "", description: "", price: null, icon: "fas fa-tools" },
      isEditing: false,
      editId: null,
      showForm: false,
      availableIcons, // Usamos los iconos importados desde icons.js
    };
  },
  async created() {
    await this.fetchServices();
  },
  methods: {
    async fetchServices() {
      try {
        const response = await axios.get("/services");
        this.services = response.data;
      } catch (error) {
        console.error("Error al obtener servicios:", error);
      }
    },
    async saveService() {
      console.log("Datos antes de enviar:", this.serviceData); // Verifica en consola

      if (!this.serviceData.name.trim() || !this.serviceData.description.trim()) {
        alert("El nombre y la descripción son obligatorios.");
        return;
      }

      this.serviceData.price = this.serviceData.price
        ? parseFloat(this.serviceData.price)
        : null;

      try {
        if (this.isEditing) {
          await axios.put(`/services/${this.editId}`, this.serviceData);
        } else {
          await axios.post("/services", this.serviceData);
        }
        alert("Servicio guardado correctamente.");
        this.resetForm();
        await this.fetchServices();
      } catch (error) {
        console.error("Error al guardar servicio:", error.response?.data || error);
      }
    },
    editService(service) {
      this.serviceData = { ...service };
      this.isEditing = true;
      this.editId = service.id;
      this.showForm = true;
    },
    cancelEdit() {
      this.resetForm();
    },
    async deleteService(serviceId) {
      if (confirm("¿Estás seguro de eliminar este servicio?")) {
        try {
          await axios.delete(`/services/${serviceId}`);
          await this.fetchServices();
        } catch (error) {
          console.error("Error al eliminar servicio:", error);
        }
      }
    },
    resetForm() {
      this.serviceData = { name: "", description: "", price: null, icon: "fas fa-tools" };
      this.isEditing = false;
      this.editId = null;
      this.showForm = false;
    },
  },
};
</script>

<style scoped>
.manage-services {
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

.form-container {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.input-group label {
  font-size: 14px;
  color: #345896;
  margin-bottom: 5px;
}

.input-group input,
.input-group select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.input-group input:focus,
.input-group select:focus {
  border-color: #345896;
  outline: none;
}

.button-group {
  display: flex;
  gap: 10px;
}

.service-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.card {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 250px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #345896;
}

.card-text {
  font-size: 16px;
  color: #333;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-icon,
.delete-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s, transform 0.2s;
}

.edit-icon:hover {
  color: #345896;
  transform: scale(1.1);
}

.delete-icon:hover {
  color: #d9534f;
  transform: scale(1.1);
}

.btn-icon {
  background: linear-gradient(135deg, #345896, #274270);
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon i {
  font-size: 20px;
}

.btn-icon:hover {
  background: linear-gradient(135deg, #274270, #345896);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.btn-icon:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.btn-toggle i {
  transition: transform 0.3s ease-in-out;
}

.btn-toggle:hover i {
  transform: scale(1.2);
}
.icon-preview {
  margin-bottom: 15px;  /* Ajusta el valor según la separación requerida */
}
</style>
