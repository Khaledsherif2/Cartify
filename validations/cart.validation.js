const { z } = require('zod');

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectID = z
  .string({ required_error: 'Cart must contain at least one product!' })
  .regex(objectIdRegex, 'Invalid MongoDB ObjectId');

const cartItemSchema = z.object({
  productId: objectID,
  quantity: z
    .number({
      required_error: 'Quantity is required',
    })
    .int('Quantity must be an integer')
    .min(1, 'Quantity cannot be less than 1.'),
  addedAt: z.date().optional(),
});

exports.cartSchema = z.object({
  user: objectID.optional(),
  items: z.array(cartItemSchema),
  appliedCoupon: z.string().optional(),
});
