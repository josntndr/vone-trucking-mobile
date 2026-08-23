/**
 * Employee Validation Schemas
 */

import { z } from 'zod';
import { UserRole } from '../../types';
import { LicenseType, EmploymentStatus } from '../../types/employee.types';

// Helper to validate Philippine phone format
const phoneSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val) return true;
      // Accept formats: 09171234567, +639171234567, 0917-123-4567
      return /^(\+63|0)?9\d{9}$/.test(val.replace(/[-\s]/g, ''));
    },
    'Invalid Philippine phone number format'
  );

// Date schema
const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine(
    (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
    'Date must be in YYYY-MM-DD format'
  );

// Create Employee Schema
export const employeeSchema = z.object({
  employee_id: z
    .string()
    .min(1, 'Employee ID is required')
    .max(20, 'Employee ID is too long')
    .trim(),

  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long')
    .trim(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long')
    .trim(),

  role: z.nativeEnum(UserRole, {
    message: 'Invalid role',
  }),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  phone: phoneSchema,

  address: z
    .string()
    .max(500, 'Address is too long')
    .optional()
    .or(z.literal('')),

  emergency_contact_name: z
    .string()
    .max(200, 'Emergency contact name is too long')
    .optional()
    .or(z.literal('')),

  emergency_contact_phone: phoneSchema,

  hire_date: dateSchema.optional().or(z.literal('')),

  employment_status: z
    .nativeEnum(EmploymentStatus)
    .optional()
    .default(EmploymentStatus.ACTIVE),

  // Driver-specific fields
  license_number: z
    .string()
    .max(50, 'License number is too long')
    .optional()
    .or(z.literal('')),

  license_type: z
    .nativeEnum(LicenseType)
    .optional(),

  license_restrictions: z
    .string()
    .max(100, 'License restrictions are too long')
    .optional()
    .or(z.literal('')),

  license_expiry: dateSchema.optional().or(z.literal('')),

  // Compensation
  base_salary: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      }),
    ])
    .pipe(z.number().nonnegative('Base salary must be non-negative').optional())
    .optional(),

  daily_rate: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      }),
    ])
    .pipe(z.number().nonnegative('Daily rate must be non-negative').optional())
    .optional(),

  trip_rate: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      }),
    ])
    .pipe(z.number().nonnegative('Trip rate must be non-negative').optional())
    .optional(),
}).refine(
  (data) => {
    // If role is DRIVER, license_number and license_expiry should be provided
    if (data.role === UserRole.DRIVER) {
      return !!(data.license_number && data.license_expiry);
    }
    return true;
  },
  {
    message: 'License number and expiry date are required for drivers',
    path: ['license_number'],
  }
);

export type CreateEmployeeFormData = z.infer<typeof employeeSchema>;

// Update Employee Schema - define separately without refinement, then add optional refinement
const baseUpdateEmployeeSchema = z.object({
  id: z.string().uuid('Invalid employee ID'),
  employee_id: z
    .string()
    .min(1, 'Employee ID is required')
    .max(20, 'Employee ID is too long')
    .trim()
    .optional(),

  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name is too long')
    .trim()
    .optional(),

  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name is too long')
    .trim()
    .optional(),

  role: z.nativeEnum(UserRole, {
    message: 'Invalid role',
  }).optional(),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional(),

  phone: phoneSchema,

  address: z
    .string()
    .max(500, 'Address is too long')
    .optional()
    .or(z.literal('')),

  emergency_contact_name: z
    .string()
    .max(200, 'Emergency contact name is too long')
    .optional()
    .or(z.literal('')),

  emergency_contact_phone: phoneSchema,

  hire_date: dateSchema.optional().or(z.literal('')),

  employment_status: z
    .nativeEnum(EmploymentStatus)
    .optional(),

  license_number: z
    .string()
    .max(50, 'License number is too long')
    .optional()
    .or(z.literal('')),

  license_type: z
    .nativeEnum(LicenseType)
    .optional(),

  license_restrictions: z
    .string()
    .max(100, 'License restrictions are too long')
    .optional()
    .or(z.literal('')),

  license_expiry: dateSchema.optional().or(z.literal('')),

  base_salary: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      }),
    ])
    .pipe(z.number().nonnegative('Base salary must be non-negative').optional())
    .optional(),

  daily_rate: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      }),
    ])
    .pipe(z.number().nonnegative('Daily rate must be non-negative').optional())
    .optional(),

  trip_rate: z
    .union([
      z.number(),
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      }),
    ])
    .pipe(z.number().nonnegative('Trip rate must be non-negative').optional())
    .optional(),
});

export const updateEmployeeSchema = baseUpdateEmployeeSchema;

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
