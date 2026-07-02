const cartService = require('../services/cart.service');
const productService = require('../services/product.service');
const AppError = require('../utils/appError');

exports.getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({
    status: 'success',
    data: cart,
  });
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await productService.getProduct(productId);
  if (quantity > product.stock || product.status === 'sold out')
    throw new AppError(
      'There is not enough stock or the product is sold out.',
      400,
    );
  const cart = await cartService.addToCart(req.user.id, {
    productId,
    quantity,
  });
  res.status(200).json({
    status: 'success',
    data: cart,
  });
};

exports.updateItemQuantity = async (req, res) => {
  const cart = await cartService.updateItemQuantity(
    req.user.id,
    req.params.productId,
    req.body.quantity,
  );
  res.status(200).json({
    status: 'success',
    data: cart,
  });
};

exports.removeItem = async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.productId);
  res.status(200).json({
    status: 'success',
    data: cart,
  });
};

exports.applyCoupon = async (req, res) => {
  const cart = await cartService.applyCoupon(req.user.id, req.body.coupon);
  res.status(200).json({
    status: 'success',
    data: cart,
  });
};
