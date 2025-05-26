/**
 * Middleware global para manejar errores
 */
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack); // Registrar el error en la consola para depuración

    // Respuesta al cliente
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
    });
};

module.exports = errorHandler;