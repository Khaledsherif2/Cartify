const Coupon = require('../models/coupon.model');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllCoupons = async query => {
  const features = new APIFeatures(Coupon.find(), query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const coupons = await features.query;
  const pagination = await features.getPaginationResult();

  return { coupons, pagination };
};

exports.getCoupon = async couponId => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon)
    throw new AppError('There is no coupon found with that ID!', 404);
  return coupon;
};

exports.addCoupon = async couponData => {
  const newCoupon = await Coupon.create(couponData);
  return newCoupon;
};

exports.updateCoupon = async (couponId, couponData) => {
  const coupon = await Coupon.findByIdAndUpdate(couponId, couponData, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!coupon)
    throw new AppError('There is no coupon found with that ID!', 404);
  return coupon;
};

exports.deleteCoupon = async (couponId, couponData) => {
  const coupon = await Coupon.findByIdAndDelete(couponId, couponData);
  if (!coupon)
    throw new AppError('There is no coupon found with that ID!', 404);
  return null;
};
