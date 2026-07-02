const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const paymobController = require('../controllers/paymob.controller');

const router = express.Router();

router.get('/callback', paymobController.callback);
router.post('/webhook', paymobController.webhook);
router.post(
  '/retry-payment/:orderId',
  authMiddleware.protect,
  paymobController.retryPayment,
);

module.exports = router;
