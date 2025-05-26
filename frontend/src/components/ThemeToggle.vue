<template>
    <button @click="toggleTheme" class="theme-toggle">
      <i v-if="isDarkMode" class="fas fa-sun"></i>
      <i v-else class="fas fa-moon"></i>
    </button>
  </template>
  
  <script>
  import { mapGetters, mapMutations } from "vuex";
  
  export default {
    name: "ThemeToggle",
    computed: {
      ...mapGetters("theme", ["isDarkMode"]),
    },
    methods: {
      ...mapMutations("theme", ["TOGGLE_THEME"]),
      toggleTheme() {
        this.TOGGLE_THEME();
      },
    },
  };
  </script>
  
  <style scoped>
  .theme-toggle {
    background: transparent;
    border: none;
    color: var(--text-color);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: transform 0.3s ease;
  }
  
  .theme-toggle:hover {
    transform: scale(1.1);
}
  </style>
  