require('dotenv').config();

const express = require('express');
const http = require("http"); 
const cors = require('cors');
const { Server } = require("socket.io");
const db = require('./models');
const errorHandler = require('./middlewares/errorHandler');
const upload = require("./middlewares/upload.middleware"); // ✅ Middleware de subida de archivos

// 🔹 Importar rutas
const servicesRoutes = require('./routes/services.routes');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const requestRoutes = require('./routes/request.routes');
const ratingRoutes = require('./routes/rating.routes');
const auditRoutes = require('./routes/audit.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require("./routes/notification.routes");
const portfolioRoutes = require('./routes/portfolio.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

// 🔹 Configurar Socket.io
const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL }
});

app.set("io", io);

// 🔹 Manejar conexiones de clientes con WebSockets
io.on("connection", (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
});

// 🔹 Habilitar CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔹 Servir archivos estáticos
app.use('/assets', express.static('public/assets'));

// 🔹  Exponer imágenes y videos subidos
app.use('/uploads/images', express.static('public/assets/img/portfolio'));
app.use('/uploads/videos', express.static('public/assets/videos/portfolio'));

// 🔹 Middleware para JSON y subida de archivos
app.use(express.json({ limit: '10mb' })); // ✅ Aumento de límite para archivos grandes

// 🔹 Middleware de subida de archivos (opcional en rutas generales)
app.post('/api/upload', upload.single("media"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "❌ No se recibió ningún archivo." });
    
    res.status(201).json({ 
        message: "✅ Archivo subido correctamente", 
        mediaUrl: `/uploads/${req.file.filename}` 
    });
});

// 🔹 Rutas de la API
app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/portfolio', portfolioRoutes);

// 🔹 Ruta principal
app.get('/', (req, res) => {
    res.send('🚀 ¡Bienvenido a los Servicios de LATED!');
});

// 🔹 Manejo de errores global
app.use(errorHandler);

// 🔹 Conectar con PostgreSQL y levantar el servidor
db.sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a PostgreSQL establecida correctamente.');
        return db.sequelize.sync();
    })
    .then(() => {
        server.listen(PORT, process.env.SERVER_HOST, () => {
            console.log(`🚀 Servidor corriendo en http://${process.env.SERVER_HOST}:${PORT}`);
        });
    })
    .catch(error => {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    });
