<template>
  <div class="users-management">
    <h2 class="section-title">Administración de Usuarios</h2>
    <p class="section-subtitle">Gestiona los usuarios del sistema.</p>

    <!-- Botón para agregar usuario -->
    <button class="add-user-btn" @click="toggleUserForm">
  <i class="fas" :class="showAddUserForm || showUpdateUserForm ? 'fa-times' : 'fa-user-plus'"></i>
  <span v-if="!showUpdateUserForm && !showAddUserForm">Agregar Usuario</span>
</button>

    <!-- Formulario para agregar un nuevo usuario -->
    <AddUserForm
      v-if="showAddUserForm"
      @user-added="userAdded"
      @cancel-add-user="handleCancelAdd"
      @error="handleError"
    />

    <!-- Formulario para actualizar usuario -->
    <UpdateUserForm
      v-if="showUpdateUserForm"
      :userData="editingUser"
      @user-updated="userUpdated"
      @cancel-update-user="cancelUpdateUser"
      @error="handleError"
    />

    <!-- Tabla de usuarios -->
    <div v-if="loading" class="loading">Cargando usuarios...</div>
    <div v-else>
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Rol</th>
            <th class="estado-col">Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.apellidos }}</td>
            <td>{{ user.email }}</td>
            <td>{{ formatPhone(user.phone) }}</td><!-- Mostrar Teléfono -->
            <td>{{ user.address || 'Sin dirección' }}</td> <!-- Mostrar Dirección -->

            <!-- Mostrar solo texto si el usuario es SuperAdmin, de lo contrario permitir cambios -->
            <td>
              <div class="rol-wrapper">
              <template v-if="user.role === 'superadmin'">
                <span class="rol-text">{{ user.role }}</span>
              </template>
              <template v-else>
                <select v-model="user.role" @change="updateUserRole(user)">
                  <option value="admin">Administrador</option>
                  <option value="client">Cliente</option>
                </select>
              </template>
            </div>
           </td>

            <!-- Estado con SwitchToggle -->
            <td class="estado-col">
              <div class="estado-wrapper">
              <SwitchToggle
                :modelValue="user.status === 'activo'"
                :disabled="user.role === 'superadmin'"
                class="toggle-button"
                :class="{ 'disabled-toggle': user.role === 'superadmin' }"
                @update:modelValue="(newVal) => toggleUserStatus(user, newVal)"
              />
              <span :class="user.role === 'superadmin' ? 'text-success' : (user.status === 'activo' ? 'text-success' : 'text-danger')">
             {{ user.role === 'superadmin' ? 'Activo' : (user.status === 'activo' ? 'Activo' : 'Inactivo') }}
             </span>
            </div>
            </td>

            <!-- Acciones -->
            <td>
              <i class="fas fa-edit edit-icon" @click="editUser(user)"></i>
              <i class="fas fa-trash-alt delete-icon"
                 :class="{ 'disabled-icon': user.role === 'superadmin' }"
                 @click="deleteUser(user.id)">
              </i>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import SwitchToggle from '@/components/SwitchToggle.vue';
import AddUserForm from './AddUserForm.vue';
import UpdateUserForm from './UpdateUserForm.vue';

export default {
  name: "UsersManagement",
  components: {
    SwitchToggle,
    AddUserForm,
    UpdateUserForm
  },
  data() {
    return {
      users: [],
      loading: false,
      errorMessage: "",
      showAddUserForm: false,
      showUpdateUserForm: false,
      editingUser: null
    };
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await axios.get('/users');
        this.users = response.data.users || response.data;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || "Error al cargar usuarios.";
      } finally {
        this.loading = false;
      }
    },
    formatPhone(number) {
      if (!number) return "Sin número";
      return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3"); // Formato (XXX) XXX-XXXX
    },
    async toggleUserStatus(user, newValue) {
      if (user.role === 'superadmin') {
        alert("No se puede cambiar el estado de un SuperAdmin.");
        return;
      }
      try {
        const newStatus = newValue ? 'activo' : 'inactivo';
        await axios.put(`/users/${user.id}/status`, { status: newStatus });
        user.status = newStatus;
      } catch (error) {
        console.error("Error al cambiar estado del usuario:", error.response?.data || error);
      }
    },
    async updateUserRole(user) {
      if (user.role === 'superadmin') {
        alert("No puedes cambiar el rol de un SuperAdmin.");
        return;
      }
      try {
        await axios.put(`/users/${user.id}/role`, { role: user.role });
        alert(`El rol de ${user.name} ha sido actualizado a ${user.role}.`);
      } catch (error) {
        console.error("Error al actualizar el rol:", error.response?.data || error);
        alert("No se pudo actualizar el rol.");
      }
    },
    toggleUserForm() {
    if (this.showUpdateUserForm) {
      this.showUpdateUserForm = false; // ✅ Cierra el formulario de edición si está activo
    } else {
      this.showAddUserForm = !this.showAddUserForm; // ✅ Alterna el formulario de agregar usuario
    }
  },
    editUser(user) {
      this.editingUser = { ...user };
      this.showUpdateUserForm = true;
      // Opcional: ocultar el formulario de agregar si está abierto
      this.showAddUserForm = false;
    },
    openAddForm() {
      this.showAddUserForm = true;
      // Si se abre el formulario de agregar, nos aseguramos de cerrar el de editar
      this.showUpdateUserForm = false;
      this.editingUser = null;
    },
    cancelUpdateUser() {
      this.showUpdateUserForm = false;
      this.editingUser = null;
    },
    handleCancelAdd() {
      this.showAddUserForm = false;
    },
    userUpdated(updatedUser) {
      // Se actualiza la lista recargando los datos desde la base de datos
      this.fetchUsers();
      this.cancelUpdateUser();
      alert("Usuario actualizado exitosamente.");
    },
    userAdded(newUser) {
      this.fetchUsers(); // Recarga la lista para incluir el nuevo usuario
      this.showAddUserForm = false;
      alert("Usuario agregado exitosamente.");
    },   
    async deleteUser(userId) {
      const user = this.users.find(user => user.id === userId);
      if (user?.role === "superadmin") {
        alert("No puedes eliminar al usuario SuperAdmin.");
        return;
      }
      if (confirm("¿Estás seguro de eliminar este usuario?")) {
        try {
          await axios.delete(`/users/${userId}`);
          this.users = this.users.filter(user => user.id !== userId);
          alert("Usuario eliminado correctamente.");
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Error al eliminar usuario.";
        }
      }
    },
    handleError(msg) {
      this.errorMessage = msg;
    }
  }
};
</script>

