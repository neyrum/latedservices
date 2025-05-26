import api from "../plugins/axios";

export default {
  namespaced: true,
  state: {
    services: [],
    loading: true,
    error: null,
  },
  mutations: {
    SET_SERVICES(state, services) {
      state.services = services;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },
  actions: {
    async fetchServices({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await api.get("/services");
        commit("SET_SERVICES", response.data);
      } catch (err) {
        commit("SET_ERROR", "No se pudieron cargar los servicios.");
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
  getters: {
    allServices: (state) => state.services || [],
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },
};
