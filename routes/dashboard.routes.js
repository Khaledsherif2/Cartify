const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/top-selling-products', dashboardController.getTopSellingProducts);
router.get('/top-rated-products', dashboardController.getTopRatedProducts);

router.use(authMiddleware.restrictTo('admin'));

router.get('/overview', dashboardController.getOverview);
router.get('/sales-by-month', dashboardController.getSalesByMonth);
router.get('/recent-orders', dashboardController.getRecentOrders);
router.get('/orders-status', dashboardController.getOrdersStatus);
router.get('/average-order-value', dashboardController.getAverageOrderValue);
router.get(
  '/most-valuable-customers',
  dashboardController.getMostValuableCustomers,
);

module.exports = router;
