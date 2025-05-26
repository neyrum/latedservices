'use strict';
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser nulo si no hay un objetivo específico
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: true, // Puede ser nulo si no hay un objetivo específico
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true, // Detalles adicionales sobre la acción
    },
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AuditLog;
};