'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5, // Calificación entre 1 y 5 estrellas
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true, // Comentario opcional
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['serviceId', 'userId'], // Restricción única
      },
    ],
  });

  // Asociaciones con otros modelos
  Rating.associate = (models) => {
    // Relación con el modelo Service
    Rating.belongsTo(models.Service, { 
      foreignKey: 'serviceId', 
      as: 'service' 
    });

    // Relación con el modelo User
    Rating.belongsTo(models.User, { 
      foreignKey: 'userId', 
      as: 'user' 
    });
  };

  return Rating;
};