"use strict";

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("unread", "read"),
      defaultValue: "unread",
    },
  }, {
    timestamps: true,
  });

  // Asociaciones con otros modelos
  Notification.associate = (models) => {
    // Relación con el modelo User
    Notification.belongsTo(models.User, { 
      foreignKey: "userId", 
      as: "user" 
    });
  };

  return Notification;
};
