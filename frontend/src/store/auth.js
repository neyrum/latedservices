import api from "../plugins/axios";
import router from "@/router"; // Importamos la instancia del router

export default {
  namespaced: true, // Habilitamos el espacio de nombres para este módulo
  state: {
    isAuthenticated: !!localStorage.getItem("token"), // Verifica si hay un token guardado
    userData: null, // Información del usuario autenticado
  },
  mutations: {
    // Cambiamos el nombre de esta mutación a mayúsculas para seguir convenciones de Vuex
    SET_AUTHENTICATED(state, status) {
      state.isAuthenticated = status;
    },
    // Guarda los datos del usuario en el estado
    SET_USER_DATA(state, data) {
      state.userData = data;
    },
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await api.post("/auth/login", credentials);
        const token = response.data.token;

        localStorage.setItem("token", token);
        commit("SET_AUTHENTICATED", true);

        await dispatch("fetchUserData");
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw new Error(
          error.response?.data?.message || "Error desconocido al iniciar sesión."
        );
      }
    },

    async fetchUserData({ commit }) {
      try {
        const response = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        commit("SET_USER_DATA", response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          commit("SET_AUTHENTICATED", false);
          commit("SET_USER_DATA", null);
          localStorage.removeItem("token");
        }
        console.error("Error al obtener los datos del usuario:", error);
      }
    },

    logout({ commit }) {
      localStorage.removeItem("token");
      commit("SET_AUTHENTICATED", false);
      commit("SET_USER_DATA", null);

      // Se utiliza la instancia importada de router para navegar a "/login"
      router.push("/login");
    },

    async validateToken({ dispatch, commit }) {
      const token = localStorage.getItem("token");
      if (!token) {
        commit("SET_AUTHENTICATED", false);
        commit("SET_USER_DATA", null);
        return;
      }

      try {
        await dispatch("fetchUserData");
        commit("SET_AUTHENTICATED", true);
      } catch (error) {
        console.error("Error al validar el token:", error);
        commit("SET_AUTHENTICATED", false);
        commit("SET_USER_DATA", null);
        localStorage.removeItem("token");
      }
    },
  },
  getters: {
    isAuthenticated: (state) => state.isAuthenticated,
    userData: (state) => state.userData,
    userRole: (state) => (state.userData ? state.userData.role : undefined),
  },
};
