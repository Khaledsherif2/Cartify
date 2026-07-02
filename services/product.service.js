const Product = require('../models/product.model');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllProducts = async query => {
  const features = new APIFeatures(Product.find({ status: 'active' }), query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  return products;
};

exports.getProduct = async productId => {
  const product = await Product.findById(productId).populate('reviews');
  if (!product) throw new AppError('No product found with that ID', 404);
  return product;
};

exports.createProduct = async productData => {
  const newProduct = await Product.create(productData);
  return newProduct;
};

exports.updateProduct = async (productId, productData) => {
  const product = await Product.findById(productId);
  if (!product) throw new AppError('No product found with that ID', 404);
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    productData,
    {
      returnDocument: 'after',
      runValidators: true,
    },
  );
  return { updatedProduct, product };
};

exports.deleteProduct = async productId => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { status: 'disabled' },
    {
      returnDocument: 'after',
    },
  );
  if (!product) throw new AppError('No product found with that ID', 404);
  return null;
};
