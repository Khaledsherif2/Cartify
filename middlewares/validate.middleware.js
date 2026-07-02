const AppError = require('../utils/appError');

module.exports = schema => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues.map(err => {
      const fieldName = err.path.join('.');
      return `${fieldName}: ${err.message}`;
    });
    return next(new AppError(message.join(' | '), 400));
  }
  req.body = result.data;
  next();
};
