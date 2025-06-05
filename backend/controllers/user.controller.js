const { Op } = require('sequelize');
const { User, AuditLog } = require('../models');
const { createObjectCsvStringifier } = require('csv-writer');
const ExcelJS = require('exceljs');
const bcrypt = require('bcrypt');
  
// Obtener el perfil del usuario autenticado
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'apellidos', 'email', 'phone', 'address','role', 'status', 'profilePicture'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error("Error en getUserProfile:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Actualizar el perfil del usuario autenticado
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Obtén el ID del usuario autenticado desde el token
    const { name, apellidos, email, phone, password, address } = req.body;

    // Busca al usuario en la base de datos
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualiza los datos del usuario
    user.name = name || user.name;
    user.apellidos = apellidos || user.apellidos;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (password) {
      // Asegúrate de hashear la contraseña antes de guardarla
      const bcrypt = require('bcrypt');
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: 'Perfil actualizado exitosamente', user });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

// Actualizar el perfil del usuario autenticado (solo administradores)
const updateUserProfileAdmin = async (req, res) => {
  try {
    const userId = req.params.id; // ✅ Usar el ID desde la URL
    const { name, apellidos, email, phone, password, address } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.name = name || user.name;
    user.apellidos = apellidos || user.apellidos;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (password) {
      const bcrypt = require("bcrypt");
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.status(200).json({ message: "Perfil actualizado exitosamente", user });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
};


// Subir foto de perfil en formato Base64
const uploadProfilePicture = async (req, res) => {
  try {
    const { profilePicture } = req.body; // Obtener la imagen en Base64 del cuerpo de la solicitud

    if (!profilePicture) {
      return res.status(400).json({ message: 'No se proporcionó una imagen.' });
    }

    // Validar que el string Base64 sea válido
    const isBase64 = /^data:image\/(png|jpeg|jpg);base64,/.test(profilePicture);
    if (!isBase64) {
      return res.status(400).json({ message: 'La imagen no está en formato Base64 válido.' });
    }

    // Buscar al usuario autenticado
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Guardar la imagen en la base de datos
    user.profilePicture = profilePicture;
    await user.save();

    res.status(200).json({ message: 'Foto de perfil actualizada exitosamente', profilePicture });
  } catch (error) {
    console.error("Error al subir foto de perfil:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Eliminar foto de perfil en formato Base64
const deleteProfilePicture = async (req, res) => {
  try {
    // Buscar al usuario autenticado
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar la foto de perfil
    user.profilePicture = null;
    await user.save();

    res.status(200).json({ message: 'Foto de perfil eliminada exitosamente' });
  } catch (error) {
    console.error("Error al eliminar la foto de perfil:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const users = await User.findAndCountAll({
      attributes: ['id', 'name', 'apellidos', 'email', 'phone', 'address' , 'role', 'status', 'profilePicture', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      total: users.count,
      users: users.rows,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Buscar usuarios por criterios específicos
const searchUsers = async (req, res) => {
  try {
    const { name, apellidos, email, phone, address, role, status } = req.query;

    const whereClause = {};
    if (name) whereClause.name = { [Op.iLike]: `%${name}%` };
    if (apellidos) whereClause.apellidos = { [Op.iLike]: `%${apellidos}%` };
    if (email) whereClause.email = { [Op.iLike]: `%${email}%` };
    if (phone) whereClause.phone = { [Op.iLike]: `%${phone}%` };
    if (address) whereClause.address = { [Op.iLike]: `%${address}%` };
    if (role) whereClause.role = role;
    if (status) whereClause.status = status;

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'apellidos', 'email', 'phone', 'address','role', 'status', 'profilePicture', 'createdAt'],
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('Error al buscar usuarios:', error);
    res.status(500).json({ message: 'Error al buscar usuarios' });
  }
};

// Exportar la lista de usuarios en formato CSV
const exportUsers = async (req, res) => {
  try {
      const users = await User.findAll({
          attributes: ['id', 'name', 'apellidos', 'email', 'phone', 'address', 'role', 'status', 'createdAt'],
      });

      const csvStringifier = createObjectCsvStringifier({
          header: [
              { id: 'id', title: 'ID' },
              { id: 'name', title: 'Nombre' },
              { id: 'apellidos', title: 'Apellidos' },
              { id: 'email', title: 'Correo Electrónico' },
              { id: 'phone', title: 'Teléfono' },
              { id: 'address', title: 'Dirección' },
              { id: 'role', title: 'Rol' },
              { id: 'status', title: 'Estado' },
              { id: 'createdAt', title: 'Fecha de Creación' },
          ],
      });

      const csvHeader = csvStringifier.getHeaderString();
      const csvBody = csvStringifier.stringifyRecords(users.map(user => user.toJSON()));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=usuarios.csv');
      res.status(200).send(csvHeader + csvBody);
  } catch (error) {
      console.error('Error al exportar usuarios:', error);
      res.status(500).json({ message: 'Error al exportar usuarios' });
  }
};

// Exportar la lista de usuarios en formato Excel con filtros
const exportUsersExcel = async (req, res) => {
  try {
      const { role, status } = req.query;

      const whereClause = {};
      if (role) whereClause.role = role;
      if (status) whereClause.status = status;

      const users = await User.findAll({
          where: whereClause,
          attributes: ['id', 'name',  'apellidos', 'email', 'phone', 'address', 'role', 'status', 'createdAt'],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Usuarios');

      worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Nombre', key: 'name', width: 30 },
          { header: 'Apellidos', key: 'apellidos', width: 30 },
          { header: 'Correo Electrónico', key: 'email', width: 30 },
          { header: 'Teléfono', key: 'phone', width: 20 },
          { header: 'Dirección', key: 'address', width: 30 },
          { header: 'Rol', key: 'role', width: 15 },
          { header: 'Estado', key: 'status', width: 15 },
          { header: 'Fecha de Creación', key: 'createdAt', width: 25 },
      ];

      users.forEach(user => {
          worksheet.addRow(user.toJSON());
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');

      await workbook.xlsx.write(res);
      res.end();
  } catch (error) {
      console.error('Error al exportar usuarios en Excel:', error);
      res.status(500).json({ message: 'Error al exportar usuarios en Excel' });
  }
};

// Actualizar el rol de un usuario
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'No tienes permisos para cambiar roles' });
    }

    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['superadmin', 'admin', 'manager', 'client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Rol no válido. Use: ${validRoles.join(', ')}` });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.role = role;
    await user.save();
    res.status(200).json({ message: 'Rol actualizado exitosamente', user });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};

// Actualizar el estado (activar/desactivar) de un usuario
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'activo' o 'inactivo'

    // Validar que el estado sea válido
    if (!['activo', 'inactivo'].includes(status)) {
      return res.status(400).json({ message: 'Estado no válido. Debe ser "activo" o "inactivo".' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

// Registrar la acción en la tabla de auditoría
await AuditLog.create({
  action: 'updateUserStatus',
  userId: req.user.id, // ID del usuario que realizó la acción
  targetId: user.id, // ID del usuario afectado
  targetType: 'User',
  details: { oldStatus, newStatus: status },
});

    res.status(200).json({ message: `Estado del usuario actualizado a "${status}"`, user });
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ message: 'Error al actualizar estado del usuario' });
  }
};

// Controlador para crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { name, apellidos, email, password, role, status, phone, address } = req.body;

    // Validar campos obligatorios
    if (!name || !apellidos || !email || !password || !role || !status) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'El correo ya está registrado.' });
    }

    // 🔹 Encriptar la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, 10); // 10 es el número de "salt rounds"

    // Crear usuario en la base de datos
    const newUser = await User.create({ 
      name, 
      apellidos,
      email, 
      password: hashedPassword,
      role, 
      status,
      phone, 
      address 
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el usuario antes de eliminarlo
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Bloquear eliminación si el usuario es SuperAdmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'No puedes eliminar al usuario SuperAdmin.' });
    }

    // Proceder con la eliminación si no es SuperAdmin
    await user.destroy();
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });

  } catch (error) {
    if (error.message.includes('SuperAdmin')) {
      return res.status(403).json({ message: error.message });
    }
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};

// Asignar un rol a un usuario (solo superadmin)
const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = [ 'admin', 'client'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: `Rol no válido. Use: ${validRoles.join(', ')}` });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // 🚫 Bloquear cambio de rol si el usuario es superadmin
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'No puedes cambiar el rol de un SuperAdmin.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

// Registrar la acción en la tabla de auditoría
await AuditLog.create({
  action: 'assignRole',
  userId: req.user.id, // ID del usuario que realizó la acción
  targetId: user.id, // ID del usuario afectado
  targetType: 'User',
  details: { oldRole, newRole: role },
});

    res.status(200).json({ message: `Rol actualizado a "${role}" para el usuario ${user.name}`, user });
  } catch (error) {
    console.error('Error al asignar rol:', error);
    res.status(500).json({ message: 'Error al asignar rol' });
  }
};

module.exports = { 
  getUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  getUsers, 
  searchUsers, 
  exportUsers, 
  exportUsersExcel, 
  updateUserRole, 
  updateUserStatus,
  updateUserProfile,
  updateUserProfileAdmin,
  createUser, 
  deleteUser,
  assignRole,
};