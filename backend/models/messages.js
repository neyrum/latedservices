"use strict";

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    senderName: {  
      type: DataTypes.STRING,
      allowNull: false,
    },  
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("sent", "received", "read"),
      defaultValue: "sent",
    },
    deleted_at: {  // Se mantiene "deleted_at"
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: true, // Para controlar cuándo se envía y lee un mensaje
    paranoid: true,   // Activa soft delete en Sequelize
    deletedAt: 'deleted_at'  // Configura el nombre de la columna para soft deletes
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
    Message.belongsTo(models.User, { foreignKey: "receiverId", as: "receiver" });
  };

  return Message;
};
