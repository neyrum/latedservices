const { Request, Service, User } = require('../models');

const getAdminSummary = async (req, res) => {
  try {
    const summary = {
      totalRequests: await Request.count(),
      activeServices: await Service.count({ where: { isActive: true } }),
      pendingRequests: await Request.count({ where: { status: 'pending' } }),
      totalUsers: await User.count(),
    };

    res.json(summary);
  } catch (error) {
    console.error("Error en getAdminSummary:", error); // Ver logs
    res.status(500).json({ message: "Error al obtener el resumen", error });
  }
};

module.exports = { getAdminSummary };
