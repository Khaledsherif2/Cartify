const reviewService = require('../services/review.service');
const AppError = require('../utils/appError');
const { filterObj } = require('../utils/filterObj');

exports.getAllReviews = async (req, res) => {
  const { reviews, pagination } = await reviewService.getAllReviews(req.query);
  res.status(200).json({
    status: 'success',
    pagination,
    data: reviews,
  });
};

exports.getReview = async (req, res) => {
  const review = await reviewService.getReview(req.params.id);
  res.status(200).json({
    status: 'success',
    data: review,
  });
};

exports.createReview = async (req, res) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await reviewService.createReview(req.body);
  res.status(201).json({
    status: 'success',
    data: newReview,
  });
};

exports.updateReview = async (req, res) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError('Please provide us the data you wish to update', 400);

  const data = filterObj(req.body, 'review', 'rating');
  const review = await reviewService.updateReview(
    req.params.id,
    data,
    req.user.id,
  );
  res.status(200).json({
    status: 'success',
    data: review,
  });
};

exports.deleteReview = async (req, res) => {
  const review = await reviewService.deleteReview(req.params.id, req.user);
  res.status(204).json({
    status: 'success',
    data: review,
  });
};
