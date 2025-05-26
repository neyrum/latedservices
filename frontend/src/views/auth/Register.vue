<template>
  <div class="register-container">
    <div class="register-card">
      <h2 class="register-title">Crea tu cuenta</h2>
      <Notification v-if="successMessage" type="success" :message="successMessage" />
      <Notification v-if="errorMessage" type="danger" :message="errorMessage"autoClose :duration="4000" />
      <form @submit.prevent="register">
        <div class="input-group">
          <label for="name">Nombre</label>
          <input type="text" id="name" v-model="form.name" placeholder="Ingrese su nombre" required />
        </div>
        <div class="input-group">
          <label for="apellidos">Apellidos</label>
          <input type="text" id="apellidos" v-model="form.apellidos" placeholder="Ingrese sus apellidos" required />
        </div>
        <div class="input-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" id="email" v-model="form.email" placeholder="Ingrese su correo" required />
        </div>
        <div class="input-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="form.password" placeholder="Ingrese su contraseña" required />
        </div>
        <div class="input-group">
          <label for="phone">Teléfono</label>
          <input type="tel" id="phone" v-model="form.phone" placeholder="Ingrese su número de teléfono" required />
        </div>
        <button type="submit" class="register-btn">Registrarse</button>
        <p class="login-link">
          ¿Ya tienes una cuenta? <router-link to="/login">Accede</router-link>
        </p>
      </form>
      <button @click="goHome" class="back-btn">Volver a Inicio</button>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios";
import Notification from "@/components/Notification.vue";
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  name: "Register",
  components: { Notification },
  setup() {
    const router = useRouter();
    const form = ref({ name: "", apellidos: "", email: "", password: "", phone: "" });
    const successMessage = ref("");
    const errorMessage = ref("");

    const register = async () => {
      // Reinicia los mensajes
      errorMessage.value = "";
      successMessage.value = "";
      
      // Validaciones básicas
      if (!form.value.name.trim()) {
        errorMessage.value = "El nombre es obligatorio.";
        return;
      }
      if (!form.value.apellidos.trim()) {
      errorMessage.value = "Los apellidos son obligatorios.";
      return;
      }
      if (!form.value.email.trim()) {
        errorMessage.value = "El correo electrónico es obligatorio.";
        return;
      }
      const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (!emailPattern.test(form.value.email)) {
        errorMessage.value = "El correo electrónico no es válido.";
        return;
      }
      if (!form.value.password.trim()) {
        errorMessage.value = "La contraseña es obligatoria.";
        return;
      }
      if (form.value.password.length < 6) {
        errorMessage.value = "La contraseña debe tener al menos 6 caracteres.";
        return;
      }
      // 🔹 VALIDACIÓN OBLIGATORIA DEL TELÉFONO
      if (!form.value.phone.trim()) {
      errorMessage.value = "El número de teléfono es obligatorio.";
      return;
      }
      // Validación del formato del teléfono
      const phonePattern = /^\+?[0-9]{8,15}$/;  
      if (!phonePattern.test(form.value.phone.trim())) {
      errorMessage.value = "El número de teléfono no es válido. Debe contener entre 8 y 15 dígitos, con un '+' opcional al inicio.";
      return;
     }

      // Si todo está bien, se envía la solicitud de registro
      try {
        await axios.post("/auth/register", form.value);
        successMessage.value = "Registro exitoso. ¡Por favor accede!";
        errorMessage.value = "";
        // Reiniciar el formulario
        form.value = { name: "",  apellidos: "", email: "", password: "", phone: "" };
        // Redirecciona al login después de 2 segundos
        setTimeout(() => router.push("/login"), 2000);
      } catch (err) {
        errorMessage.value = err.response?.data?.message || "Error al registrarse.";
        successMessage.value = "";
      }
    };

    const goHome = () => {
      router.push("/");
    };

    return { form, successMessage, errorMessage, register, goHome };
  }
};
</script>

<style scoped>
/* Estilo modernizado basado en Vue Material Dashboard 2 */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e2f, #345896);
}

.register-card {
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.register-title {
  font-size: 24px;
  color: #345896;
  margin-bottom: 20px;
  font-weight: bold;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

.input-group label {
  font-size: 14px;
  display: block;
  margin-bottom: 5px;
  color: #345896;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
  transition: 0.3s;
}

.input-group input:focus {
  border-color: #345896;
  outline: none;
}

.register-btn {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background: #345896;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
  font-weight: bold;
}

.register-btn:hover {
  background: #274270;
}

.login-link {
  margin-top: 15px;
  color: #345896;
  font-weight: bold;
}

.back-btn {
  margin-top: 20px;
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  background: #e0e0e0;
  color: #333;
  cursor: pointer;
  transition: 0.3s;
}

.back-btn:hover {
  background: #cfcfcf;
}
</style>
