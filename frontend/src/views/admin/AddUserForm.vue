<template>
  <div class="add-user-form">
    <h3>Nuevo Usuario</h3>
    <form @submit.prevent="submitUser">
      <div>
        <label>Nombre:</label>
        <input type="text" v-model="userForm.name" required />
      </div>
      <div>
        <label>Apellidos:</label>
        <input type="text" v-model="userForm.apellidos" required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" v-model="userForm.email" required />
      </div>
      <div>
        <label>Contraseña:</label>
        <input type="password" v-model="userForm.password" required />
      </div>
      <!-- Agrupamos los selectores en una misma fila -->
      <div class="select-group">
        <div class="select-container">
          <label>Rol:</label>
          <select v-model="userForm.role">
            <option value="admin">Admin</option>
            <option value="superadmin">SuperAdmin</option>
            <option value="client">Cliente</option>
          </select>
        </div>
        <div class="select-container">
          <label>Estado:</label>
          <select v-model="userForm.status">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit">✅ Guardar</button>
        <button type="button" @click="cancelUser">❌ Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from '@/plugins/axios';

export default {
  name: 'AddUserForm',
  data() {
    return {
      userForm: {
        name: "",
        apellidos: "",
        email: "",
        password: "",
        role: "client",
        status: "activo"
      }
    };
  },
  methods: {
    async submitUser() {
      try {
        const response = await axios.post('/users', this.userForm);
        this.$emit('user-added', response.data);
        // Reiniciamos el formulario, incluyendo el campo apellidos
        this.userForm = { name: "", apellidos: "", email: "", password: "", role: "admin", status: "activo" };
      } catch (error) {
        console.error("Error al agregar usuario:", error.response?.data || error);
        this.$emit('error', error.response?.data?.message || "Error al agregar usuario.");
      }
    },
    cancelUser() {
      this.$emit('cancel-add-user');
    }
  }
};
</script>

<style scoped>
.add-user-form {
  max-width: 350px;
  margin: auto;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.add-user-form h3 {
  text-align: center;
  font-size: 20px;
  color: #345896;
  margin-bottom: 15px;
}

.add-user-form form > div {
  margin-bottom: 15px;
}

.add-user-form label {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  display: block;
}

.add-user-form input,
.add-user-form select {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  transition: all 0.3s ease;
}

.add-user-form input:focus,
.add-user-form select:focus {
  border-color: #345896;
  box-shadow: 0 0 5px rgba(52, 88, 150, 0.5);
}

.select-group {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.select-container {
  width: 48%;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button[type="submit"] {
  background: #345896;
  color: white;
}

button[type="button"] {
  background: #ccc;
  color: #333;
}

button:hover {
  opacity: 0.8;
}
</style>
