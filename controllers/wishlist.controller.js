const wishlistService = require('../services/wishlist.service');
const productService = require('../services/product.service');
const AppError = require('../utils/appError');

exports.getWishlist = async (req, res) => {
  const { wishlist } = await wishlistService.getWishlist(req.user.id);
  res.status(200).json({
    status: 'success',
    results: wishlist.length,
    data: wishlist,
  });
};

exports.addToWishlist = async (req, res) => {
  const { wishlist } = await wishlistService.addToWishlist(
    req.user.id,
    req.params.productId,
  );
  res.status(200).json({
    status: 'success',
    data: wishlist,
  });
};

exports.removeFromWishlist = async (req, res) => {
  const wishlist = await wishlistService.removeFromWishlist(
    req.user.id,
    req.params.productId,
  );
  res.status(200).json({
    status: 'success',
    data: wishlist,
  });
};
