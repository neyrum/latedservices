<template>
  <div class="wrapper">
    <Navbar />
    <Sidebar />
    <div class="content-wrapper">
      <div class="container-fluid mt-4">
        <h2>Manage Services</h2>
        <Notification v-if="successMessage" type="success" :message="successMessage" />
        <Notification v-if="errorMessage" type="danger" :message="errorMessage" />
        <button class="btn btn-primary mb-3" @click="showCreateForm = true">Add New Service</button>
        <div v-if="showCreateForm" class="card mb-4">
          <div class="card-body">
            <form @submit.prevent="createService">
              <div class="form-group">
                <label for="name">Service Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="newService.name"
                  required
                />
              </div>
              <div class="form-group">
                <label for="description">Description</label>
                <textarea
                  class="form-control"
                  id="description"
                  v-model="newService.description"
                  rows="4"
                  required
                ></textarea>
              </div>
              <div class="form-group">
                <label for="category">Category</label>
                <input
                  type="text"
                  class="form-control"
                  id="category"
                  v-model="newService.category"
                  required
                />
              </div>
              <button type="submit" class="btn btn-success">Create</button>
              <button type="button" class="btn btn-secondary ml-2" @click="showCreateForm = false">Cancel</button>
            </form>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in services" :key="service.id">
                <td>{{ service.name }}</td>
                <td>{{ service.description }}</td>
                <td>{{ service.category }}</td>
                <td>{{ service.isActive ? 'Yes' : 'No' }}</td>
                <td>
                  <button class="btn btn-sm btn-danger" @click="deleteService(service.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import axios from '@/plugins/axios';
import Navbar from '@/components/Navbar.vue';
import Sidebar from '@/components/Sidebar.vue';
import Footer from '@/components/Footer.vue';
import Notification from '@/components/Notification.vue';

export default {
  name: 'Services',
  components: { Navbar, Sidebar, Footer, Notification },
  data() {
    return {
      services: [],
      showCreateForm: false,
      newService: {
        name: '',
        description: '',
        category: '',
      },
      successMessage: '',
      errorMessage: '',
    };
  },
  async created() {
    await this.fetchServices();
  },
  methods: {
    async fetchServices() {
      try {
        const response = await axios.get('/services');
        this.services = response.data;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || 'Failed to load services.';
      }
    },
    async createService() {
      try {
        const response = await axios.post('/services', this.newService);
        this.services.push(response.data);
        this.successMessage = 'Service created successfully!';
        this.errorMessage = '';
        this.newService = { name: '', description: '', category: '' };
        this.showCreateForm = false;
      } catch (err) {
        this.errorMessage = err.response?.data?.message || 'Failed to create service.';
        this.successMessage = '';
      }
    },
    async deleteService(id) {
      if (confirm('Are you sure you want to delete this service?')) {
        try {
          await axios.delete(`/services/${id}`);
          this.services = this.services.filter(service => service.id !== id);
          this.successMessage = 'Service deleted successfully!';
          this.errorMessage = '';
        } catch (err) {
          this.errorMessage = err.response?.data?.message || 'Failed to delete service.';
          this.successMessage = '';
        }
      }
    },
  },
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.content-wrapper {
  flex: 1;
  padding: 20px;
  margin-top: 60px;
}
.card, .table {
  border-radius: 0.25rem;
}
</style>