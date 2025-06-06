<template>
  <div class="request-list">
    <h2>Listado de Solicitudes</h2>
    
    <!-- Controles para filtros, búsqueda y orden -->
    <div class="filters">
      <!-- Búsqueda por usuario, ID, o palabra clave -->
      <input
        v-model="searchQuery"
        placeholder="Buscar por usuario, ID o palabra clave"
      />

      <!-- Filtro por Estado -->
      <select v-model="filterStatus">
        <option value="">Mostrar todos</option>
        <option value="pending">Pendiente</option>
        <option value="in_process">En Proceso</option>
        <option value="completed">Completado</option>
        <option value="rejected">Rechazado</option>
      </select>

      <!-- Ordenamiento: Escoge la clave a ordenar -->
      <select v-model="sortKey">
        <option value="date">Fecha</option>
        <option value="priority">Prioridad</option>
      </select>

      <!-- Orden: Ascendente o Descendente -->
      <select v-model="sortOrder">
        <option value="asc">Ascendente</option>
        <option value="desc">Descendente</option>
      </select>
    </div>

    <!-- Tabla para mostrar las solicitudes -->
    <table class="requests-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="request in paginatedRequests" :key="request.id">
          <td>{{ request.id }}</td>
          <td>{{ request.user }}</td>
          <td>{{ request.description }}</td>
          <td>{{ request.status }}</td>
          <td>{{ request.date }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Paginación -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">
        Anterior
      </button>
      <span>Página {{ currentPage }} de {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">
        Siguiente
      </button>
    </div>
  </div>
</template>

<script>
import axios from "@/plugins/axios"; // Asegúrate de tener Axios configurado

export default {
  name: "RequestList",
  data() {
    return {
      requests: [],        // Arreglo con todas las solicitudes
      searchQuery: "",     // Para capturar la búsqueda del usuario
      filterStatus: "",    // Para filtrar por estado (ej. pending, completed, etc.)
      sortKey: "date",     // Clave por la que se ordena (por ejemplo, fecha o prioridad)
      sortOrder: "desc",   // Orden del filtro: ascendente o desc
      currentPage: 1,      // Página actual para la paginación
      pageSize: 10,        // Cantidad de solicitudes por página
    };
  },
  computed: {
    // Filtra y ordena la lista de solicitudes en base a la búsqueda y filtro
    filteredRequests() {
      let result = this.requests;

      // Filtrar por búsqueda (ID, usuario, descripción)
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(r =>
          String(r.id).toLowerCase().includes(query) ||
          (r.user && r.user.toLowerCase().includes(query)) ||
          (r.description && r.description.toLowerCase().includes(query))
        );
      }

      // Filtrar por estado
      if (this.filterStatus) {
        result = result.filter(r => r.status === this.filterStatus);
      }

      // Ordenar los resultados
      result.sort((a, b) => {
        const modifier = this.sortOrder === "asc" ? 1 : -1;
        // Convertir los valores a comparar, en caso de que sean strings o números
        const aValue = a[this.sortKey];
        const bValue = b[this.sortKey];
        if (aValue < bValue) return -1 * modifier;
        if (aValue > bValue) return 1 * modifier;
        return 0;
      });

      return result;
    },
    // Retorna las solicitudes de la página actual según paginación
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredRequests.slice(start, start + this.pageSize);
    },
    totalPages() {
      return Math.ceil(this.filteredRequests.length / this.pageSize);
    },
  },
  methods: {
    // Método para cargar las solicitudes desde el backend
    fetchRequests() {
      axios
        .get("/api/requests") // Ajusta esta URL a la de tu backend
        .then(response => {
          this.requests = response.data;
        })
        .catch(error => {
          console.error("Error al cargar solicitudes:", error);
        });
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
  },
  created() {
    this.fetchRequests();
  },
};
</script>

<style scoped>
.request-list {
  padding: 20px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.filters input,
.filters select {
  padding: 5px;
  font-size: 14px;
}

.requests-table {
  width: 100%;
  border-collapse: collapse;
}

.requests-table th,
.requests-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.requests-table th {
  background-color: #f2f2f2;
}

.pagination {
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 5px 10px;
}
</style>
