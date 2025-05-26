'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'apellidos', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // Puedes cambiar o quitar el valor predeterminado según tu necesidad
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'apellidos');
  }
};
