import { io } from "socket.io-client";

const socket = io(process.env.VUE_APP_SOCKET_URL);

socket.on("connect", () => {
  console.log("Socket conectado:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Error de conexión al socket:", error);
});

export default socket;
