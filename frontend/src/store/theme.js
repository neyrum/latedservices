// src/store/theme.js
export default {
    namespaced: true, // para que el módulo sea autocontenible
    state: {
      // Recupera el estado guardado en localStorage o usa false (modo claro) por defecto
      isDarkMode: localStorage.getItem("isDarkMode") === "true" || false,
    },
    mutations: {
      TOGGLE_THEME(state) {
        state.isDarkMode = !state.isDarkMode; // Alterna el valor
        document.body.classList.toggle("dark-mode", state.isDarkMode); // Aplica la clase global al body
        localStorage.setItem("isDarkMode", state.isDarkMode); // Guarda la preferencia en el navegador
      },
    },
    getters: {
      isDarkMode: (state) => state.isDarkMode,
    },
  };
  