const mongoose = require('mongoose');
const User = require('./user.model');
const Product = require('./product.model');

const cartItemsSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Cart must contain at least one product'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1.'],
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Cart must belong to a user'],
    },
    items: [cartItemsSchema],
    appliedCoupon: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

cartSchema.virtual('subTotal').get(function () {
  if (!this.items || this.items.length === 0) return 0;
  return this.items.reduce((total, item) => {
    const price =
      item.productId && item.productId.price ? item.productId.price : 0;
    return total + item.quantity * price;
  }, 0);
});

cartSchema.virtual('totalPrice').get(function () {
  const subTotal = this.subTotal;
  if (!this.appliedCoupon || !this._couponDiscount) {
    return subTotal;
  }

  let discountAmount = 0;
  if (this._couponType === 'percentage') {
    discountAmount = (subTotal * this._couponDiscount) / 100;
  } else if (this._couponType === 'fixed') {
    discountAmount = this._couponDiscount;
  }
  const finalPrice = subTotal - discountAmount;

  return Math.max(0, finalPrice);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
