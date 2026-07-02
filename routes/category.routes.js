const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const categoriesController = require('../controllers/category.controller');
const validate = require('../middlewares/validate.middleware');
const {
  addCategorySchema,
  updateCategorySchema,
} = require('../validations/category.validation');
const {
  resizeCategoryImage,
} = require('../middlewares/resizeCategoryImage.middleware');

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(categoriesController.getAllCategories)
  .post(
    authMiddleware.restrictTo('admin'),
    categoriesController.uploadCategoryImage,
    validate(addCategorySchema),
    resizeCategoryImage,
    categoriesController.addCategory,
  );

router.use(authMiddleware.restrictTo('admin'));

router
  .route('/:id')
  .get(categoriesController.getCategory)
  .patch(
    categoriesController.uploadCategoryImage,
    validate(updateCategorySchema),
    resizeCategoryImage,
    categoriesController.updateCategory,
  )
  .delete(categoriesController.deleteCategory);

module.exports = router;
