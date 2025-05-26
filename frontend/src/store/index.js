import { createStore } from "vuex";
import auth from "./auth"; // Módulo de autenticación
import services from "./services"; // Importamos el módulo de servicios
import theme from "./theme";  // Nuevo módulo para el tema
import requests from "./requests"; 

const store = createStore({
  modules: {
    auth, // Registramos `auth`
    services, // Registramos `services`
    theme, // Nuevo módulo para el tema
    requests, // Nuevo módulo para las solicitudes
  },
});

export default store;
