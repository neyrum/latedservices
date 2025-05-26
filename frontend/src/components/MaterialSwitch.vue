<template>
  <div class="form-check form-switch">
    <input
      :id="id"
      class="form-check-input"
      type="checkbox"
      :name="name"
      :checked="checked"
      @change="$emit('update:checked', $event.target.checked)"
    />
    <label class="form-check-label" :for="id">
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: "MaterialSwitch",
  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    checked: { type: Boolean, default: false },
  },
  emits: ["update:checked"],
};
</script>

<style scoped>
.form-check-input {
  width: 40px;
  height: 20px;
  cursor: pointer;
  accent-color: #345896;
}
</style>
