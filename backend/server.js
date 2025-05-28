require('dotenv').config();

const express = require('express');
const http = require("http"); // Necesario para integrar Socket.io
const cors = require('cors');
const { Server } = require("socket.io"); // Importar la librería de WebSockets
const db = require('./models'); // Importar modelos y conexión a la base de datos
const errorHandler = require('./middlewares/errorHandler'); // Importar el middleware de manejo de errores

// 🔹 Importar rutas
const servicesRoutes = require('./routes/services.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const requestRoutes = require('./routes/request.routes.js');
const ratingRoutes = require('./routes/rating.routes');
const auditRoutes = require('./routes/audit.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require("./routes/notification.routes");

// 🔹 Iniciar el servidor
const app = express();
const server = http.createServer(app); // Crear servidor HTTP para trabajar
const PORT = process.env.PORT; // Puerto donde correrá el servidor

// 🔹 Configurar Socket.io para tiempo real
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL }
});

// Almacenar instancia de `io` en `app` para usarlo en los controladores
app.set("io", io);

// Manejar conexiones de clientes
io.on("connection", (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

// 🔹 Habilitar CORS con configuración ajustable
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔹 Middleware para procesar JSON
app.use(express.json({ limit: '5mb' })); // Aumentar el límite para aceptar imágenes grandes en Base64

// 🔹 Definir rutas principales
app.use('/api/services', servicesRoutes); // Rutas para servicios
app.use('/api/auth', authRoutes); // Rutas para autenticación
app.use('/api/users', userRoutes); // Rutas para usuarios
app.use('/api/requests', requestRoutes); // Rutas para solicitudes
app.use('/api/ratings', ratingRoutes); // Rutas para calificaciones
app.use('/api/audit-logs', auditRoutes); // Ruta para auditoria
app.use('/api/admin', adminRoutes);     // Rutas para administradores
app.use('/api/notifications', notificationRoutes); // Rutas para notificaciones

// 🔹 Ruta inicial
app.get('/', (req, res) => {
    res.send('¡Bienvenido a los Servicios de LATED!');
});

// 🔹 Manejo de errores global (debe ir al final de las rutas)
app.use(errorHandler);

// 🔹 Verificar conexión con PostgreSQL antes de iniciar el servidor
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a PostgreSQL establecida correctamente.');
        return db.sequelize.sync();
    })
    .then(() => {
        server.listen(process.env.PORT, process.env.SERVER_HOST, () => {
            console.log(`🚀 Servidor corriendo en http://${process.env.SERVER_HOST}:${process.env.PORT}`);
        });
    })
    .catch(error => {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1); // Evita iniciar el servidor si la conexión falla
    });
