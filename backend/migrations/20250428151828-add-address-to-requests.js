'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar la columna "address" con un valor predeterminado temporal
    await queryInterface.addColumn('Requests', 'address', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: { street: 'Desconocida', city: 'Desconocida', zip: '00000' }, // Valor predeterminado temporal
    });

    // Opcional: Actualizar registros existentes si necesitas un valor específico
    await queryInterface.sequelize.query(`
      UPDATE "Requests" SET "address" = '{"street": "Calle 123", "city": "Ciudad Ejemplo", "zip": "12345"}' WHERE "address" IS NULL;
    `);

    // Eliminar el valor predeterminado temporal (si no lo necesitas)
    await queryInterface.changeColumn('Requests', 'address', {
      type: Sequelize.JSON,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar la columna "address"
    await queryInterface.removeColumn('Requests', 'address');
  },
};