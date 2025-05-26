const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Middleware de autenticación: Verifica el token JWT y obtiene los datos del usuario.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Verifica que se haya enviado el header de autorización
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Acceso denegado. No se proporcionó token.",
    });
  }

  // Extrae el token del header (se espera formato: "Bearer [token]")
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Formato de token inválido. Use: Bearer [token]",
    });
  }

  try {
    // Asegúrate de que la variable de entorno JWT_SECRET esté definida
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET no está definido en las variables de entorno.");
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor. Contacte al administrador.",
      });
    }

    // Verifica y decodifica el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Si el usuario proviene de LDAP, lo autenticamos sin buscarlo en la base de datos
    if (decoded.username) {
      req.user = { username: decoded.username };
      console.log("✅ Usuario autenticado vía LDAP:", req.user);
      return next();
    }

    // Busca al usuario en la base de datos usando el ID extraído del token
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Añade el usuario autenticado a la petición para poder usarlo después
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("✅ Usuario autenticado:", req.user);

    next();
  } catch (error) {
    console.error("❌ Error en autenticación JWT:", error.message);
    res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

/**
 * Middleware de autorización: Controla el acceso basado en roles.
 * @param {Array<String> | String} roles - Roles permitidos (por ejemplo, ['admin'] o 'admin')
 */
const authorize = (roles = []) => {
  // Permitir pasar un solo rol como string y convertirlo a array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    console.log("🔍 Usuario autenticado en autorización:", req.user);

    // Verifica que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    // Si se especifican roles y el rol del usuario no está permitido
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      console.warn(`🚫 Acceso denegado para el usuario con rol: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Requiere rol: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
