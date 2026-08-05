const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = process.env.UPLOAD_DIR || 'uploads/comprobantes';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = `comprobante_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nombre);
  }
});

const fileFilter = (req, file, cb) => {
  const permitidos = /jpeg|jpg|png|pdf/;
  const esValido = permitidos.test(path.extname(file.originalname).toLowerCase()) &&
                   permitidos.test(file.mimetype);
  if (esValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPG, PNG) y PDF.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
