const Category = require('../models/category.model');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllCategories = async query => {
  const features = new APIFeatures(Category.find(), query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const categories = await features.query;
  const pagination = await features.getPaginationResult();

  return { categories, pagination };
};

exports.getCategory = async categoryId => {
  const category = await Category.findById(categoryId);
  if (!category)
    throw new AppError('There is no category found with that ID!', 404);
  return category;
};

exports.addCategory = async categoryData => {
  const newCategory = await Category.create(categoryData);
  return newCategory;
};

exports.updateCategory = async (categoryId, categoryData) => {
  const category = await Category.findById(categoryId);
  if (!category)
    throw new AppError('There is no category found with that ID!', 404);
  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    categoryData,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  return { updatedCategory, category };
};

exports.deleteCategory = async (categoryId, categoryData) => {
  const category = await Category.findByIdAndDelete(categoryId, categoryData);
  if (!category)
    throw new AppError('There is no category found with that ID!', 404);
  return null;
};
