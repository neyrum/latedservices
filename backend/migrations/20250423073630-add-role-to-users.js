'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 🔹 Primero, eliminar la columna role
    await queryInterface.removeColumn('Users', 'role');

    // 🔹 Luego, volver a agregar la columna role con el nuevo ENUM
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('superadmin', 'admin', 'manager', 'client'),
      allowNull: false,
      defaultValue: 'client',
    });

    // 🔹 Modificar la columna status sin necesidad de eliminarla
    await queryInterface.changeColumn('Users', 'status', {
      type: Sequelize.ENUM('activo', 'inactivo'),
      allowNull: false,
      defaultValue: 'activo',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 🔹 Revertir los cambios eliminando la columna role y volviéndola a agregar como STRING
    await queryInterface.removeColumn('Users', 'role');
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'client',
    });

    await queryInterface.changeColumn('Users', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'activo',
    });
  },
};