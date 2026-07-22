const sharp = require('sharp');

exports.resizeCategoryImage = async (req, res, next) => {
  if (!req.file) return next();
  const filename = `category-${req.user.id}-${Date.now()}.png`;
  const buffer = await sharp(req.file.buffer)
    .resize(1200, 1200, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFormat('png')
    .png({ quality: 90 })
    .toBuffer();
  req.processedImage = { filename, buffer };
  req.body.image = filename;
  next();
};
