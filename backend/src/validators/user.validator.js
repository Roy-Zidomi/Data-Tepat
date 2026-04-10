const { z } = require('zod');

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  email: z.string().email('Invalid email format').optional().nullable(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().max(30).optional().nullable(),
  role: z.enum(['admin', 'relawan', 'petugas', 'warga']),
  is_active: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150).optional(),
  email: z.string().email('Invalid email format').optional().nullable(),
  username: z.string().min(3).max(100).optional(),
  password: z.string().min(6).optional(), // Only provided if changing
  phone: z.string().max(30).optional().nullable(),
  role: z.enum(['admin', 'relawan', 'petugas', 'warga']).optional(),
  is_active: z.boolean().optional(),
});

const userParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
};
