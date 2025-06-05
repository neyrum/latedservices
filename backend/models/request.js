'use strict';
module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    status: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado', 'en_progreso', 'completado', 'cancelado'),
      defaultValue: 'pendiente',
      allowNull: false,
      validate: {
        isIn: [['pendiente', 'aprobado', 'rechazado', 'en_progreso', 'completado', 'cancelado']]
      }
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Los detalles de la solicitud no pueden estar vacíos' },
        len: { args: [10, 2000], msg: 'Los detalles deben tener entre 10 y 2000 caracteres' }
      }
    },
    preferredDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: 'La fecha debe ser válida' },
        isAfter: { args: new Date().toISOString().split('T')[0], msg: 'La fecha debe ser futura' }
      }
    }
  }, {
    timestamps: true,
    paranoid: true, // Eliminación lógica
    defaultScope: {
      attributes: { exclude: ['updatedAt'] }
    }
  });

  // Relaciones
  Request.associate = function(models) {
    Request.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false }, as: 'client' });
    Request.belongsTo(models.Service, { foreignKey: { name: 'serviceId', allowNull: false }, as: 'service' });
    Request.belongsTo(models.User, { foreignKey: 'assignedAdminId', as: 'admin' });
  };

  // Métodos personalizados
  Request.prototype.getStatusInfo = function() {
    const statusMap = {
      pendiente: { color: 'orange', text: 'Pendiente' },
      aprobado: { color: 'blue', text: 'Aprobado' },
      rechazado: { color: 'red', text: 'Rechazado' },
      en_progreso: { color: 'purple', text: 'En Progreso' },
      completado: { color: 'green', text: 'Completado' },
      cancelado: { color: 'gray', text: 'Cancelado' }
    };

    return statusMap[this.status] || { color: 'black', text: 'Desconocido' };
  };

  return Request;
};
