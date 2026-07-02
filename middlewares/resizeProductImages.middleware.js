const sharp = require('sharp');

exports.resizeProductImages = async (req, res, next) => {
  if (!req.files || (!req.files.imageCover && !req.files.images)) return next();

  req.processedImages = {};
  if (req.files.imageCover) {
    const filename = `products-${req.params.id || 'new'}-${Date.now()}-cover.jpeg`;
    const buffer = await sharp(req.files.imageCover[0].buffer)
      .resize(1200, 1200, { fit: 'contain', background: '#ffffff' })
      .toFormat('jpeg')
      .jpeg({ quality: 80 })
      .toBuffer();
    // .toFile(`public/img/products/${req.body.imageCover}`);
    req.processedImages.imageCover = { filename, buffer };
    req.body.imageCover = filename;
  }

  if (req.files.images) {
    req.processedImages.images = [];
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `products-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        const buffer = await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'contain', background: '#ffffff' })
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toBuffer();
        // .toFile(`public/img/products/${filename}`);
        req.processedImages.images.push({ filename, buffer });
        req.body.images.push(filename);
      }),
    );
  }

  next();
};
