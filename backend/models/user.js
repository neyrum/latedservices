'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define asociaciones aquí si es necesario
      User.hasMany(models.Request, { foreignKey: 'userId', as: 'requests' }); // Relación con solicitudes como cliente
      User.hasMany(models.Request, { foreignKey: 'assignedAdminId', as: 'assignedRequests' }); // Relación con solicitudes como administrador
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre no puede estar vacío' },
        },
      },
      apellidos: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Los apellidos no pueden estar vacíos' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Debe ser un correo electrónico válido' },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'La contraseña no puede estar vacía' },
        },
      },
      role: {
        type: DataTypes.ENUM('superadmin', 'admin', 'manager', 'client', 'user'), // Roles permitidos
        allowNull: false,
        defaultValue: 'client', // Valor predeterminado
        validate: {
          isIn: {
            args: [['superadmin', 'admin', 'manager', 'client', 'user']], // 💡 Se agregó 'user'
            msg: 'El rol debe ser uno de: superadmin, admin, manager, client, user', 
          },
        },
      },
      status: {
        type: DataTypes.ENUM('activo', 'inactivo'), // Estados permitidos
        allowNull: false,
        defaultValue: 'activo', // Valor predeterminado
        validate: {
          isIn: {
            args: [['activo', 'inactivo']],
            msg: 'El estado debe ser "activo" o "inactivo"',
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser nulo si no se proporciona
        validate: {
          is: {
            args: /^[0-9]+$/i,
            msg: 'El teléfono solo puede contener números',
          },
        },
      },
      address: {
        type: DataTypes.STRING, // Nuevo campo para la dirección
        allowNull: true, // Puede ser nulo si no se proporciona
        validate: {
          notEmpty: { msg: 'La dirección no puede estar vacía' },
        },
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true, // Puede ser nulo si no se ha solicitado un restablecimiento
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true, // Puede ser nulo si no se ha solicitado un restablecimiento
      },
      profilePicture: {
        type: DataTypes.TEXT,
        allowNull: true, // Puede ser nulo si no se ha subido una foto
      },
      // 🔹 Nuevos campos: datos laborales del cliente
      faculty: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: { msg: 'La facultad no puede estar vacía' },
        },
      },
      area: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: { msg: 'El área no puede estar vacía' },
        },
      },
      work_identity: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: { msg: 'La identidad laboral no puede estar vacía' },
        },
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: { msg: 'El departamento no puede estar vacío' },
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );

  // 🔹 Evitar eliminación del usuario SuperAdmin
  User.beforeDestroy(async (user, options) => {
    if (user.role === 'superadmin') {
      throw new Error('No puedes eliminar al usuario SuperAdmin.');
    }
  });

  return User;
};