// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Hakikisha folder ya uploads/temp ipo
const uploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Mipangilio ya multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter aina za faili zinazoruhusiwa
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Aina ya faili hairuhusiwi. Tuma picha tu (JPEG, PNG, WEBP, GIF).'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware ya kupakia picha kwenye Telegram
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return next();
    
    const TelegramService = require('../services/telegramService');
    const result = await TelegramService.uploadImage(req.file.path);
    
    if (result.success) {
      req.fileUrl = result.url;
      req.fileId = result.fileId;
    } else {
      req.uploadError = result.error;
    }
    
    // Safisha faili la muda
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {
      // ignore
    }
    
    next();
  } catch (error) {
    console.error('Upload middleware error:', error);
    req.uploadError = error.message;
    next();
  }
};

module.exports = { upload, uploadImage };