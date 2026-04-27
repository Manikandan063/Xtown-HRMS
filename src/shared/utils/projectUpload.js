import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure project uploads directory exists
const uploadDir = 'uploads/projects';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common project document types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|txt|zip|ppt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype.includes('msword') || file.mimetype.includes('officedocument') || file.mimetype.includes('zip') || file.mimetype.includes('text/plain');

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed. Supported: Images, PDF, Word, Excel, PPT, TXT, ZIP'));
  }
};

export const uploadProjectFile = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for project files
  fileFilter: fileFilter
});
