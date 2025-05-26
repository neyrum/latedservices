'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna "assignedAdminId"
    await queryInterface.addColumn('Requests', 'assignedAdminId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Permitir valores nulos inicialmente
      references: {
        model: 'Users', // Nombre de la tabla relacionada
        key: 'id', // Clave primaria de la tabla relacionada
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna "assignedAdminId"
    await queryInterface.removeColumn('Requests', 'assignedAdminId');
  },
};