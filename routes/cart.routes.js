const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.route('/').get(cartController.getCart).post(cartController.addToCart);

router.patch('/apply-coupon', cartController.applyCoupon);

router
  .route('/:productId')
  .patch(cartController.updateItemQuantity)
  .delete(cartController.removeItem);

module.exports = router;
