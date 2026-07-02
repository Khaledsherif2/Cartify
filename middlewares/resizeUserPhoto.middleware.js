const sharp = require('sharp');

exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  const buffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();
  // .toFile(`public/img/users/${req.file.filename}`);
  req.processedImage = { filename, buffer };
  req.body.photo = filename;
  next();
};
