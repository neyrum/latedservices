const express = require("express");
const router = express.Router();
const { 
  getPortfolioProjects, 
  createPortfolioProject, 
  updatePortfolioProject, 
  deletePortfolioProject 
} = require("../controllers/portfolio.controller");
const upload = require("../middlewares/upload.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

// ✅ GET: Obtener proyectos
router.get("/projects", getPortfolioProjects);

// ✅ POST: Solo administradores pueden subir archivos
router.post("/projects", authenticate, authorize (["admin", "superadmin"]), upload.single("media"), createPortfolioProject);

// ✅ PUT: Permitir cambiar imagen o video
router.put("/projects/:id", authenticate, authorize (["admin", "superadmin"]), upload.single("media"), updatePortfolioProject);

// ✅ DELETE: Solo administradores pueden eliminar
router.delete("/projects/:id", authenticate, authorize (["admin", "superadmin"]), deletePortfolioProject);

module.exports = router;
