const { z } = require('zod');

exports.addCouponSchema = z.object({
  name: z.string({ required_error: 'Coupon must have a name!' }),
  discount: z.number({ required_error: 'Coupon must have a discount value' }),
  type: z.enum(['percentage', 'fixed']),
  expireAt: z.coerce
    .date()
    .default(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
});

exports.updateCouponSchema = this.addCouponSchema.partial();
