const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name is too short'],
      maxlength: [50, 'Category name is too long'],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ name: 'text' });

categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
