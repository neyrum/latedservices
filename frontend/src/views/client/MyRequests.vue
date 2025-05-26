<template>
  <div class="container mt-5">
    <h2 class="mb-4">
      My Service Requests
    </h2>
    <div
      v-if="errorMessage"
      class="alert alert-danger"
      role="alert"
    >
      {{ errorMessage }}
    </div>
    <div
      v-if="requests.length === 0 && !errorMessage"
      class="alert alert-info"
      role="alert"
    >
      No service requests found.
    </div>
    <div
      v-else-if="requests.length > 0"
      class="card"
    >
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="request in requests"
                :key="request.id"
              >
                <td>{{ request.serviceName }}</td>
                <td>{{ request.description }}</td>
                <td>{{ request.priority }}</td>
                <td>{{ request.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-center"
    >
      <p>Loading requests...</p>
    </div>
  </div>
</template>

<script>
import axios from '@/plugins/axios';

export default {
  name: 'MyRequests',
  data() {
    return {
      requests: [],
      errorMessage: '',
    };
  },
  async created() {
    await this.fetchRequests();
  },
  methods: {
    async fetchRequests() {
      try {
        const response = await axios.get('/services/requests');
        this.requests = response.data;
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error.response?.data?.message || 'Failed to load requests.';
        this.requests = [];
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px;
}
.card {
  border-radius: 0.25rem;
}
.table-responsive {
  margin-top: 1rem;
}
</style>