const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../frontend/public/img/eventos'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("El archivo no es una imagen"), false);
    }
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});

module.exports = upload;