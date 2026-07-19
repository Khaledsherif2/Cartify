const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const Cart = require('../models/cart.model');
const Coupon = require('../models/coupon.model');
const APIFeatures = require('../utils/apiFeatures');
const { validateProducts } = require('../utils/validateOrderProducts');
const AppError = require('../utils/appError');
const paymobService = require('./paymob.service');

exports.getAllOrders = async query => {
  const features = new APIFeatures(Order.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const orders = await features.query;
  const pagination = await features.getPaginationResult();

  return { orders, pagination };
};

exports.getUserOrders = async userId => {
  const orders = await Order.find({ user: userId });
  return orders;
};

exports.getOrder = async orderId => {
  const order = await Order.findById(orderId);
  return order;
};

exports.createOrder = async (userId, orderData) => {
  const session = await mongoose.startSession();
  try {
    let createdOrder;

    await session.withTransaction(async _ => {
      // 1) Get cart
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new AppError('Cart is empty', 400);
      }

      // 2) Get products
      const productIds = cart.items.map(item => item.productId);
      const products = await Product.find({
        _id: { $in: productIds },
      }).session(session);

      const validationResult = validateProducts(cart, products);

      if (!validationResult.isValid) {
        throw new AppError('Order validation failed', 400, validationResult);
      }

      // 3) Build products map
      const productsMap = validationResult.productsMap;

      // 4) Calculate prices
      let subtotal = 0;
      const orderItems = cart.items.map(item => {
        const product = productsMap.get(item.productId.toString());
        subtotal += product.price * item.quantity;

        return {
          product: product._id,
          title: product.title,
          imageCover: product.imageCover,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const shippingPrice = +process.env.SHIPPING_PRICE;
      let totalPrice = subtotal + shippingPrice;
      // 5) Apply coupon
      if (cart.appliedCoupon) {
        const coupon = await Coupon.findOne({
          name: cart.appliedCoupon,
        }).session(session);

        if (coupon && coupon.expireAt > Date.now()) {
          if (coupon.type === 'percentage') {
            totalPrice -= (subtotal * coupon.discount) / 100;
          } else {
            totalPrice -= coupon.discount;
          }
        }
      }

      // 6) Create order
      const order = await Order.create(
        [
          {
            user: userId,
            orderItems,
            shippingAddress: orderData.shippingAddress,
            shippingPrice,
            priceBeforeDiscount: subtotal,
            totalPrice,
            paymentMethod: orderData.paymentMethod,
            status: 'pending',
          },
        ],
        { session },
      );

      createdOrder = order[0];
    });
    return createdOrder;
  } finally {
    await session.endSession();
  }
};

const reduceStock = async (order, session) => {
  const bulkOps = order.orderItems.map(item => ({
    updateOne: {
      filter: {
        _id: item.product,
        stock: { $gte: item.quantity },
      },
      update: [
        {
          $set: {
            stock: {
              $subtract: ['$stock', item.quantity],
            },
            sold: {
              $add: ['$sold', item.quantity],
            },
          },
        },
        {
          $set: {
            status: {
              $cond: {
                if: { $eq: ['$stock', 0] },
                then: 'sold out',
                else: '$status',
              },
            },
          },
        },
      ],
    },
  }));

  const result = await Product.bulkWrite(bulkOps, { session });

  if (result.modifiedCount !== order.orderItems.length) {
    throw new AppError('Some products are out of stock', 400);
  }
};

const clearCart = async (userId, session) => {
  await Cart.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        items: [],
        appliedCoupon: null,
      },
    },
    { session },
  );
};

exports.savePaymobIntention = async (order, payment) => {
  if (!order) return;
  order.paymobIntentionId = payment.id;
  order.paymobClientSecret = payment.client_secret;
  await order.save({ validateBeforeSave: false });
};

exports.confirmOrder = async orderId => {
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async _ => {
      order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      if (order.status !== 'pending') {
        return order;
      }

      if (order.paymentMethod === 'paymob') {
        order.isPaid = true;
        order.paidAt = Date.now();
      }

      order.status = 'processing';

      await order.save({ session });

      await reduceStock(order, session);

      await clearCart(order.user, session);
    });
    return order;
  } finally {
    await session.endSession();
  }
};

exports.updateOrderStatus = async (orderId, orderData) => {
  const order = await Order.findByIdAndUpdate(orderId, orderData, {
    returnDocument: 'after',
    runValidators: true,
  });
  return order;
};

exports.cancelOrder = async orderId => {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: 'cancelled' },
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  return order;
};
