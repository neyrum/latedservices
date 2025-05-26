'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre no puede estar vacío' }
        }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Debe ser un correo electrónico válido' }
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'La contraseña no puede estar vacía' }
        }
      },
      role: {
        type: Sequelize.ENUM('superadmin', 'admin', 'manager', 'client', 'user'), // 🔹 Agregado correctamente
        allowNull: false,
        defaultValue: 'client'
      },
      status: {
        type: Sequelize.ENUM('activo', 'inactivo'),
        allowNull: false,
        defaultValue: 'activo'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};
