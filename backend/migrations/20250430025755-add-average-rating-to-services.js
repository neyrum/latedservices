'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Services', 'averageRating', {
      type: Sequelize.FLOAT, // Tipo de dato para almacenar decimales
      allowNull: false,
      defaultValue: 0, // Valor inicial
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Services', 'averageRating');
  },
};