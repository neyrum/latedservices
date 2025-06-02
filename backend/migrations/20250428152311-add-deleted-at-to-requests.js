'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna "deleted_at"
    await queryInterface.addColumn('Requests', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true, // Permitir valores nulos
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna "deleted_at"
    await queryInterface.removeColumn('Requests', 'deleted_at');
  },
};
