const sharp = require('sharp');

exports.resizeProductImages = async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) return next();

  req.processedImages = {};
  if (req.files.imageCover) {
    const filename = `products-${req.params.id || 'new'}-${Date.now()}-cover.png`;
    const buffer = await sharp(req.files.imageCover[0].buffer)
      .resize(1200, 1200, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toFormat('png')
      .png({ quality: 90 })
      .toBuffer();
    req.processedImages.imageCover = { filename, buffer };
    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.processedImages.images = [];
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `products-${req.params.id}-${Date.now()}-${i + 1}.png`;
        const buffer = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toFormat('png')
          .png({ quality: 90 })
          .toBuffer();
        req.processedImages.images.push({ filename, buffer });
        req.body.images.push(filename);
      }),
    );
  }

  next();
};
