<template>
    <div>
      <h1>Tus Solicitudes</h1>
      <ul v-if="requests && requests.length">
        <li v-for="request in requests" :key="request.id">
          <strong>{{ request.service?.name || "Servicio desconocido" }}</strong> - {{ request.status }}
          <p>{{ request.details }}</p>
          <p>Fecha preferida: {{ formatDate(request.preferredDate) }}</p>
        </li>
      </ul>
      <p v-else>No hay solicitudes registradas.</p>
    </div>
  </template>
  
  <script>
  import { mapState, mapActions } from "vuex";
  
  export default {
    computed: {
      ...mapState("requests", ["requests"]), // ✅ Accedemos correctamente al módulo de Vuex
    },
    methods: {
      ...mapActions("requests", ["fetchRequests"]), // ✅ Llamamos a la acción dentro del módulo `requests`
      formatDate(date) {
        return date ? new Date(date).toLocaleDateString() : "Fecha no disponible";
      },
    },
    mounted() {
      this.fetchRequests();
    },
  };
  </script>
  
  <style scoped>
  h1 {
    font-size: 1.5em;
    margin-bottom: 10px;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  </style>
  