<style scoped>
.users-management {
  padding: 20px;
}
.section-title {
  font-size: 24px;
  font-weight: bold;
  color: #345896;
  margin-bottom: 10px;
}
.section-subtitle {
  font-size: 16px;
  color: #555;
  margin-bottom: 20px;
}
.add-user-btn {
  margin-bottom: 20px;
  padding: 8px 12px;
  background-color: #345896;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.estado-col {
  width: 120px;
  text-align: center;
  padding: 10px;
}

.estado-text {
  font-size: 14px;
  font-weight: bold;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}
.estado-wrapper {
  display: flex;
  align-items: center;
  justify-content: center; /* Centrar el contenido */
  gap: 10px; /* Espacio entre el switch y el texto */
}
.users-table th,
.users-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.edit-icon,
.delete-icon {
  font-size: 20px;
  cursor: pointer;
  margin: 0 10px;
}
.edit-icon:hover {
  color: #345896;
}
.delete-icon:hover {
  color: #d9534f;
}
.disabled-icon {
  color: #aaa;
  cursor: not-allowed;
  opacity: 0.6;
}
.loading,
.error {
  margin-top: 10px;
  font-size: 14px;
}
.error {
  color: #d9534f;
}
.text-success {
  color: green;
}
.text-danger {
  color: red;
}
.d-flex {
  display: flex;
}
.align-items-center {
  align-items: center;
}
.gap-2 {
  gap: 8px;
}
.rol-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.rol-text {
  font-weight: bold;
  color: #345996;
}

.edit-icon,
.delete-icon {
  font-size: 18px; /* Reduce el tamaño si es necesario */
  margin: 0 5px; /* Disminuir separación */
}
.disabled-toggle {
  opacity: 0.5; /* Hace que se vea apagado */
  cursor: not-allowed; /* Indica que no es clickable */
  background-color: #ccc !important; /* Hace que el botón se vea gris */
  border-color: #aaa !important; /* Bordes más apagados */
}
.add-user-form {
  margin-bottom: 30px; /* Aumenta el espacio entre el formulario y la tabla */
}
.users-table th:last-child, /* Última columna (Acciones) */
.users-table td:last-child {
  width: auto; /* Ajusta el tamaño según lo necesites */
  text-align: center;
}

/* Dar más espacio a las columnas Nombre y Apellidos (2da y 3ra) */
.users-table th:nth-child(2),
.users-table td:nth-child(2),
.users-table th:nth-child(3),
.users-table td:nth-child(3) {
  width: auto; /* O bien asigna un valor fijo, por ejemplo, width: 200px; */
  text-align: left;
}

/* Ajusta la columna de Email (4ª columna) */
.users-table th:nth-child(4),
.users-table td:nth-child(4) {
  width: auto; /* Modifica este valor según lo necesites */
  text-align: left;
}
.users-table th:nth-child(5), /* Teléfono */
.users-table td:nth-child(5) {
  white-space: nowrap; /* Evita saltos de línea */
  width: 80px; /* Ajusta el tamaño según lo necesites */
  text-align: left;
}
.users-table th:nth-child(6), /* Dirección */
.users-table td:nth-child(6) {
  width: 200px; /* Ajusta según lo necesites */
  text-align: left;
  word-wrap: break-word; /* Asegura que el texto largo se ajuste */
}
.users-table th:nth-child(7), /* Rol */
.users-table td:nth-child(7) {
  width: 120px; /* Ajusta según lo necesites */
  text-align: center;
}
.users-table th:nth-child(8), /* Estado */
.users-table td:nth-child(8) {
  width: 130px; /* Ajusta según necesites */
  text-align: center;
}

.add-user-btn {
  background: linear-gradient(135deg, #345896, #274270);
  color: white;
  padding: 8px 16px; /* ✅ Más compacto */
  border: none;
  border-radius: 8px; /* ✅ Bordes más ajustados */
  font-size: 16px; /* ✅ Texto más pequeño */
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  display: flex;
  align-items: center;
  gap: 6px; /* ✅ Menos espacio entre ícono y texto */
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
}

.add-user-btn i {
  font-size: 18px; /* ✅ Ícono más pequeño */
}

.add-user-btn:hover {
  background: linear-gradient(135deg, #274270, #345896);
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.add-user-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.add-user-btn:hover {
  transform: scale(1.03); /* ✅ Crecimiento más sutil */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
.add-user-btn {
  transition: opacity 0.3s ease-in-out;
}

.add-user-btn[v-if] {
  opacity: 1;
}

.add-user-btn[v-if="false"] {
  opacity: 0;
}
</style>