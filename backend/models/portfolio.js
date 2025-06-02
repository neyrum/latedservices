'use strict';
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Portfolio extends Model {
    static associate(models) {
      // 🔹 Puedes definir asociaciones aquí si es necesario
    }
  }

  Portfolio.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    client: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      },
    url: {  // 📌 Nueva columna para la URL del proyecto
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
         msg: "❌ La URL ingresada no es válida."
        },  
      },
    },
  }, { 
    sequelize,
    modelName: "Portfolio",
    timestamps: true
  });

  return Portfolio;
};
