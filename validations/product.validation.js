const { z } = require('zod');

exports.createProductSchema = z.object({
  title: z
    .string({ required_error: 'A product must have a title' })
    .min(5, 'Name must be at least 5 characters')
    .max(40, 'Name must be less than or equal to 40 characters'),
  description: z.string({
    required_error: 'A product must have a description',
  }),
  price: z.coerce
    .number({ required_error: 'A product must have a price' })
    .positive('A price must be above 0'),
  category: z.string({ required_error: 'A product must belong to a category' }),
  imageCover: z.string({ required_error: 'A product must have a cover image' }),
  images: z.array(z.string()).optional(),
  stock: z.coerce.number({
    required_error: 'There must be at least one product',
  }),
});

exports.updateProductSchema = this.createProductSchema.partial();
