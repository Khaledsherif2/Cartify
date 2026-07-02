const fs = require('fs').promises;
const path = require('path');
const categoriesSerivce = require('../services/category.service');
const { filterObj } = require('../utils/filterObj');
const { upload } = require('../utils/uploadImages');
const AppError = require('../utils/appError');

exports.getAllCategories = async (req, res) => {
  const categories = await categoriesSerivce.getAllCategories();
  return res.status(200).json({
    status: 'success',
    data: categories,
  });
};

exports.getCategory = async (req, res) => {
  const category = await categoriesSerivce.getCategory(req.params.id);
  return res.status(200).json({
    status: 'success',
    data: category,
  });
};

exports.addCategory = async (req, res) => {
  const data = filterObj(req.body, 'name', 'image');
  const category = await categoriesSerivce.addCategory(data);

  if (req.processedImage) {
    const uploadPath = path.join(__dirname, '../public/img/categories');
    const { filename, buffer } = req.processedImage;
    await fs.writeFile(`${uploadPath}/${filename}`, buffer);
    if (category.image) {
      await fs.unlink(`${uploadPath}/${category.image}`).catch(() => {});
    }
  }
  return res.status(201).json({
    status: 'success',
    data: category,
  });
};

exports.updateCategory = async (req, res) => {
  if (Object.keys(req.body).length === 0)
    throw new AppError('Please provide us the data you wish to update', 400);

  const data = filterObj(req.body, 'name', 'iamge');
  if (req.file) data.image = req.file.filename;

  const result = await categoriesSerivce.updateCategory(req.params.id, data);

  if (req.processedImage) {
    const uploadPath = path.join(__dirname, '../public/img/categories');
    const { filename, buffer } = req.processedImage;
    await fs.writeFile(`${uploadPath}/${filename}`, buffer);
    if (result.category.image) {
      await fs.unlink(`${uploadPath}/${result.category.image}`).catch(() => {});
    }
  }

  return res.status(200).json({
    status: 'success',
    data: result.updatedCategory,
  });
};

exports.deleteCategory = async (req, res) => {
  const category = await categoriesSerivce.deleteCategory(req.params.id);
  return res.status(204).json({ status: 'success', data: category });
};

exports.uploadCategoryImage = upload.single('image');
