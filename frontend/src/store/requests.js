import axios from "@/plugins/axios";

const state = {
  requests: [],
};

const mutations = {
  setRequests(state, requests) {
    state.requests = requests;
  },
};

const actions = {
  async fetchRequests({ commit }) {
    try {
      const response = await axios.get("/requests/client", {
        headers: {
          Authorization: `Bearer localStorage.getItem('token')`,
        },
      });
      commit("setRequests", response.data.data);
    } catch (error) {
      console.error("Error al obtener solicitudes:", error);
    }
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
