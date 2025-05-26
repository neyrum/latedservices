'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'profilePicture', {
      type: Sequelize.TEXT,
      allowNull: true, // Permitir valores nulos si no hay imagen
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'profilePicture', {
      type: Sequelize.STRING(255), // Revertir a VARCHAR(255) si es necesario
      allowNull: true,
    });
  },
};