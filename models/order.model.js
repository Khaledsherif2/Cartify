const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Order items must contain a product ID'],
    },
    title: {
      type: String,
      required: [true, 'Product must have a name'],
    },
    price: {
      type: Number,
      required: [true, 'Product must have a price'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a product quantity'],
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user!'],
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      city: { type: String, required: true },
      street: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    priceBeforeDiscount: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash on delivery', 'paymob'],
      required: [true, 'Please specify a payment method'],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    paymobIntentionId: String,
    paymobClientSecret: String,
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
