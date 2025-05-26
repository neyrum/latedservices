import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 🔹 Importar estilos globales
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap; // Asignamos Bootstrap a `window`
import '@fortawesome/fontawesome-free/css/all.min.css';

import "bootstrap-icons/font/bootstrap-icons.css";
import "./css/styles.css";
import "./css/theme.css";

// 🔹 Importar y registrar Cropper.js para manipulación de imágenes
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";

// 🔹 Importar AOS.js para animaciones y configurarlo
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init({ offset: 100, delay: 200, duration: 1000, easing: "ease-in-out", once: true });

// Importar y registrar el plugin Filler para Chart.js**
import { Chart, Filler } from "chart.js";
Chart.register(Filler);

AOS.init({
  offset: 100, // Distancia desde la parte superior para activar la animación
  delay: 200, // Retardo antes de iniciar la animación
  duration: 1000, // Duración en milisegundos
  easing: "ease-in-out", // Suavidad de animación
  once: true, // Solo animar una vez
});

// 🔹 Importar notificaciones globales
import Notification from "@/components/Notification.vue";
import UserNotifications from "@/components/UserNotifications.vue";

// 🔹 Inicializar aplicación
store.dispatch("auth/validateToken").finally(() => {
  console.log("Bootstrap Loaded:", typeof bootstrap);

  const app = createApp(App);

  // 🔹 Registrar Cropper como propiedad global
  app.config.globalProperties.$Cropper = Cropper;

   // Registrar componentes globales
   app.component("Notification", Notification);
   app.component("UserNotifications", UserNotifications);

  // Usar Vue Router, Vuex Store
  app.use(router);
  app.use(store);
 

  // Montar la aplicación
  app.mount("#app");
});
