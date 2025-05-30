const fs = require("fs");
const path = require("path");
const { Portfolio } = require("../models");

const baseUrl = process.env.APP_URL; // URL base para servir archivos
const defaultImageUrl = `${baseUrl}/assets/img/default-placeholder.png`; // Imagen por defecto

// 🔹 Obtener todos los proyectos del portafolio
const getPortfolioProjects = async (req, res) => {
  try {
    const projects = await Portfolio.findAll({
      attributes: ["id", "name", "description", "category", "client", "mediaUrl"]
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error("❌ Error al obtener proyectos:", error.message);
    res.status(500).json({ message: `Error interno: ${error.message}` });
  }
};

// 🔹 Crear un nuevo proyecto
const createPortfolioProject = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "❌ Datos incompletos. Verifica tu solicitud." });
    }

    const { name, description, category, client } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "❌ El nombre es obligatorio." });
    }
    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "❌ La descripción es obligatoria." });
    }
    if (!category || category.trim() === "") {
      return res.status(400).json({ message: "❌ La categoría es obligatoria." });
    }
    if (!client || client.trim() === "") {
      return res.status(400).json({ message: "❌ El nombre del cliente es obligatorio." });
    }

    let mediaUrl = defaultImageUrl; // Usa imagen por defecto si no hay archivo
    if (req.file) {
      if (!req.file.mimetype.startsWith("image") && !req.file.mimetype.startsWith("video")) {
        return res.status(400).json({ message: "❌ Tipo de archivo no permitido. Solo imágenes y videos." });
      }
      mediaUrl = req.file.mimetype.startsWith("image")
        ? `${baseUrl}/assets/img/portfolio/${req.file.filename}`
        : `${baseUrl}/assets/videos/portfolio/${req.file.filename}`;
    }

    const newProject = await Portfolio.create({ name, description, category, client, mediaUrl });

    return res.status(201).json({ message: "✅ Proyecto creado exitosamente.", project: newProject });
  } catch (error) {
    console.error("❌ Error al crear proyecto:", error.message);
    res.status(500).json({ message: `Error interno: ${error.message}` });
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

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "❌ El nombre es obligatorio." });
    }
    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "❌ La descripción es obligatoria." });
    }
    if (!category || category.trim() === "") {
      return res.status(400).json({ message: "❌ La categoría es obligatoria." });
    }
    if (!client || client.trim() === "") {
      return res.status(400).json({ message: "❌ El nombre del cliente es obligatorio." });
    }

    let mediaUrl = project.mediaUrl;
    if (req.file) {
      if (!req.file.mimetype.startsWith("image") && !req.file.mimetype.startsWith("video")) {
        return res.status(400).json({ message: "❌ Tipo de archivo no permitido. Solo imágenes y videos." });
      }
      mediaUrl = req.file.mimetype.startsWith("image")
        ? `${baseUrl}/assets/img/portfolio/${req.file.filename}`
        : `${baseUrl}/assets/videos/portfolio/${req.file.filename}`;
    }

    await project.update({ name, description, category, client, mediaUrl });

    return res.status(200).json({ message: "✅ Proyecto actualizado correctamente.", project });
  } catch (error) {
    console.error("❌ Error al actualizar proyecto:", error.message);
    res.status(500).json({ message: `Error interno: ${error.message}` });
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

    if (project.mediaUrl && project.mediaUrl !== defaultImageUrl) {
      const filePath = path.join(__dirname, "..", "public", project.mediaUrl.replace(baseUrl, ""));
      
      console.log("Intentando eliminar archivo:", filePath);
      
      if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
        try {
          await fs.promises.unlink(filePath);
          console.log("✅ Archivo multimedia eliminado:", filePath);
        } catch (err) {
          console.error("❌ Error al eliminar el archivo:", err.message);
        }
      } else {
        console.warn("⚠️ Archivo no encontrado:", filePath);
      }
    }

    await project.destroy();
    return res.status(200).json({ message: "✅ Proyecto eliminado correctamente junto con su archivo multimedia." });
  } catch (error) {
    console.error("❌ Error al eliminar proyecto:", error.message);
    res.status(500).json({ message: `Error interno: ${error.message}` });
  }
};

module.exports = { getPortfolioProjects, createPortfolioProject, updatePortfolioProject, deletePortfolioProject };
