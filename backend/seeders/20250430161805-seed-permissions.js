'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Permissions', [
      // Permisos para superadmin
      { role: 'superadmin', action: 'manage', resource: 'all', createdAt: new Date(), updatedAt: new Date() },

      // Permisos para admin
      { role: 'admin', action: 'create', resource: 'service', createdAt: new Date(), updatedAt: new Date() },
      { role: 'admin', action: 'update', resource: 'service', createdAt: new Date(), updatedAt: new Date() },
      { role: 'admin', action: 'delete', resource: 'service', createdAt: new Date(), updatedAt: new Date() },

      // Permisos para manager
      { role: 'manager', action: 'update', resource: 'request', createdAt: new Date(), updatedAt: new Date() },
      { role: 'manager', action: 'view', resource: 'request', createdAt: new Date(), updatedAt: new Date() },

      // Permisos para client
      { role: 'client', action: 'create', resource: 'request', createdAt: new Date(), updatedAt: new Date() },
      { role: 'client', action: 'view', resource: 'request', createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Permissions', null, {});
  },
};