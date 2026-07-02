const mongoose = require('mongoose');
const Review = require('./review.model');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A product msut have a title'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A product title must have less or equal than 40 characters',
      ],
      minlength: [
        5,
        'A product title must have more or equal than 5 characters',
      ],
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A product must have a description'],
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price'],
      min: [1, 'A price must be above 1.0'],
    },
    category: {
      type: String,
      required: [true, 'A product must belong to a category'],
    },
    ratingsAverage: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    imageCover: {
      type: String,
      required: [true, 'A product must have a cover image'],
    },
    images: [String],
    stock: {
      type: Number,
      required: [true, 'There must be at least one product'],
    },
    sold: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'disabled', 'sold out'],
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.index({
  title: 'text',
  description: 'text',
});

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
