const couponSerivce = require('../services/coupon.service');

exports.getAllCoupons = async (req, res) => {
  const { coupons, pagination } = await couponSerivce.getAllCoupons(req.query);
  return res.status(200).json({
    status: 'success',
    pagination,
    data: coupons,
  });
};

exports.getCoupon = async (req, res) => {
  const coupon = await couponSerivce.getCoupon(req.params.id);
  return res.status(200).json({
    status: 'success',
    data: coupon,
  });
};

exports.addCoupon = async (req, res) => {
  const coupon = await couponSerivce.addCoupon(req.body);
  return res.status(201).json({
    status: 'success',
    data: coupon,
  });
};

exports.updateCoupon = async (req, res) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError('Please provide us the data you wish to update', 400);

  const coupon = await couponSerivce.updateCoupon(req.params.id, req.body);

  return res.status(200).json({
    status: 'success',
    data: coupon,
  });
};

exports.deleteCoupon = async (req, res) => {
  const coupon = await couponSerivce.deleteCoupon(req.params.id);
  return res.status(204).json({ status: 'success', data: coupon });
};
