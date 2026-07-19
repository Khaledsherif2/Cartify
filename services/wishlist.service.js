const User = require('../models/user.model');
const Product = require('../models/product.model');
const AppError = require('../utils/appError');

exports.getWishlist = async (userId, query) => {
  const page = query.page * 1 || 1;
  const limit = query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId).select('wishlist -_id').populate({
    path: 'wishlist',
    select: 'title price imageCover',
  });

  if (!user) throw new AppError('User not found', 404);

  const totalDocuments = user.wishlist.length;
  const paginatedWishlist = user.wishlist.slice(skip, skip + limit);

  return {
    wishlist: paginatedWishlist,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalDocuments / limit),
      limit,
      totalResults: totalDocuments,
    },
  };
};

// prettier-ignore
const updateWishlistField = async (userId, productId, operator, checkProduct = false) => {
  if (checkProduct) {
    const product = await Product.findById(productId);
    if (!product) throw new AppError ('There is no product found with that ID!', 404);
  };
  const updatedWishlist = await User.findByIdAndUpdate(
    userId,
    { [operator]: { wishlist: productId } },
    { returnDocument: 'after', runValidators: true },
  ).select('wishlist -_id');
  if (!updatedWishlist) throw new AppError('User not found', 404);
  return updatedWishlist;
};

exports.addToWishlist = async (userId, productId) =>
  updateWishlistField(userId, productId, '$addToSet', true);

exports.removeFromWishlist = async (userId, productId) =>
  updateWishlistField(userId, productId, '$pull');
