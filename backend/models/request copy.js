'use strict';
module.exports = (sequelize, DataTypes) => {
  const Request = sequelize.define('Request', {
    status: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado','en_progreso', 'completado', 'cancelado'),
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
        notEmpty: {
          msg: 'Los detalles de la solicitud no pueden estar vacíos'
        },
        len: {
          args: [10, 2000],
          msg: 'Los detalles deben tener entre 10 y 2000 caracteres'
        }
      }
    },
    preferredDate: {
      type: DataTypes.DATE,
      allowNull: false, // Cambiado a obligatorio
      validate: {
        isDate: {
          msg: 'La fecha debe ser válida'
        },
        isAfter: {
          args: new Date().toISOString().split('T')[0], // Validar que sea una fecha futura
          msg: 'La fecha debe ser futura'
        }
      }
    },
    address: {
      type: DataTypes.JSON,
      allowNull: false, // Cambiado a obligatorio
      validate: {
        notEmpty: {
          msg: 'La dirección no puede estar vacía'
        },
        isValidAddress(value) {
          if (!value.street || !value.city || !value.zip) {
            throw new Error('La dirección debe incluir calle, ciudad y código postal');
          }
        }
      }
    }
  }, {
    timestamps: true,
    paranoid: true, // Para eliminación lógica
    defaultScope: {
      attributes: { exclude: ['updatedAt'] } // Excluir campo por defecto
    }
  });

  // Relaciones
  Request.associate = function(models) {
    // Relación con el cliente (User)
    Request.belongsTo(models.User, { 
      foreignKey: {
        name: 'userId',
        allowNull: false
      },
      as: 'client' // Alias descriptivo
    });
    
    // Relación con el servicio (Service)
    Request.belongsTo(models.Service, {
      foreignKey: {
        name: 'serviceId',
        allowNull: false
      },
      as: 'service'
    });

    // Relación opcional con el administrador asignado (User)
    Request.belongsTo(models.User, {
      foreignKey: 'assignedAdminId',
      as: 'admin'
    });
  };

  // Métodos personalizados
Request.prototype.getStatusInfo = function() {
  const statusMap = {
    pending: { color: 'orange', text: 'Pendiente' },
    approved: { color: 'blue', text: 'Aprobado' },
    rejected: { color: 'red', text: 'Rechazado' },
    in_progress: { color: 'purple', text: 'En Progreso' },
    completed: { color: 'green', text: 'Completado' },
    cancelled: { color: 'gray', text: 'Cancelado' }
  };

  return statusMap[this.status] || { color: 'black', text: 'Desconocido' };
};

  return Request;
};