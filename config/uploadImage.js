const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const dateFormat = require('dateformat');
const path = require('path');
const multer = require('multer');

const pathKey = path.resolve('./serviceaccount.json')

const gcs = new Storage({
    projectId: 'capstone-project-click',
    keyFilename: pathKey
})

const bucketName = 'capstone-click'
const bucket = gcs.bucket(bucketName)

function getPublicUrl(filename) {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadToGcs = (req, res, next) => {
  const file = req.file;

  if (!file) {
    return next();
  }
  const originalFilename = file.originalname;
  const sanitizedFilename = originalFilename.replace(/\s+/g, "-");

  const gcsname = `users/${dateFormat(new Date(), 'yyyymmdd-HHMMss')}-${sanitizedFilename}`;
  const fileUpload = bucket.file(gcsname);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype
    }
  });

  stream.on('error', (err) => {
    file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    file.cloudStorageObject = gcsname;
    file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(file.buffer);
};

module.exports = { 
  multerUpload, 
  uploadToGcs 
};