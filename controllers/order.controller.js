const orderService = require('../services/order.service');
const paymobService = require('../services/paymob.service');
const { filterObj } = require('../utils/filterObj');
const Email = require('./../utils/email');

exports.getAllOrders = async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({
    status: 'success',
    result: orders.length,
    data: orders,
  });
};

exports.getUserOrders = async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.status(200).json({
    status: 'success',
    data: orders,
  });
};

exports.createOrder = async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);

  if (order.paymentMethod === 'cash on delivery') {
    const confirmedOrder = await orderService.confirmOrder(order.id);
    const url = `${req.protocol}://${req.get('host')}/my-orders`;

    await new Email(req.user, url, order).sendOrderConfirm();

    return res.status(201).json({
      status: 'success',
      data: confirmedOrder,
    });
  }

  const payment = await paymobService.createPaymentIntention(req.user, order);
  await orderService.savePaymobIntention(order, payment);

  res.status(201).json({
    status: 'success',
    data: {
      order,
      clientSecret: payment.client_secret,
      checkoutUrl: payment.checkoutUrl,
    },
  });
};

exports.updateOrderStatus = async (req, res) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError('Please provide us the data you wish to update', 400);

  // prettier-ignore
  const data = filterObj(req.body, 'status', 'isPaid', 'paidAt', 'isDelivered', 'deliveredAt');
  const order = await orderService.updateOrderStatus(req.params.id, data);
  res.status(200).json({
    status: 'success',
    data: order,
  });
};

exports.cancelOrder = async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Your order has been cancelled successfully.',
    data: order,
  });
};
