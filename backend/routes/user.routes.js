const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware'); // Middleware para autenticar usuarios
const { authorize } = require('../middlewares/role.middleware'); // Middleware para autorizar roles
const { 
  getUsers, 
  updateUserRole, 
  updateUserStatus, 
  deleteUser, 
  searchUsers, 
  assignRole, 
  exportUsers, 
  exportUsersExcel, 
  getUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  createUser,
  updateUserProfile, 
  updateUserProfileAdmin,
} = require('../controllers/user.controller'); 
const { resetUserPassword } = require('../controllers/auth.controller');

// Rutas para la gestión de usuarios

// Ruta para agregar un nuevo usuario (solo accesible para administradores)
router.post('/', authenticate, authorize(['superadmin']), createUser);

// Ruta para obtener el perfil del usuario autenticado
router.get("/me", authenticate, getUserProfile);

// Ruta para actualizar el perfil del usuario autenticado
router.put('/me', authenticate, updateUserProfile);

// Ruta para subir la foto de perfil en formato Base64
router.post('/profile-picture', authenticate, uploadProfilePicture);

// Ruta para eliminar la foto de perfil en formato Base64
router.delete('/profile-picture', authenticate, deleteProfilePicture);

// Ruta para obtener todos los usuarios (solo accesible para administradores)
router.get('/', authenticate, authorize(['admin', 'superadmin']), getUsers);

// Ruta para buscar usuarios por criterios específicos (solo accesible para administradores)
router.get('/search', authenticate, authorize(['admin', 'superadmin']), searchUsers);

// Ruta para exportar la lista de usuarios en formato CSV (solo accesible para administradores)
router.get('/export', authenticate, authorize(['admin', 'superadmin']), exportUsers);

// Ruta para exportar usuarios en formato Excel con filtros (solo accesible para administradores)
router.get('/export/excel', authenticate, authorize(['admin', 'superadmin']), exportUsersExcel);


// Ruta para actualizar el rol de un usuario (solo accesible para administradores)
router.put('/:id', authenticate, authorize(['admin', 'superadmin']), updateUserRole);

// Ruta para actualizar el perfil completo de un usuario 
router.put('/:id/profile', authenticate, authorize(['admin', 'superadmin']), updateUserProfileAdmin);

// Ruta para actualizar el estado de un usuario (activar/desactivar, solo accesible para administradores)
router.put('/:id/status', authenticate, authorize(['admin', 'superadmin']), updateUserStatus);

// Ruta para restablecer la contraseña de un usuario (solo accesible para administradores)
router.put('/:id/reset-password', authenticate, authorize(['admin', 'superadmin']), resetUserPassword);

// Ruta para asignar roles (solo accesible para superadmin)
router.put('/:id/role', authenticate, authorize(['superadmin']), assignRole);

// Ruta para eliminar un usuario (solo accesible para administradores)
router.delete('/:id', authenticate, authorize(['admin', 'superadmin']), deleteUser);

module.exports = router;