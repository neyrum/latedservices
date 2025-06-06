<template>
  <div class="dashboard-card">
    <img v-if="image" :src="image" alt="Icono" class="summary-icon" />
    <div class="card-content">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-value">{{ value }}</p>
      <button v-if="buttonText" @click="$emit('navigate')" class="action-button">
        <i :class="buttonIcon"></i> {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardCard",
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
    image: { type: String, default: null },
    buttonText: { type: String, default: null },
    buttonIcon: { type: String, default: "fas fa-arrow-right" },
  }
};
</script>

<style scoped>
.dashboard-card {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.dashboard-card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.summary-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
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

.action-button {
  background: #345896;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  margin-top: 10px;
}

.action-button:hover {
  background: #264270;
}
</style>
