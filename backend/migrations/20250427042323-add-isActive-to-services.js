'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Services', 'isActive', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica si el servicio está activo para solicitudes'
    });

    // Opcional: Actualizar todos los registros existentes
    await queryInterface.sequelize.query(
      'UPDATE "Services" SET "isActive" = true;'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Services', 'isActive');
  }
};