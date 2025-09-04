const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/zip',
  'application/x-rar-compressed'
];

const maxFileSize = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const uploadPath = path.join(process.cwd(), 'uploads', 'clients');
      await fs.ensureDir(uploadPath);
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
    files: 10 // Maximum 10 files at once
  }
});

const uploadMiddleware = {
  single: (fieldName) => (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    singleUpload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`
          });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${error.message}`
        });
      } else if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next();
    });
  },

  multiple: (fieldName, maxCount = 10) => (req, res, next) => {
    const multipleUpload = upload.array(fieldName, maxCount);
    multipleUpload(req, res, (error) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB`
          });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed`
          });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Unexpected field name'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${error.message}`
        });
      } else if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next();
    });
  }
};

const deleteFile = async (filePath) => {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

const cleanupOrphanedFiles = async (validFilePaths) => {
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'clients');
    if (!(await fs.pathExists(uploadDir))) {
      return;
    }

    const files = await fs.readdir(uploadDir);
    const validFileNames = validFilePaths.map(filePath => path.basename(filePath));

    for (const file of files) {
      if (!validFileNames.includes(file)) {
        await fs.unlink(path.join(uploadDir, file));
        console.log(`Deleted orphaned file: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
  }
};

const getFileInfo = (file) => {
  return {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path
  };
};

const getFileType = (mimetype) => {
  const typeMap = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/zip': 'zip',
    'application/x-rar-compressed': 'rar'
  };
  
  return typeMap[mimetype] || 'unknown';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  uploadMiddleware,
  deleteFile,
  cleanupOrphanedFiles,
  getFileInfo,
  getFileType,
  formatFileSize,
  allowedMimeTypes,
  maxFileSize
};