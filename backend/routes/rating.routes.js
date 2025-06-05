const express = require('express');
const { createRating, getRatingsByService } = require('../controllers/rating.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const validateRating = require('../middlewares/validateRating');

const router = express.Router();

// Ruta para crear una calificación
router.post('/', authenticate, createRating);

// Ruta para obtener calificaciones de un servicio
router.get('/:serviceId', getRatingsByService);

// Ruta para crear una calificación con validación
router.post("/ratings", validateRating, createRating);

module.exports = router;