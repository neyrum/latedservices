const { Rating, Service, User } = require('../models');

/**
 * @desc Crear una calificación para un servicio
 * @route POST /api/ratings
 * @access Privado (Cliente)
 */
const createRating = async (req, res) => {
  try {
    const { serviceId, rating, comment } = req.body;

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
          success: false,
          message: "La calificación debe estar entre 1 y 5",
      });
  }

    // Verificar que el servicio exista
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'El servicio no existe',
      });
    }

    // Verificar si el usuario ya calificó este servicio
    const existingRating = await Rating.findOne({
      where: { serviceId, userId: req.user.id },
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'Ya has calificado este servicio',
      });
    }

    // Crear la calificación
    const newRating = await Rating.create({
      serviceId,
      userId: req.user.id, // ID del cliente autenticado
      rating,
      comment,
    });

    // Recalcular el promedio de calificaciones
    const ratings = await Rating.findAll({
      where: { serviceId },
      attributes: ['rating'],
    });

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = sumRatings / totalRatings;

    // Actualizar el promedio en el modelo Service
    await service.update({ averageRating });

    res.status(201).json({
      success: true,
      data: newRating,
      message: 'Calificación creada exitosamente',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la calificación',
    });
  }
};
   
/**
 * @desc Obtener calificaciones de un servicio
 * @route GET /api/ratings/:serviceId
 * @access Público
 */
const getRatingsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Verificar que el servicio exista
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'El servicio no existe',
      });
    }

    // Obtener las calificaciones del servicio
    const ratings = await Rating.findAll({
      where: { serviceId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las calificaciones',
    });
  }
};

module.exports = {
  createRating,
  getRatingsByService,
};