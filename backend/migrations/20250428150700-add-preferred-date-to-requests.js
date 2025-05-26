'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna "preferredDate" con un valor predeterminado temporal
    await queryInterface.addColumn('Requests', 'preferredDate', {
      type: Sequelize.DATE,
      allowNull: false, // No permitir valores nulos
      defaultValue: Sequelize.literal('NOW()'), // Usar la fecha actual como valor predeterminado temporal
    });

    // Opcional: Actualizar registros existentes si necesitas un valor específico
    await queryInterface.sequelize.query(`
      UPDATE "Requests" SET "preferredDate" = '2025-01-01' WHERE "preferredDate" IS NULL;
    `);

    // Eliminar el valor predeterminado temporal (si no lo necesitas)
    await queryInterface.changeColumn('Requests', 'preferredDate', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna "preferredDate"
    await queryInterface.removeColumn('Requests', 'preferredDate');
  },
};