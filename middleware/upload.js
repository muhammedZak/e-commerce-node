import multer from 'multer';
import path from 'path';
import fs from 'fs';

const createFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const getStorage = (folderName) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const folderPath = `uploads/${folderName}`;

      createFolder(folderPath); // ensure folder exists

      cb(null, folderPath);
    },

    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      const ext = path.extname(file.originalname);

      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const uploadSingle = (fieldName, folderName) => {
  return multer({
    storage: getStorage(folderName),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  }).single(fieldName);
};

export const uploadMultiple = (fieldName, folderName, maxCount = 5) => {
  return multer({
    storage: getStorage(folderName),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  }).array(fieldName, maxCount);
};

export const uploadFields = (fields, folderName) => {
  return multer({
    storage: getStorage(folderName),
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
  }).fields(fields);
};
