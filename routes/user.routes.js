const express = require('express');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
// prettier-ignore
const { signupSchema, updateProfileSchema, forgotPasswordSchema, 
  resetPasswordSchema, updatePasswordSchema } = require('../validations/auth.validation');
// prettier-ignore
const { resizeUserPhoto } = require('../middlewares/resizeUserPhoto.middleware');

const router = express.Router();

const loginLimiter = rateLimit({
  max: 5,
  windowMs: 1 * 60 * 1000,
  message: 'Too many login attempts. Please try again after 15 minutes.',
});

router.post('/signup', validate(signupSchema), authController.singup);
router.post('/login', loginLimiter, authController.login);

router.post(
  '/forgotPassword',
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

router.post(
  '/resetPassword/:token',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

router.use(authMiddleware.protect);

router.post(
  '/updatePassword',
  validate(updatePasswordSchema),
  authController.updatePassword,
);
router
  .patch(
    '/updateProfile',
    authController.uploadUserPhoto,
    validate(updateProfileSchema),
    resizeUserPhoto,
    authController.updateProfile,
  )
  .delete('/deleteProfile', authController.deleteProfile);

router.use(authMiddleware.restrictTo('admin'));

router.get('/users', authController.getAllUsers);
router.get('/users/:id', authController.getUser);

module.exports = router;
