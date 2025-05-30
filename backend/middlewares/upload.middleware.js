const multer = require("multer");
const path = require("path");

// Función para definir la ubicación según el tipo de archivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith("video") 
      ? "public/assets/videos/portfolio" 
      : "public/assets/img/portfolio";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Generar nombre único
  }
});

// Filtros para permitir solo imágenes y videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato no permitido"), false);
  }
};

// Middleware Multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB por archivo
});

module.exports = upload;
