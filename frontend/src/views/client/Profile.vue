<template>
  <div class="container mt-5">
    <div class="row">
      <!-- Tarjeta de Detalles del Perfil -->
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white d-flex align-items-center justify-content-between">
            <h5 class="m-0">Tu Perfil</h5>
            <div>
              <!-- Icono lápiz para editar y flecha para volver a Home -->
              <i class="bi bi-pencil me-2 fs-4" style="cursor: pointer;" @click="toggleEdit"></i>
              <i class="bi bi-arrow-left-circle fs-3" style="cursor: pointer;" @click="goToHome"></i>
            </div>
          </div>
          <div class="card-body text-center">
            <!-- Contenedor de imagen con botón para eliminar -->
            <div class="profile-image-container mb-3">
              <img :src="user?.profilePicture || defaultProfilePicture" alt="Foto Actual" class="profile-img" />
              <button v-if="user?.profilePicture" class="btn btn-danger btn-sm delete-btn" @click="deleteProfilePicture">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <div class="profile-details">
              <p class="mb-1"><i class="bi bi-person-fill"></i> <strong>{{ user?.name || 'Nombre' }}</strong></p>
              <p class="mb-1"><i class="bi bi-card-text"></i> <strong>{{ user?.apellidos || 'Apellidos' }}</strong></p>
              <p class="mb-1"><i class="bi bi-envelope"></i> {{ user?.email || 'Email' }}</p>
              <p class="mb-1"><i class="bi bi-telephone"></i> {{ user?.phone || 'Teléfono' }}</p>
              <p class="mb-0"><i class="bi bi-geo-alt"></i> {{ user?.address || 'Dirección' }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tarjeta de Modificar Perfil (se muestra al activar la edición) -->
      <div v-if="showEdit" class="col-md-8 mb-4">
        <div class="card shadow-sm border-0">
          <div class="card-header bg-primary text-white">
            <h5 class="m-0">Modificar Perfil</h5>
          </div>
          <div class="card-body">
            <!-- Mensajes de alerta -->
            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>
  
            <!-- Sección para actualizar la foto de perfil -->
            <div class="mb-4">
              <h6>Actualizar Foto de Perfil</h6>
              <!-- Vista actual o selector para nueva imagen -->
              <div v-if="!showCropper" class="text-center mb-3">
                <img :src="user?.profilePicture || defaultProfilePicture" alt="Foto de Perfil" class="profile-img-edit mb-2" />
                <div>
                  <input type="file" @change="onFileChange" class="form-control" />
                </div>
              </div>
  
              <!-- Interfaz de Cropper -->
              <div v-if="showCropper" class="text-center mb-3">
                <!-- Contenedor fijo para el recorte -->
                <div class="cropper-wrapper mx-auto">
                  <img ref="cropperImage" :src="imagePreview" alt="Recortar imagen" class="img-fluid" />
                </div>
                <div class="mt-2">
                  <button class="btn btn-success me-2" @click="cropImage">Recortar Imagen</button>
                  <button class="btn btn-primary me-2" @click="uploadWithoutCrop">Subir sin recortar</button>
                  <button class="btn btn-secondary" @click="cancelCrop">Cancelar</button>
                </div>
              </div>
              <!-- Vista previa de nueva foto recortada -->
              <div v-if="croppedImage" class="text-center">
                <h6>Nueva Foto Previa</h6>
                <img :src="croppedImage" alt="Imagen recortada" class="profile-img-edit mb-2" />
                <div>
                  <button class="btn btn-primary" @click="uploadProfilePicture">Confirmar Foto</button>
                </div>
              </div>
            </div>
  
            <!-- Formulario para actualizar datos -->
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label for="name" class="form-label">Nombre</label>
                <input id="name" v-model="form.name" type="text" class="form-control" placeholder="Ingresa tu nombre" />
              </div>
              <div class="mb-3">
                <label for="apellidos" class="form-label">Apellidos</label>
                <input id="apellidos" v-model="form.apellidos" type="text" class="form-control" placeholder="Ingresa tus apellidos" />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <!-- Usualmente el email se mantiene sin editar -->
                <input id="email" v-model="form.email" type="email" class="form-control" placeholder="Ingresa tu email" disabled />
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Teléfono</label>
                <input id="phone" v-model="form.phone" type="tel" class="form-control" placeholder="Ingresa tu teléfono" />
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Dirección</label>
                <textarea id="address" v-model="form.address" class="form-control" placeholder="Ingresa tu dirección"></textarea>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Contraseña</label>
                <input id="password" v-model="form.password" type="password" class="form-control" placeholder="Ingresa tu nueva contraseña" />
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
import axios from "@/plugins/axios";
import defaultProfilePicture from "@/assets/img/default-profile.jpg";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import { ref, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import { eventBus } from "@/utils/eventBus";
import { useStore } from "vuex";

export default {
  name: "Profile",
  setup() {
    const router = useRouter();
    const store = useStore();

    const user = ref(null);
    // Inicializamos el formulario con valores vacíos
    const form = ref({
      name: "",
      apellidos: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    });
    const imagePreview = ref(null);
    const showCropper = ref(false);
    const selectedFile = ref(null);
    const cropperInstance = ref(null);
    const croppedImage = ref(null);
    const successMessage = ref("");
    const errorMessage = ref("");
    const cropperImage = ref(null);
    const showEdit = ref(false);

    const fetchProfile = async () => {
      try {
        const response = await axios.get("/users/me");
        user.value = response.data;
        // Se carga el formulario con los datos actuales (menos la contraseña)
        form.value = { ...response.data, password: "" };
      } catch (error) {
        errorMessage.value = error.response?.data?.message || "Error al cargar el perfil.";
      }
    };

    onMounted(() => {
      fetchProfile();
      // Escuchar actualizaciones globales para refrescar el perfil en tiempo real.
      eventBus.on("profileUpdated", (updatedUser) => {
        user.value = updatedUser;
        form.value = { ...updatedUser, password: "" };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      });
    });

    const toggleEdit = () => {
      showEdit.value = !showEdit.value;
      // Al activar la edición, se carga el formulario con los datos actuales.
      form.value = { ...user.value, password: "" };
    };

    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        selectedFile.value = file;
        imagePreview.value = URL.createObjectURL(file);
        showCropper.value = true;
        nextTick(() => {
          if (cropperImage.value) {
            if (cropperInstance.value) {
              cropperInstance.value.destroy();
            }
            cropperInstance.value = new Cropper(cropperImage.value, {
              aspectRatio: 1,
              viewMode: 1,
              autoCropArea: 1,
              responsive: true,
              background: false,
              minContainerWidth: 400,
              minContainerHeight: 300,
            });
            console.log("Cropper inicializado tras cargar la imagen.");
          } else {
            errorMessage.value = "No se encontró la imagen para recortar.";
          }
        });
      }
    };

    const cropImage = () => {
      if (cropperInstance.value) {
        const canvas = cropperInstance.value.getCroppedCanvas({ width: 200, height: 200 });
        croppedImage.value = canvas.toDataURL("image/jpeg");
        showCropper.value = false;
        cropperInstance.value.destroy();
        cropperInstance.value = null;
        imagePreview.value = null;
      }
    };

    const cancelCrop = () => {
      showCropper.value = false;
      imagePreview.value = null;
      if (cropperInstance.value) {
        cropperInstance.value.destroy();
        cropperInstance.value = null;
      }
    };

    const uploadWithoutCrop = () => {
      if (selectedFile.value) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileBase64 = e.target.result;
          axios
            .post("/users/profile-picture", { profilePicture: fileBase64 })
            .then((response) => {
              user.value.profilePicture = response.data.profilePicture;
              successMessage.value = "¡Foto de perfil actualizada sin recorte!";
              errorMessage.value = "";
              selectedFile.value = null;
              showCropper.value = false;
              croppedImage.value = null;
            })
            .catch((error) => {
              errorMessage.value =
                error.response?.data?.message || "Error al subir la foto de perfil.";
              successMessage.value = "";
            });
        };
        reader.readAsDataURL(selectedFile.value);
      } else {
        errorMessage.value = "No se ha seleccionado ninguna imagen.";
      }
    };

    const uploadProfilePicture = async () => {
      if (!croppedImage.value) {
        errorMessage.value = "Por favor, recorta la imagen o elige subir sin recortar.";
        return;
      }
      try {
        const response = await axios.post("/users/profile-picture", { profilePicture: croppedImage.value });
        user.value.profilePicture = response.data.profilePicture;
        successMessage.value = "¡Foto de perfil actualizada!";
        errorMessage.value = "";
        croppedImage.value = null;
      } catch (error) {
        errorMessage.value = error.response?.data?.message || "Error al subir la foto de perfil.";
        successMessage.value = "";
      }
    };

    const deleteProfilePicture = async () => {
      try {
        await axios.delete("/users/profile-picture");
        user.value.profilePicture = null;
        successMessage.value = "¡Foto de perfil eliminada!";
        errorMessage.value = "";
      } catch (error) {
        errorMessage.value = error.response?.data?.message || "Error al eliminar la foto de perfil.";
        successMessage.value = "";
      }
    };

    const updateProfile = async () => {
      const payload = { ...form.value };
      if (!payload.password) {
        delete payload.password;
      }
      try {
        const response = await axios.put("/users/me", payload);
        user.value = response.data.user;
        store.commit("UPDATE_USER_DATA", response.data);
        eventBus.emit("profileUpdated", response.data);
        successMessage.value = "¡Perfil actualizado exitosamente!";
        errorMessage.value = "";
        // Reiniciar formulario con datos actualizados
        form.value = { ...response.data.user, password: "" };
      } catch (error) {
        errorMessage.value = error.response?.data?.message || "Error al actualizar el perfil.";
        successMessage.value = "";
      }
    };

    const goToHome = () => {
      router.push("/");
    };

    return {
      user,
      form,
      imagePreview,
      showCropper,
      selectedFile,
      cropperImage,
      croppedImage,
      onFileChange,
      cropImage,
      cancelCrop,
      uploadProfilePicture,
      uploadWithoutCrop,
      deleteProfilePicture,
      updateProfile,
      successMessage,
      errorMessage,
      goToHome,
      defaultProfilePicture,
      showEdit,
      toggleEdit,
    };
  },
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
.profile-img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #345896;
}
.profile-img-edit {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #345896;
}
.card {
  border-radius: 0.5rem;
}
.card-header {
  font-weight: bold;
}
.cropper-wrapper {
  width: 400px;
  height: 300px;
  overflow: hidden;
  margin: 0 auto;
  position: relative;
}
.cropper-wrapper img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.alert {
  margin-bottom: 1rem;
}
.profile-details p {
  margin-bottom: 0.5rem;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
.form-label {
  font-weight: bold;
}
button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button[type="submit"] {
  background: #345896;
  color: white;
}
button:hover {
  opacity: 0.8;
}
.profile-image-container {
  position: relative;
  display: inline-block;
}
.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  border: none;
  background: rgba(220, 53, 69, 0.8);
  color: #fff;
  padding: 2px 6px;
  border-radius: 50%;
}
</style>
