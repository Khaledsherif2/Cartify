const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const couponController = require('../controllers/coupon.controller');
const validate = require('../middlewares/validate.middleware');
const {
  addCouponSchema,
  updateCouponSchema,
} = require('../validations/coupon.validation');

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('admin'));

router
  .route('/')
  .get(couponController.getAllCoupons)
  .post(validate(addCouponSchema), couponController.addCoupon);

router
  .route('/:id')
  .get(couponController.getCoupon)
  .patch(validate(updateCouponSchema), couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
