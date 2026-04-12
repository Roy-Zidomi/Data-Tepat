const { z } = require('zod');

const VALID_ROLES = ['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga'];

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  email: z.string().email('Invalid email format').optional().nullable(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  role: z.enum(VALID_ROLES, { errorMap: () => ({ message: `Role must be one of: ${VALID_ROLES.join(', ')}` }) }),
  is_active: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150).optional(),
  email: z.string().email('Invalid email format').optional().nullable(),
  username: z.string().min(3).max(100).optional(),
  phone: z.string().max(30).optional().nullable(),
  role: z.enum(VALID_ROLES).optional(),
  is_active: z.boolean().optional(),
});

const userParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

const toggleActiveSchema = z.object({
  is_active: z.boolean({ required_error: 'is_active is required' }),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
  toggleActiveSchema,
  VALID_ROLES,
};

