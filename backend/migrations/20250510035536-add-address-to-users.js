'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'address', {
      type: Sequelize.STRING,
      allowNull: true, // Permite valores nulos
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'address');
  },
};