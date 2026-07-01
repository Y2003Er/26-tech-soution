// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// Middleware ya kupakia picha (icon + banner) kwenye Telegram
const uploadImage = async (req, res, next) => {
  try {
    const files = req.files || {};
    const TelegramService = require('../services/telegramService');

    if (files.icon && files.icon[0]) {
      const result = await TelegramService.uploadImage(files.icon[0].path);
      if (result.success) {
        req.fileUrl = result.url;
        req.fileId = result.fileId;
      } else {
        req.uploadError = result.error;
      }
      try { fs.unlinkSync(files.icon[0].path); } catch (e) {}
    }

    if (files.banner && files.banner[0]) {
      const result = await TelegramService.uploadImage(files.banner[0].path);
      if (result.success) {
        req.bannerUrl = result.url;
        req.bannerFileId = result.fileId;
      } else {
        req.bannerUploadError = result.error;
      }
      try { fs.unlinkSync(files.banner[0].path); } catch (e) {}
    }

    next();
  } catch (error) {
    console.error('Upload middleware error:', error);
    req.uploadError = error.message;
    next();
  }
};

module.exports = { upload, uploadImage };