const crypto = require('crypto');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const signToken = require('../utils/jwt');
const APIFeatures = require('../utils/apiFeatures');

exports.signup = async userData => {
  const newUser = await User.create(userData);
  return newUser;
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePasswords(password, user.password)))
    throw new AppError('Invaild email or password', 401);
  const token = signToken(user._id);
  return { user, token };
};

exports.forgotPassword = async userEmail => {
  const user = await User.findOne({ email: userEmail }).select('+password');
  if (!user) throw new AppError('No user found with that Email', 404);
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  return { resetToken, user };
};

exports.clearResetToken = async user => {
  if (!user) return;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
};

exports.resetPassword = async (token, userData) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Token is invaild or has expired', 400);
  user.password = userData.password;
  ((user.passwordConfirm = userData.passwordConfirm),
    (user.passwordResetToken = undefined));
  user.passwordResetExpires = undefined;
  await user.save();
  const newToken = signToken(user._id);
  return { user, newToken };
};

exports.updatePassword = async (userId, userData) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePasswords(userData.passwordCurrent, user.password)))
    throw new AppError('Your current password is not correct!', 400);
  user.password = userData.password;
  user.passwordConfirm = userData.passwordConfirm;
  await user.save();
  const newToken = signToken(user._id);
  return { newToken, user };
};

exports.getAllUsers = async query => {
  const features = new APIFeatures(User.find(), query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const pagination = await features.getPaginationResult();

  return { users, pagination };
};

exports.getUser = async userId => {
  const user = await User.findById(userId);
  return user;
};

exports.updateProfile = async (userId, userData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('No user found with that ID', 404);
  const updatedUser = await User.findByIdAndUpdate(userId, userData, {
    returnDocument: 'after',
    runValidators: true,
  });
  return { updatedUser, user };
};

exports.deleteProfile = async userId => {
  const user = await User.findByIdAndUpdate(userId, { active: false });
  if (!user) throw new AppError('No user found with that ID', 404);
  return null;
};
