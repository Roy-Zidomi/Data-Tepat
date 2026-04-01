const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const getUploadDir = () => {
  const dir = process.env.UPLOAD_DIR || 'uploads';
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and pdfs
  if (
    file.mimetype.startsWith('image/') || 
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only image and pdf are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880, // 5MB limit
  }
});

module.exports = {
  upload,
};
