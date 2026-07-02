const Cart = require('../models/cart.model');
const User = require('../models/user.model');
const Coupon = require('../models/coupon.model');
const AppError = require('../utils/appError');

exports.getCart = async userId => {
  const cart = await Cart.findOne({ user: userId }).populate(
    'items.productId',
    'title price',
  );
  if (!cart) throw new AppError('There is no cart belong to this user');
  if (cart && cart.appliedCoupon) {
    const coupon = await Coupon.findOne({ name: cart.appliedCoupon });
    if (coupon) {
      cart._couponDiscount = coupon.discount;
      cart._couponType = coupon.type;
    }
  }
  return cart;
};

exports.addToCart = async (userId, cartData) => {
  const { productId, quantity } = cartData;
  let cart = await Cart.findOneAndUpdate(
    { user: userId, 'items.productId': productId },
    { $inc: { 'items.$.quantity': quantity } },
    { returnDocument: 'after' },
  );
  if (!cart) {
    cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $push: { items: { productId, quantity } } },
      {
        returnDocument: 'after',
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );
  }
  return cart;
};

exports.updateItemQuantity = async (userId, ...itemData) => {
  const [productId, newQuantity] = itemData;

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const targetItem = cart.items.find(
    item => item.productId.toString() === productId,
  );

  if (!targetItem) throw new AppError('Product not found in cart', 404);

  const direction = Math.sign(newQuantity - targetItem.quantity);
  const finalExpectedQuantity = targetItem.quantity + direction;
  const isRemoving = finalExpectedQuantity <= 0 || newQuantity === 0;

  if (isRemoving) {
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId,
    );
  } else {
    targetItem.quantity += direction;
  }

  await cart.save();
  return cart;
};

exports.removeItem = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  const itemExists = cart.items.some(
    item => item.productId.toString() === productId,
  );
  if (!itemExists) throw new AppError('Product not found in cart', 404);

  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId,
  );

  await cart.save();
  return cart;
};

exports.applyCoupon = async (userId, couponName) => {
  const coupon = await Coupon.findOne({
    name: couponName,
    expireAt: { $gt: new Date() },
  });
  if (!coupon) throw new AppError('Coupon is invalid or has expired!', 404);

  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new AppError('Cart not found', 404);

  cart.appliedCoupon = couponName;
  await cart.save();

  return cart;
};
