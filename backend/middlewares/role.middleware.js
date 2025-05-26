/**
 * Middleware de autorización: Controla el acceso basado en roles.
 * @param {Array<String>|String} roles - Roles permitidos (por ejemplo, ['admin'] o 'admin').
 */
const authorize = (roles = []) => {
  // Permite que se pase un solo rol como string, convirtiéndolo a array.
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    console.log("🔍 Role Middleware - Usuario autenticado:", req.user);

    // Verifica que el usuario esté autenticado.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    // Comprueba que el rol del usuario esté incluido en la lista de roles permitidos.
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      console.warn(`Acceso denegado para el usuario con rol: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Requiere rol: ${roles.join(', ')}`,
      });
    }

    // Si todo es correcto, continúa con el siguiente middleware o controlador.
    next();
  };
};

module.exports = { authorize };
