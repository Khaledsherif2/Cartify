const express = require('express');
const reviewRouter = require('../routes/review.routes');
const authMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createProductSchema,
  updateProductSchema,
} = require('../validations/product.validation');
const {
  resizeProductImages,
} = require('../middlewares/resizeProductImages.middleware');

const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    productController.uploadProductImages,
    resizeProductImages,
    validate(createProductSchema),
    productController.createProduct,
  );

router.use(authMiddleware.protect);

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authMiddleware.restrictTo('admin'),
    productController.uploadProductImages,
    resizeProductImages,
    validate(updateProductSchema),
    productController.updateProduct,
  )
  .delete(authMiddleware.restrictTo('admin'), productController.deleteProduct);

module.exports = router;
