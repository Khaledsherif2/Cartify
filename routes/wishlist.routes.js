const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const wishlistController = require('../controllers/wishlist.controller');

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo('user'));

router.get('/', wishlistController.getWishlist);
router
  .route('/:productId')
  .post(wishlistController.addToWishlist)
  .delete(wishlistController.removeFromWishlist);

module.exports = router;
