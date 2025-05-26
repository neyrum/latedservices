const { User } = require('./models'); // Asegúrate de que la ruta sea correcta

(async () => {
  try {
    const email = 'root@prueba.com'; // Cambia esto al correo del usuario
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('Usuario no encontrado');
      process.exit(1);
    }

    user.role = 'client';
    await user.save();

    console.log(`El usuario ${user.name} ahora es superadmin.`);
    process.exit(0);
  } catch (error) {
    console.error('Error al actualizar el rol del usuario:', error);
    process.exit(1);
  }
})();