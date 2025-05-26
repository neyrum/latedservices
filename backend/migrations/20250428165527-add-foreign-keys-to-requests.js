'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar clave foránea para userId
    await queryInterface.addConstraint('Requests', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'Requests_userId_fkey', // Nombre de la clave foránea
      references: {
        table: 'Users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Agregar clave foránea para serviceId
    await queryInterface.addConstraint('Requests', {
      fields: ['serviceId'],
      type: 'foreign key',
      name: 'Requests_serviceId_fkey', // Nombre de la clave foránea
      references: {
        table: 'Services',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar clave foránea para userId
    await queryInterface.removeConstraint('Requests', 'Requests_userId_fkey');

    // Eliminar clave foránea para serviceId
    await queryInterface.removeConstraint('Requests', 'Requests_serviceId_fkey');
  },
};