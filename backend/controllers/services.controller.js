const { Service, Rating } = require('../models');
const path = require("path");
const fs = require("fs");
const { Op } = require('sequelize');

// Obtener solo los servicios destacados con imágenes
const getPortfolioServices = async (req, res) => {
  try {
    const portfolioItems = await Service.findAll({
      where: { featured: true, mediaUrl: { [Op.ne]: null } },
      attributes: ["id", "name", "description", "mediaUrl", "featured"]
    });

    if (portfolioItems.length === 0) {
      return res.status(404).json({ message: "No se encontraron servicios para el portafolio." });
    }

    res.status(200).json(portfolioItems);
  } catch (error) {
    console.error("Error al obtener el portafolio:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener el portafolio." });
  }
};

// Obtener solo los servicios activos
const getActiveServices = async (req, res) => {
    try {
        const activeServices = await Service.findAll({
            where: { isActive: true },
            attributes: ['id', 'name', 'description', 'price', 'averageRating', 'icon'],
        });

        console.log("Servicios activos encontrados:", activeServices);

        if (activeServices.length === 0) {
            return res.status(404).json({ message: "No hay servicios activos disponibles." });
        }

        res.status(200).json({ data: activeServices });
    } catch (error) {
        console.error("Error al obtener servicios activos:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// Obtener todos los servicios
const getServices = async (req, res) => {
    try {
        const services = await Service.findAll({
            attributes: ['id', 'name', 'description', 'price', 'averageRating', 'icon'],
        });
        res.status(200).json(services);
    } catch (error) {
        console.error('Error al obtener los servicios:', error);
        res.status(500).json({ message: 'Error al obtener los servicios' });
    }
};

// Obtener un servicio por ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByPk(id, {
            attributes: ['id', 'name', 'description', 'price', 'averageRating', 'icon' ],
        });
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        res.status(200).json(service);
    } catch (error) {
        console.error('Error al obtener el servicio:', error);
        res.status(500).json({ message: 'Error al obtener el servicio' });
    }
};

// Crear un nuevo servicio
const createService = async (req, res) => {
    try {
        // Verificar rol de admin o superadmin
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Solo administradores pueden crear servicios' });
        }

        const { name, description, price, icon, featured } = req.body;
        const mediaUrl = req.file ? `/assets/img/portfolio/${req.file.filename}` : null;

        // Validar datos obligatorios
        if (!name || !description) {
            return res.status(400).json({ message: 'Nombre y descripción son obligatorios' });
        }

        // Validar que el precio sea un número positivo o null
        const validatedPrice = price === "" || price === undefined || price === null ? null : parseFloat(price);
        if (validatedPrice !== null && (!Number.isFinite(validatedPrice) || validatedPrice < 0)) {
            return res.status(400).json({ message: "El precio debe ser un número válido mayor o igual a 0." });
        }

        // Asignar icono por defecto si el usuario no proporciona uno
        const serviceIcon = icon || "fas fa-laptop";

        // Crear el servicio
        const newService = await Service.create({
            name,
            description,
            price: validatedPrice,
            icon: serviceIcon,
            featured: featured === "true",  // Asegurar que featured sea booleano
            mediaUrl,
            createdBy: req.user.id,
        });

        res.status(201).json({ message: 'Servicio creado exitosamente', service: newService });
    } catch (error) {
        console.error('Error al crear el servicio:', error);
        res.status(500).json({ message: 'Error al crear el servicio' });
    }
};

// Actualizar un servicio existente
const updateService = async (req, res) => {
    try {
        // Verificar rol de admin o superadmin
        if (!['admin', 'superadmin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Solo administradores pueden actualizar servicios' });
        }

        const { id } = req.params;
        const { name, description, price, icon  } = req.body;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // Validar datos obligatorios
        if (!name || !description) {
            return res.status(400).json({ message: 'Nombre y descripción son obligatorios.' });
        }

        const validatedPrice = price === "" || price === undefined || price === null ? null : parseFloat(price);
        if (validatedPrice !== null && (!Number.isFinite(validatedPrice) || validatedPrice < 0)) {
            return res.status(400).json({ message: "El precio debe ser un número válido mayor o igual a 0." });
        }

        await service.update({ name, description, price: validatedPrice, icon });

        res.status(200).json({ message: 'Servicio actualizado exitosamente', service });
    } catch (error) {
        console.error('Error al actualizar el servicio:', error);
        res.status(500).json({ message: 'Error al actualizar el servicio' });
    }
};

// Eliminar un servicio
const deleteService = async (req, res) => {
    try {
        // Permitir que admin y superadmin puedan eliminar servicios
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Solo administradores o superadministradores pueden eliminar servicios' });
        }

        const { id } = req.params;
        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: 'Servicio no encontrado' });
        }

        // 🔹 Eliminar la imagen física si existe
    if (service.mediaUrl) {
      const imagePath = path.join(__dirname, "..", "public", service.mediaUrl);
      fs.unlinkSync(imagePath);
    }

        await service.destroy();
        res.status(200).json({ message: 'Servicio eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        res.status(500).json({ message: 'Error al eliminar el servicio' });
    }
};

module.exports = {
    getPortfolioServices,
    getServices,
    getServiceById,
    getActiveServices,
    createService,
    updateService,
    deleteService,
};