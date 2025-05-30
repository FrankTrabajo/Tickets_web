const multer = require('multer');
const { storage } = require('./cloudinary'); // Importas el storage de Cloudinary

// Filtro opcional
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("El archivo no es una imagen"), false);
  }
};

const upload = multer({
  storage: storage, // Cloudinary como almacenamiento
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

module.exports = upload;
