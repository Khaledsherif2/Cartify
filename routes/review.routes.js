const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const reviewController = require('../controllers/review.controller');
const validate = require('../middlewares/validate.middleware');
const { createReviewSchema } = require('../validations/review.validation');

const router = express.Router({ mergeParams: true });

router.use(authMiddleware.protect);

router
  .route('/')
  .get(authMiddleware.restrictTo('admin'), reviewController.getAllReviews)
  .post(
    authMiddleware.restrictTo('user'),
    validate(createReviewSchema),
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(authMiddleware.restrictTo('admin'), reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
