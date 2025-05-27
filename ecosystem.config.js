module.exports = {
  apps: [
    {
      name: "backend",
      script: "./backend/server.js",  // Ajusta la ruta según tu backend
      env: {
        NODE_ENV: "production",
        PORT: 3000,  // Puerto de tu backend
	JWT_SECRET: "your_secret_key"
      }
    },
    {
      name: "frontend",
      script: "npm",
      args: "run serve",  // Si usas React/Vue, esto inicia el frontend
      cwd: "./frontend",  // Ruta a tu frontend
      instances: "max",  // Modo cluster para máxima eficiencia
      exec_mode: "cluster",
	env: {
        NODE_ENV: "production",
        PORT: 5000  // Puerto del frontend
      }
    }
  ]
};
