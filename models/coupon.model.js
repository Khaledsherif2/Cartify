const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Coupon must have a name!'],
    unique: true,
  },
  discount: {
    type: Number,
    required: [true, 'Coupon must have a discount value'],
    min: [1, 'Discount value must be more than zero'],
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
  },
  expireAt: {
    type: Date,
    default: Date.now() + 7 * 24 * 60 * 60 * 1000,
  },
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
