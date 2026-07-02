const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');
const validate = require('../middlewares/validate.middleware');
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require('../validations/order.validation');

const router = express.Router();

router.use(authMiddleware.protect);

router.get(
  '/',
  authMiddleware.restrictTo('admin'),
  orderController.getAllOrders,
);
router.post(
  '/checkout',
  validate(createOrderSchema),
  orderController.createOrder,
);

router.get('/my-orders', orderController.getUserOrders);
router
  .route('/:id')
  .patch(
    authMiddleware.restrictTo('admin'),
    validate(updateOrderStatusSchema),
    orderController.updateOrderStatus,
  )
  .delete(orderController.cancelOrder);

module.exports = router;
