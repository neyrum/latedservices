<template>
    <div class="update-user-form">
      <h3>Actualizar Usuario</h3>
      <form @submit.prevent="submitUpdate">
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
          <!-- El email se muestra pero se deshabilita para evitar cambios -->
          <input type="email" v-model="userForm.email" required disabled />
        </div>
        <div>
        <label>Teléfono:</label>
        <input type="text" v-model="userForm.phone" required />
      </div>
      <div>
        <label>Dirección:</label>
        <input type="text" v-model="userForm.address" required />
      </div>
        <div>
          <label>Contraseña:</label>
          <!-- La contraseña se puede dejar vacía para no cambiarla -->
          <input type="password" v-model="userForm.password" placeholder="Dejar vacío para conservar actual" />
        </div>
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
          <button type="submit">🔄 Actualizar</button>
          <button type="button" @click="cancelUpdate">❌ Cancelar</button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from '@/plugins/axios';
  
  export default {
    name: "UpdateUserForm",
    props: {
      userData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        userForm: { ...this.userData }
      };
    },
    watch: {
      userData(newVal) {
        this.userForm = { ...newVal };
      }
    },
    methods: {
      async submitUpdate() {
        try {
          // Elimina la contraseña del payload si está vacía
          let payload = { ...this.userForm };
          if (!payload.password || payload.password.trim() === "") {
          delete payload.password;
          }
          const response = await axios.put(`/users/${payload.id}/profile`, payload);
          this.$emit('user-updated', response.data);
        } catch (error) {
          console.error("Error al actualizar usuario:", error.response?.data || error);
          this.$emit('error', error.response?.data?.message || 'Error al actualizar usuario.');
        }
      },
      cancelUpdate() {
        this.$emit("cancel-update-user");
      }
    }
  };
  </script>
  
  <style scoped>
  .update-user-form {
    max-width: 350px;
    margin: auto;
    padding: 15px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }
  .update-user-form h3 {
    text-align: center;
    font-size: 20px;
    color: #345896;
    margin-bottom: 15px;
  }
  .update-user-form form > div {
    margin-bottom: 15px;
  }
  .update-user-form label {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
    display: block;
  }
  .update-user-form input,
  .update-user-form select {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }
  .update-user-form input:focus,
  .update-user-form select:focus {
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
  