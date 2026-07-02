const fs = require('fs').promises;
const path = require('path');
const productService = require('../services/product.service');
const AppError = require('../utils/appError');
const { upload } = require('../utils/uploadImages');

exports.getAllProducts = async (req, res) => {
  const products = await productService.getAllProducts(req.query);
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products,
  });
};

exports.createProduct = async (req, res) => {
  const newProduct = await productService.createProduct(req.body);
  if (req.processedImages) {
    const uploadPath = path.join(__dirname, '../public/img/products');
    if (req.processedImages.imageCover) {
      const { filename, buffer } = req.processedImages.imageCover;
      await fs.writeFile(`${uploadPath}/${filename}`, buffer);
    }
    if (req.processedImages.images && req.processedImages.images.length > 0) {
      await Promise.all(
        req.processedImages.images.map(async img => {
          await fs.writeFile(`${uploadPath}/${img.filename}`, img.buffer);
        }),
      );
    }
  }
  res.status(201).json({
    status: 'success',
    data: newProduct,
  });
};

exports.getProduct = async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  res.status(200).json({
    status: 'success',
    data: product,
  });
};

exports.updateProduct = async (req, res) => {
  const result = await productService.updateProduct(req.params.id, req.body);
  if (req.processedImages) {
    const uploadPath = path.join(__dirname, '../public/img/products');
    if (req.processedImages.imageCover) {
      const { filename, buffer } = req.processedImages.imageCover;
      await fs.writeFile(`${uploadPath}/${filename}`, buffer);

      if (result.product.imageCover) {
        await fs
          .unlink(`${uploadPath}/${result.product.imageCover}`)
          .catch(() => {});
      }
    }

    if (req.processedImages.images && req.processedImages.images.length > 0) {
      await Promise.all(
        req.processedImages.images.map(async img => {
          await fs.writeFile(`${uploadPath}/${img.filename}`, img.buffer);
        }),
      );

      if (result.product.images && result.product.images.length > 0) {
        await Promise.all(
          result.product.images.map(async oldImg => {
            await fs.unlink(`${uploadPath}/${oldImg}`).catch(() => {});
          }),
        );
      }
    }
  }
  res.status(200).json({
    status: 'success',
    data: result.updatedProduct,
  });
};

exports.deleteProduct = async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  res.status(204).json({
    status: 'success',
    data: product,
  });
};

exports.uploadProductImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
