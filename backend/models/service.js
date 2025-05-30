'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    /**
     * Se definen las asociaciones del modelo.
     * @param {object} models - Colección de modelos disponibles.
     */
    static associate(models) {
      // Asociación con el usuario administrador que crea el servicio.
      this.belongsTo(models.User, { 
        foreignKey: 'createdBy', // Campo que guarda el ID del admin.
        as: 'creator',           // Alias para referirse al usuario creador.
        onDelete: 'RESTRICT',    // No se permite borrar el usuario si existen servicios.
        onUpdate: 'CASCADE'      // Si se actualiza el ID del usuario, se actualiza aquí.
      });

      // Asociación con las calificaciones (ratings) del servicio.
      this.hasMany(models.Rating, { 
        foreignKey: 'serviceId', // Clave foránea en la tabla Rating.
        as: 'ratings'            // Alias para acceder a las calificaciones.
      });
    }
  }
  
  // Inicializamos el modelo con sus atributos y validaciones.
  Service.init(
    {
      name: { 
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
          notEmpty: true, // El nombre no puede ser una cadena vacía.
        }
      },
      description: { 
        type: DataTypes.STRING, 
        allowNull: false,
      },
      price: { 
        type: DataTypes.FLOAT, 
        allowNull: true, 
        validate: {
          isDecimal: true, // Se valida que sea un número decimal.
          min: 0,          // El precio no puede ser negativo.
        }
      },
      createdBy: { 
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: { 
          model: 'Users', // Hace referencia a la tabla de usuarios.
          key: 'id',
        },
      },
      averageRating: { 
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0, max: 5 } // Valor entre 0 y 5.
      },
      isActive: { 
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true, // Por defecto, el servicio está activo.
      },
      icon: { 
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "fas fa-tools" // Icono por defecto
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false  // Por defecto, no está destacado.
      },
      mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true  // Permite valores nulos si aún no se ha asignado media.
      }
    },
    {
      sequelize,          // Instancia de sequelize.
      modelName: 'Service', // Nombre del modelo.
    }
  );
  
  return Service;
};
