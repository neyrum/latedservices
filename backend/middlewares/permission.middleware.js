'use strict';
const { Permission } = require('../models');

/**
 * Middleware para verificar permisos dinámicos.
 * Controla el acceso a acciones específicas sobre un recurso determinado.
 *
 * @param {string} action - La acción que se desea realizar (por ejemplo, 'create', 'update', 'delete').
 * @param {string} resource - El recurso sobre el cual se realiza la acción (por ejemplo, 'service', 'request').
 * @returns {Function} Middleware que verifica el permiso y, en caso afirmativo, permite continuar con la solicitud.
 */
const checkPermission = (action, resource) => {
  return async (req, res, next) => {
    // Se espera que req.user se haya establecido previamente por el middleware de autenticación
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    try {
      const { role } = req.user;
      console.log(`Verificando permiso para: role=${role}, action=${action}, resource=${resource}`);

      // Bypass: Si el rol es "superadmin", se permite el acceso automáticamente sin consultar la base de datos
      if (role === 'superadmin') {
        console.log('Acceso concedido automáticamente para superadmin');
        return next();
      }

      // Para otros roles, se busca el permiso específico en la base de datos
      const permission = await Permission.findOne({ where: { role, action, resource } });
      console.log('🔎 Resultado de búsqueda de permisos:', permission);

      // Si no se encuentra el permiso, se retorna un error 403
      if (!permission) {
        console.log(`Permiso no encontrado para role=${role}, action=${action}, resource=${resource}`);
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para realizar esta acción',
        });
      }

      console.log(`Permiso encontrado para role=${role}, action=${action}, resource=${resource}`);
      next(); // Se permite el acceso
    } catch (error) {
      console.error('Error al verificar permisos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
      });
    }
  };
};

module.exports = { checkPermission };