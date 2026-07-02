const crypto = require('crypto');
const paymobService = require('../services/paymob.service');
const orderService = require('../services/order.service');
const Email = require('./../utils/email');
const AppError = require('../utils/appError');

exports.webhook = async (req, res) => {
  const payload = req.body.obj;

  if (!payload) {
    return res.status(400).send('Invalid Payload Structure');
  }

  const hmacData =
    payload.amount_cents +
    payload.created_at +
    payload.currency +
    payload.error_occured +
    payload.has_parent_transaction +
    payload.id +
    payload.integration_id +
    payload.is_3d_secure +
    payload.is_auth +
    payload.is_capture +
    payload.is_refunded +
    payload.is_standalone_payment +
    payload.is_voided +
    payload.order.id +
    payload.owner +
    payload.pending +
    payload.source_data.pan +
    payload.source_data.sub_type +
    payload.source_data.type +
    payload.success;

  const secret = process.env.PAYMOB_HMAC_SECRET;
  const calculatedHmac = crypto
    .createHmac('sha512', secret)
    .update(hmacData)
    .digest('hex');

  const receivedHmac = req.query.hmac;

  if (calculatedHmac !== receivedHmac) {
    console.error('❌ Paymob Signature Verification Failed');
    return res.status(400).send('Signature Verification Failed');
  }

  let order = null;
  const user = {
    name: `${req.body.obj.order.shipping_data.first_name} ${req.body.obj.order.shipping_data.last_name}`,
    email: req.body.obj.order.shipping_data.email,
  };

  if (payload.success === true || payload.success === 'true') {
    const orderIdentifier = payload.order.merchant_order_id || payload.order.id;

    order = await orderService.confirmOrder(orderIdentifier);
    const url = `${req.protocol}://${req.get('host')}/my-orders`;
    await new Email(user, url, order).sendOrderConfirm();
  }

  res.status(200).send('ok');
};

exports.callback = async (req, res) => {
  const success = req.query.success === 'true';

  const orderId = req.query.order;

  if (success) {
    return res.send('Payment Completed');
    // return res.redirect(
    //   `${process.env.FRONTEND_URL}/payment-success?orderId=${orderId}`
    // );
  }

  return res.send('Payment failed');
  // return res.redirect(
  //   `${process.env.FRONTEND_URL}/payment-failed?orderId=${orderId}`
  // );
};

exports.retryPayment = async (req, res) => {
  const order = await orderService.getOrder(req.params.orderId);
  if (!order) throw new AppError('There is no order found with that ID!', 404);

  if (order.isPaid) {
    throw new AppError('Order already paid', 400);
  }

  res.status(200).json({
    status: 'success',
    data: {
      checkoutUrl: `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${order.paymobClientSecret}`,
      clientSecret: order.paymobClientSecret,
    },
  });
};
