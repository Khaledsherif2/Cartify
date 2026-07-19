const Review = require('../models/review.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const checkExistingReview = async reviewData => {
  const review = await Review.findOne({
    user: reviewData.user,
    product: reviewData.product,
  });
  return review;
};

exports.getAllReviews = async query => {
  const features = new APIFeatures(Review.find(), query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;
  const pagination = await features.getPaginationResult();

  return { reviews, pagination };
};

exports.getReview = async reviewId => {
  const review = await Review.findById(reviewId);
  return review;
};

exports.createReview = async reviewData => {
  const product = await Product.findById(reviewData.product);
  if (!product) throw new AppError('No product found with that ID', 404);
  const existingReview = await checkExistingReview(reviewData);
  if (existingReview)
    throw new AppError(
      'You already have a review for this product, you can edit it instead of adding a new review.',
      400,
    );
  const isPurchasedProduct = await Order.findOne({
    user: reviewData.user,
    'orderItems.product': reviewData.product,
  });
  if (!isPurchasedProduct)
    throw new AppError('You can only rate products you have purchased.', 400);
  const review = await Review.create(reviewData);
  return review;
};

exports.updateReview = async (reviewId, reviewData, userId) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('No review found with that Id', 404);
  if (!review.user.equals(userId))
    throw new AppError(
      'You are not allowed to edit this review, you can only edit your own reviews!',
      403,
    );
  review.review = reviewData.review || review.review;
  review.rating = reviewData.rating || review.rating;
  await review.save();
  return review;
};

exports.deleteReview = async (reviewId, user) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('No review found with that Id', 404);
  const isOwner = review.user.equals(user.id);
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin)
    throw new AppError(
      'You are not allowed to delete this review, you can only delete your own reviews!',
      403,
    );
  await review.deleteOne();
  return;
};
