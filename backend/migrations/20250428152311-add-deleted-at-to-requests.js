'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna "deletedAt"
    await queryInterface.addColumn('Requests', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true, // Permitir valores nulos
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna "deletedAt"
    await queryInterface.removeColumn('Requests', 'deletedAt');
  },
};