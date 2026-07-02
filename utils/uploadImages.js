const multer = require('multer');
const AppError = require('./appError');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    return cb(null, true);
  }
  cb(new AppError('Not an image! Please upload only images.', 400), false);
};

exports.upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
