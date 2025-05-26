<template>
    <label class="switch">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="toggleSwitch"
        :disabled="disabled"
      />
      <span class="slider round"></span>
    </label>
  </template>
  
  <script>
  export default {
    name: "SwitchToggle",
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
      disabled: { // Esta prop se usa para deshabilitar el switch
        type: Boolean,
        default: false,
      },
    },
    emits: ["update:modelValue"],
    methods: {
      toggleSwitch(event) {
        console.log("Switch changed:", event.target.checked);
        this.$emit("update:modelValue", event.target.checked);
      },
    },
  };
  </script>
  
  <style scoped>
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
  }
  
  .slider.round {
    border-radius: 20px;
  }
  
  .slider::before {
    content: "";
    position: absolute;
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #345996;
  }
  
  input:checked + .slider::before {
    transform: translateX(20px);
  }
  </style>
  