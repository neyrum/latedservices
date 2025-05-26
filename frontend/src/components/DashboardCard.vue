<template>
  <div class="dashboard-card">
    <div class="card-content">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-value">{{ value }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardCard",
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
};
</script>

<style scoped>
.dashboard-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: 0.3s;
}

.dashboard-card:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #345896;
}

.card-value {
  font-size: 22px;
  font-weight: bold;
  color: #222;
}
</style>
