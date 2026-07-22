const fs = require('fs').promises;
const path = require('path');
const authService = require('../services/auth.service');
const { filterObj } = require('../utils/filterObj');
const AppError = require('../utils/appError');
const { upload } = require('../utils/uploadImages');
const Email = require('./../utils/email');

exports.singup = async (req, res) => {
  const user = filterObj(
    req.body,
    'name',
    'email',
    'password',
    'passwordConfirm',
  );
  const newUser = await authService.signup(user);
  const url = `${req.protocol}://${req.get('host')}/profile`;
  await new Email(newUser, url).sendWelcome();
  res.status(201).json({
    status: 'success',
    data: newUser,
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new AppError('Please provide email and password!', 400);
  const data = await authService.login(email, password);
  res.status(200).json({
    status: 'success',
    token: data.token,
    data: data.user,
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError('Please provide your email', 400);
  const { resetToken, user } = await authService.forgotPassword(email);
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    await authService.clearResetToken(user);
    throw new AppError(
      'There was an error sending the email. Try again later!',
      500,
    );
  }
};

exports.resetPassword = async (req, res) => {
  const resetToken = req.params.token;
  const data = await authService.resetPassword(resetToken, req.body);
  res.status(200).json({
    status: 'success',
    token: data.newToken,
    data: data.user,
  });
};

exports.updatePassword = async (req, res) => {
  const data = await authService.updatePassword(req.user.id, req.body);
  res.status(200).json({
    status: 'success',
    token: data.newToken,
    data: data.user,
  });
};

exports.getAllUsers = async (req, res) => {
  const { users, pagination } = await authService.getAllUsers(req.query);
  res.status(200).json({
    status: 'success',
    pagination,
    data: users,
  });
};

exports.getUser = async (req, res) => {
  const user = await authService.getUser(req.params.id);
  res.status(200).json({
    status: 'success',
    data: user,
  });
};

exports.updateProfile = async (req, res) => {
  if (req.body.password || req.body.passwordConfirm)
    throw new AppError(
      'This route is not for password updates. Please use /updatePassword',
      400,
    );
  if (Object.keys(req.body).length === 0 && !req.file)
    throw new AppError('Please provide us the data you wish to update', 400);

  const data = filterObj(req.body, 'name', 'email');
  const uploadPath = path.join(__dirname, '../public/img/users');

  if (req.processedImage) {
    const { filename, buffer } = req.processedImage;
    await fs.writeFile(`${uploadPath}/${filename}`, buffer);
    data.photo = filename;
  }

  const result = await authService.updateProfile(req.user.id, data);

  if (
    req.processedImage &&
    result.user.photo &&
    result.user.photo !== 'default.jpg'
  ) {
    await fs.unlink(`${uploadPath}/${result.user.photo}`).catch(() => {});
  }

  res.status(200).json({
    status: 'success',
    data: result.updatedUser,
  });
};

exports.deleteProfile = async (req, res) => {
  const user = await authService.deleteProfile(req.user.id);
  res.status(204).json({
    status: 'success',
    data: user,
  });
};

exports.uploadUserPhoto = upload.single('photo');
