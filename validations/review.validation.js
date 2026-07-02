const { z } = require('zod');

exports.createReviewSchema = z.object({
  review: z
    .string({ required_error: 'There must be at least one product' })
    .min(3, 'Review can not be empty at least more than 3 character'),
  rating: z.number().min(1).max(5),
  product: z
    .string({ required_error: 'Review must belong to a product' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')
    .optional(),
});

exports.updateReviewSchema = this.createReviewSchema.pick({
  review: true,
  rating: true,
});
