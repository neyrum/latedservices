'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Primero agrega la columna como NULLABLE (allowNull: true)
    await queryInterface.addColumn('Services', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporalmente permitimos null
      references: {
        model: 'Users', // Asegúrate de que coincida con el nombre de tu tabla de usuarios
        key: 'id'
      }
    });

    // 2. Actualiza los servicios existentes con un ID de admin válido (ej: 1)
    // Reemplaza el '1' con el ID de un usuario administrador que exista en tu DB
    await queryInterface.sequelize.query(`
      UPDATE "Services" 
      SET "createdBy" = 6 
      WHERE "createdBy" IS NULL
    `);

    // 3. Ahora cambia la columna a NOT NULL
    await queryInterface.changeColumn('Services', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: false, // Ahora sí, obligatorio
      references: {
        model: 'Users',
        key: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Para revertir: elimina la columna
    await queryInterface.removeColumn('Services', 'createdBy');
  }
};