const fs = require("fs");
const path = require("path");
const { Portfolio } = require("../models");

const baseUrl = process.env.APP_URL; // URL base para servir archivos

// 🔹 Obtener todos los proyectos del portafolio
const getPortfolioProjects = async (req, res) => {
  try {
    const projects = await Portfolio.findAll({
      attributes: ["id", "name", "description", "category", "client", "mediaUrl"]
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error al obtener proyectos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// 🔹 Crear un nuevo proyecto
const createPortfolioProject = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "❌ Datos incompletos. Verifica tu solicitud." });
    }

    const { name, description, category, client } = req.body;
    const mediaUrl = req.file 
      ? req.file.mimetype.startsWith("image") 
        ? `${baseUrl}/assets/img/portfolio/${req.file.filename}`
        : `${baseUrl}/assets/videos/portfolio/${req.file.filename}`
      : null;

    if (!name || !description) {
      return res.status(400).json({ message: "❌ El nombre y la descripción son obligatorios." });
    }

    const newProject = await Portfolio.create({ name, description, category, client, mediaUrl });

    return res.status(201).json({ message: "✅ Proyecto creado exitosamente.", project: newProject });
  } catch (error) {
    console.error("❌ Error al crear proyecto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// 🔹 Actualizar un proyecto
const updatePortfolioProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, client } = req.body;

    const project = await Portfolio.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "❌ Proyecto no encontrado." });
    }

    // ✅ Si se sube un nuevo archivo, actualizar la URL con APP_URL
    const mediaUrl = req.file 
      ? req.file.mimetype.startsWith("image") 
        ? `${baseUrl}/assets/img/portfolio/${req.file.filename}`
        : `${baseUrl}/assets/videos/portfolio/${req.file.filename}`
      : project.mediaUrl;

    await project.update({ name, description, category, client, mediaUrl });

    return res.status(200).json({ message: "✅ Proyecto actualizado correctamente.", project });
  } catch (error) {
    console.error("❌ Error al actualizar proyecto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

// 🔹 Eliminar un proyecto y su archivo multimedia
const deletePortfolioProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Portfolio.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: "❌ Proyecto no encontrado." });
    }

    // ✅ Eliminamos el archivo multimedia asegurando la ruta correcta
    if (project.mediaUrl) {
      const filePath = path.join(__dirname, "..", "public", project.mediaUrl.replace(baseUrl, ""));
      
      console.log("Intentando eliminar archivo:", filePath);
      
      if (fs.existsSync(filePath)) {
        try {
          await fs.promises.unlink(filePath);
          console.log("✅ Archivo multimedia eliminado:", filePath);
        } catch (err) {
          console.error("❌ Error al eliminar el archivo:", err);
        }
      } else {
        console.warn("⚠️ Archivo no encontrado:", filePath);
      }
    }

    // ✅ Eliminar el proyecto de la base de datos
    await project.destroy();
    return res.status(200).json({ message: "✅ Proyecto eliminado correctamente junto con su archivo multimedia." });
  } catch (error) {
    console.error("❌ Error al eliminar proyecto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = { getPortfolioProjects, createPortfolioProject, updatePortfolioProject, deletePortfolioProject };
