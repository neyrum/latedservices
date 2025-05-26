<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Accede a tu cuenta</h2>
      <Notification v-if="errorMessage" type="danger" :message="errorMessage" autoClose duration="4000" />
      <form @submit.prevent="login">
        <div class="input-group">
          <label for="email">Correo Electrónico</label>
          <input type="email" id="email" v-model="form.email" placeholder="Ingrese su correo" required />
        </div>
        <div class="input-group">
          <label for="password">Contraseña</label>
          <input type="password" id="password" v-model="form.password" placeholder="Ingrese su contraseña" required />
        </div>
        <material-switch id="rememberMe" name="rememberMe">Recordarme</material-switch>
        <button type="submit" class="login-btn">Acceder</button>
        <p class="register-link">
          ¿No tienes una cuenta? <router-link to="/register">Regístrate</router-link>
        </p>
      </form>
      <button @click="goHome" class="back-btn">Volver a Inicio</button>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import MaterialSwitch from "@/components/MaterialSwitch.vue";
import Notification from "@/components/Notification.vue";

export default {
  name: "Login",
  components: { Notification, MaterialSwitch },
  setup() {
    const store = useStore();
    const router = useRouter();
    const form = ref({ email: "", password: "" });
    const errorMessage = ref("");

    onMounted(() => {
      if (store.getters["auth/isAuthenticated"]) {
        router.push("/client/services");
      }
    });

    const login = async () => {
      try {
        await store.dispatch("auth/login", form.value);
        router.push("/client/services");
      } catch (err) {
        errorMessage.value = err.response?.data?.message || "Error al iniciar sesión.";

      // 🔹 Limpiar el mensaje después de 3 segundos para mejor UX
      setTimeout(() => {
      errorMessage.value = "";
       }, 3000);
      }
    };

    const goHome = () => {
      router.push("/");
    };

    return { form, errorMessage, login, goHome };
  }
};
</script>

<style scoped>
/* Diseño modernizado basado en Vue Material Dashboard 2 Laravel */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1e1e2f, #345896);
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.login-title {
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

.login-btn {
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

.login-btn:hover {
  background: #274270;
}

.register-link {
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
