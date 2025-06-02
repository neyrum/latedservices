require("dotenv").config();

const express = require("express");
const http = require("http"); 
const cors = require("cors");
const path = require("path");
const { Server } = require("socket.io");
const db = require("./models");
const errorHandler = require("./middlewares/errorHandler");
const upload = require("./middlewares/upload.middleware");

// 🔹 Importar rutas
const servicesRoutes = require("./routes/services.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const requestRoutes = require("./routes/request.routes");
const ratingRoutes = require("./routes/rating.routes");
const auditRoutes = require("./routes/audit.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");
const portfolioRoutes = require("./routes/portfolio.routes");
const messagesRoutes = require("./routes/messages.routes");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

// 🔹 Configurar Socket.io con CORS
const io = new Server(server, {
    cors: { origin: FRONTEND_URL }
});

app.set("io", io);

// 🔹 Manejar conexiones de clientes con WebSockets
io.on("connection", (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

// 🔹 Configuración de CORS (Permitir peticiones del frontend)
app.use(cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔹 Middleware para JSON y subida de archivos
app.use(express.json({ limit: "10mb" }));

// 🔹 Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Middleware para cargar imágenes y videos correctamente
app.use("/assets", express.static("public/assets"));
app.use("/uploads/images", express.static("public/assets/img/portfolio"));
app.use("/uploads/videos", express.static("public/assets/videos/portfolio"));

// 🔹 Middleware para asegurar que los archivos estáticos tengan CORS correcto
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 🔹 Rutas de la API
app.use("/api/services", servicesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/messages", messagesRoutes);

// 🔹 Ruta principal
app.get("/", (req, res) => {
    res.send("🚀 ¡Bienvenido a los Servicios de LATED!");
});

// 🔹 Middleware de subida de archivos (opcional en rutas generales)
app.post("/api/upload", upload.single("media"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "❌ No se recibió ningún archivo." });
    
    res.status(201).json({
        message: "✅ Archivo subido correctamente",
        mediaUrl: `/uploads/${req.file.filename}`
    });
});

// 🔹 Manejo de errores global
app.use(errorHandler);

// 🔹 Conectar con PostgreSQL y levantar el servidor
db.sequelize.authenticate()
    .then(() => {
        console.log("✅ Conexión a PostgreSQL establecida correctamente.");
        return db.sequelize.sync();
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en ${FRONTEND_URL}`);
        });
    })
    .catch(error => {
        console.error("❌ Error al conectar con la base de datos:", error);
        process.exit(1);
    });
