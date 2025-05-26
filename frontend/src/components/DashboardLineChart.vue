<template>
    <div class="chart-container">
      <h3>{{ title }}</h3>
      <!-- Se usa el componente LineChart, que recibe los datos en la propiedad "data" -->
      <LineChart :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script>
  import { Line } from "vue-chartjs";
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
  } from "chart.js";
  
  // Registramos los plugins necesarios de Chart.js
  ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);
  
  export default {
    name: "DashboardLineChart",
    components: { LineChart: Line },
    props: {
      title: {
        type: String,
        default: "Total de Usuarios",
      },
      chartData: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        chartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          // Configuración extra: por ejemplo, animaciones o callbacks de tooltip
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => `Valor: ${context.parsed.y}`,
              },
            },
          },
        },
      };
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    max-width: 450px; /* Ajusta el ancho según necesites */
    height: 300px;    /* Ajusta el alto para que el gráfico se vea más compacto */
    margin: auto;
    text-align: center;
    background: #f9f9f9;
    padding: 15px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    transition: transform 0.3s ease-in-out;
  }
  .chart-container:hover {
    transform: scale(1.05);
  }
  </style>
  