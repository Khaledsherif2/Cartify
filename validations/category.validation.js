const { z } = require('zod');

exports.addCategorySchema = z.object({
  name: z.string({ required_error: 'Category must have a name!' }),
  image: z.string().optional(),
});

exports.updateCategorySchema = this.addCategorySchema.partial();
