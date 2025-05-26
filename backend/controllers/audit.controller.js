const { AuditLog, User } = require('../models');

/**
 * @desc Obtener registros de auditoría
 * @route GET /api/audit-logs
 * @access Privado (Superadmin)
 */
const getAuditLogs = async (req, res) => {
  try {
    // Obtener los registros de auditoría con información del usuario que realizó la acción
    const logs = await AuditLog.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'], // Información del usuario que realizó la acción
        },
      ],
      order: [['createdAt', 'DESC']], // Ordenar por fecha de creación (más recientes primero)
    });

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('Error al obtener registros de auditoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener registros de auditoría',
    });
  }
};

module.exports = { getAuditLogs };