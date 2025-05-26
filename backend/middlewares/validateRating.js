const validateRating = (req, res, next) => {
    const { rating } = req.body;

    // Validar que el rating esté entre 1 y 5
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: "La calificación debe estar entre 1 y 5",
        });
    }

    next(); // Si todo está bien, continúa con el siguiente middleware o controlador
};

module.exports = validateRating;