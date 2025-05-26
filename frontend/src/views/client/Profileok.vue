<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <!-- Tarjeta del perfil -->
        <div class="card shadow-lg">
          <div class="card-header bg-primary text-white text-center d-flex align-items-center justify-content-between">
            <i class="bi bi-arrow-left-circle fs-4" @click="goToHome" style="cursor: pointer;"></i>
            <h3 class="m-0 flex-grow-1 text-center">Perfil de Usuario</h3>
          </div>
          <div class="card-body">
            <!-- Mensajes de éxito y error -->
            <div v-if="successMessage" class="alert alert-success d-flex align-items-center" role="alert">
              <i class="bi bi-check-circle-fill me-2"></i>
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              {{ errorMessage }}
            </div>

            <!-- Foto de perfil -->
            <div class="text-center mb-4">
              <div class="profile-picture-wrapper">
                <img
                  :src="user?.profilePicture || defaultProfilePicture"
                  alt="Foto de Perfil"
                  class="img-thumbnail shadow"
                />
              </div>
              <form @submit.prevent="uploadProfilePicture" class="mt-3">
                <div class="form-group">
                  <input
                    type="file"
                    id="profilePicture"
                    @change="onFileChange"
                    class="form-control"
                  />
                </div>
                <button
                  type="submit"
                  class="btn btn-sm mt-2"
                  :class="{'btn-secondary': !croppedImage, 'btn-primary': croppedImage}"
                  :disabled="!croppedImage"
                >
                  Cambiar Imagen
                </button>
              </form>
            </div>

          <!-- Detalles del perfil -->
          <div class="profile-details mb-4">
          <h4>Detalles del Perfil</h4>
          <p><strong>Nombre:</strong> {{ displayValue(user?.name) }}</p>
          <p><strong>Email:</strong> {{ displayValue(user?.email) }}</p>
          <p><strong>Teléfono:</strong> {{ displayValue(user?.phone) }}</p>
         <p><strong>Dirección:</strong> {{ displayValue(user?.address, 'No especificada') }}</p>
        </div>

            <!-- Formulario de actualización -->
            <form @submit.prevent="updateProfile">
              <div class="form-group mb-3">
                <label for="name" class="form-label">Nombre</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>
              <div class="form-group mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  class="form-control"
                  placeholder="Ingresa tu email"
                  required
                />
              </div>
              <div class="form-group mb-3">
                <label for="phone" class="form-label">Teléfono</label>
                <input
                  id="phone"
                  v-model="form.phone"
                  type="tel"
                  class="form-control"
                  placeholder="Ingresa tu número de teléfono"
                />
              </div>
              <div class="form-group mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  class="form-control"
                  placeholder="Ingresa tu nueva contraseña"
                />
              </div>
              <div class="form-group mb-3">
                <label for="address" class="form-label">Dirección</label>
                <textarea
                  id="address"
                  v-model="form.address"
                  class="form-control"
                  placeholder="Ingresa tu dirección"
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-100">Actualizar Perfil</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import defaultProfilePicture from "@/assets/img/default-profile.jpg";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      form: {
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
      },
      selectedFile: null,
      imagePreview: null,
      croppedImage: null,
      cropper: null,
      showCropper: false,
      successMessage: '',
      errorMessage: '',
      defaultProfilePicture,
    };
  },
  async created() {
    await this.fetchProfile();
  },
  methods: {
    displayValue(value, defaultValue = 'No especificado') {
    return value || defaultValue;
  },
    goToHome() {
      this.$router.push('/');
    },
    async fetchProfile() {
  try {
    const response = await axios.get('/users/me'); // Obtiene los datos del perfil desde el backend
    this.user = response.data; // Asigna los datos del usuario al estado `user`
    this.user.profilePicture = this.user.profilePicture || defaultProfilePicture; // Usa una imagen predeterminada si no hay foto
    this.form.name = this.user.name || ''; // Maneja valores vacíos
    this.form.email = this.user.email || ''; // Maneja valores vacíos
    this.form.phone = this.user.phone || ''; // Maneja valores vacíos
    this.form.address = this.user.address || ''; // Maneja valores vacíos
    this.errorMessage = '';
  } catch (error) {
    this.errorMessage = error.response?.data?.message || 'Error al cargar el perfil.';
    this.user = null;
  }
},
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.imagePreview = URL.createObjectURL(file);
        this.showCropper = true;
        this.$nextTick(() => {
          const imageElement = this.$refs.cropperImage;
          this.cropper = new Cropper(imageElement, {
            aspectRatio: 1,
            viewMode: 1,
            responsive: true,
            background: false,
            autoCropArea: 1,
          });
        });
      }
    },
    cancelCrop() {
      this.showCropper = false;
      this.imagePreview = null;
      if (this.cropper) {
        this.cropper.destroy();
        this.cropper = null;
      }
    },
    async cropImage() {
      if (this.cropper) {
        const canvas = this.cropper.getCroppedCanvas({
          width: 200,
          height: 200,
        });
        this.croppedImage = canvas.toDataURL("image/jpeg");
        this.showCropper = false;
        this.imagePreview = null;
        this.cropper.destroy();
        this.cropper = null;
      }
    },
    async uploadProfilePicture() {
      if (!this.croppedImage) {
        this.errorMessage = 'Por favor recorta una imagen antes de subirla.';
        return;
      }

      try {
        const response = await axios.post('/users/profile-picture', {
          profilePicture: this.croppedImage,
        });
        this.user.profilePicture = response.data.profilePicture;
        this.successMessage = '¡Foto de perfil actualizada exitosamente!';
        this.errorMessage = '';
        this.croppedImage = null;
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error al cargar la foto de perfil.';
        this.successMessage = '';
      }
    },
    async updateProfile() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(
          '/users/me',
          this.form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        this.user = response.data;
        this.successMessage = '¡Perfil actualizado exitosamente!';
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Error al actualizar el perfil.';
        this.successMessage = '';
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
.card {
  border-radius: 0.5rem;
}
.card-header {
  font-size: 1.5rem;
  font-weight: bold;
}
.profile-picture-wrapper {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 50%;
  display: inline-block;
}
.img-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-details {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.profile-details h4 {
  margin-bottom: 15px;
  font-size: 1.5rem;
  color: #333;
}
.profile-details p {
  margin: 5px 0;
  font-size: 1rem;
  color: #555;
}
.modal-body {
  width: 400px;
  height: 400px;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.alert {
  display: flex;
  align-items: center;
}
.bi-arrow-left-circle {
  color: white;
  margin-right: 10px;
  transition: color 0.3s ease;
}
.bi-arrow-left-circle:hover {
  color: #d1d1d1;
}
</style>