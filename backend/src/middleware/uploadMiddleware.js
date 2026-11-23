
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const pastaUploads = path.join(__dirname, '../../uploads');

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUploads);
  },

  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nome = `questao-${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;

    cb(null, nome);
  }
});

function filtrarImagem(req, file, cb) {
  const tiposPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(new Error('Formato inválido. Envie JPG, PNG ou WEBP.'));
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: filtrarImagem,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
