<template>
  <transition name="fade">
    <div v-if="visible" :class="['notification', type]" @click="closeNotification">
      {{ message }}
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    type: { type: String, default: "info" }, // Tipos: success, danger, info, warning
    message: { type: String, required: true },
    autoClose: { type: Boolean, default: true }, // Opcional: autocierre
    duration: { type: Number, default: 3000 } // Tiempo antes de cerrar (ms)
  },
  data() {
    return { visible: true };
  },
  watch: {
    message: {
      immediate: true,
      handler() {
        this.visible = true;
        if (this.autoClose) {
          setTimeout(() => {
            this.visible = false;
          }, this.duration);
        }
      }
    }
  },
  methods: {
    closeNotification() {
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.notification {
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
}
.success { background-color: #4CAF50; color: white; }
.danger { background-color: #D9534F; color: white; }
.info { background-color: #5bc0de; color: white; }
.warning { background-color: #f0ad4e; color: white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>
