const express = require('express');
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { authenticate } = require('../middlewares/auth.middleware');
const { checkPermission } = require('../middlewares/permission.middleware');
const {
  getServices,
  getServiceById,
  getActiveServices,
  createService,
  updateService,
  deleteService,
  getPortfolioServices,
} = require('../controllers/services.controller');

// Declarar rutas estáticas primero
router.get("/active", authenticate, getActiveServices); // Ruta para obtener servicios activos

router.get('/portfolio', getPortfolioServices); // Obtener servicios del portfolio

// Rutas protegidas (si decides que GET '/' también sea accesible solo para usuarios autenticados, agrega authenticate)
router.get('/', getServices); // Actualmente pública, pero se puede proteger con 'authenticate'
router.get('/:id', authenticate, getServiceById); // Solo usuarios autenticados pueden acceder

// Rutas protegidas con permisos dinámicos
router.post("/", authenticate, checkPermission("create", "service"), upload.single("image"), createService); // Crear servicio con subida de imagen
router.put('/:id', authenticate, checkPermission('update', 'service'), updateService); // Actualizar servicio
router.delete('/:id', authenticate, checkPermission('delete', 'service'), deleteService); // Eliminar servicio

module.exports = router;