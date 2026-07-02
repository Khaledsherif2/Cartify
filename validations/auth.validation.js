const { z } = require('zod');

const baseUserSchema = z.object({
  name: z
    .string({ required_error: 'Please tell us your name!' })
    .min(3, 'Name must be at least 3 characters'),
  email: z
    .string({ required_error: 'Please provide your email!' })
    .email('Invalid Email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirm: z.string().min(1, 'Please Confirm your password'),
  photo: z.string().optional(),
});

exports.signupSchema = baseUserSchema.refine(
  data => data.password === data.passwordConfirm,
  {
    error: "Passwords don't match",
    path: ['passwordConfirm'],
  },
);

exports.updateProfileSchema = baseUserSchema.partial();
exports.forgotPasswordSchema = baseUserSchema.pick({ email: true });
exports.resetPasswordSchema = baseUserSchema
  .pick({
    password: true,
    passwordConfirm: true,
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });

exports.updatePasswordSchema = baseUserSchema
  .pick({
    password: true,
    passwordConfirm: true,
  })
  .extend({
    passwordCurrent: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password === data.passwordConfirm, {
    message: "Passwords don't match",
    path: ['passwordConfirm'],
  });
