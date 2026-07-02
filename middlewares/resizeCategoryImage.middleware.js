const sharp = require('sharp');

exports.resizeCategoryImage = async (req, res, next) => {
  if (!req.file) return next();
  const filename = `category-${req.user.id}-${Date.now()}.jpeg`;
  const buffer = await sharp(req.file.buffer)
    .resize(1200, 1200, { fit: 'contain', background: '#ffffff' })
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();
  // .toFile(`public/img/categories/${req.file.filename}`);
  req.processedImage = { filename, buffer };
  req.body.image = filename;
  next();
};
