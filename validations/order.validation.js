const { z } = require('zod');

const shippingAddressSchema = z.object({
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City name is too short'),
  street: z.string({ required_error: 'Street is required' }).trim(),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^01[0125][0-9]{8}$/, 'Please provide a valid phone number'),
});

exports.createOrderSchema = z.object({
  user: z
    .string({
      required_error: 'Order must belong to a user!',
    })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid User ID')
    .optional(),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['cash on delivery', 'paymob'], {
    required_error: 'Please specify a payment method',
    invalid_type_error: 'Invalid payment method selected',
  }),
});

exports.updateOrderStatusSchema = z.object({
  // prettier-ignore
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  isPaid: z.boolean().optional(),
  paidAt: z.string().date().optional(),
  isDelivered: z.boolean().optional(),
  deliveredAt: z.string().date().optional(),
});
