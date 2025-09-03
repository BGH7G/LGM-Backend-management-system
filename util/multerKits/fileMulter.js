const multer = require('multer');

// In-memory storage for uploaded files (e.g., Excel/CSV)
// Pros: no disk IO, simpler cleanup; suitable for moderate file sizes
const storage = multer.memoryStorage();

const fileUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

module.exports = fileUpload;
