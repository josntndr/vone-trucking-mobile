/**
 * Employee validation schemas
 */

import { z } from 'zod';
import { UserRole } from '../../types';
import { EmploymentStatus, LicenseType } from '../../types/employee.types';
import { isValidPhilippinePhone, isValidLicenseNumber } from '../../utils/philippines';
import { emailSchema } from './auth.schema';

export const employeeSchema = z.object({
  employee_id: z
    .string()
    .min(1, 'Employee number is required')
    .max(20, 'Employee number is too long')
    .trim(),
  
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .trim(),
  
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .trim(),
  
  role: z.nativeEnum(UserRole, {
    message: 'Invalid role',
  }),
  
  email: emailSchema,
  
  phone: z
    .string()
    .refine(
      (val) => !val || isValidPhilippinePhone(val),
      'Invalid Philippine phone number'
    )
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .max(200, 'Address is too long')
    .optional()
    .or(z.literal('')),
  
  emergency_contact_name: z
    .string()
    .max(100, 'Emergency contact name is too long')
    .optional()
    .or(z.literal('')),
  
  emergency_contact_phone: z
    .string()
    .refine(
      (val) => !val || isValidPhilippinePhone(val),
      'Invalid Philippine phone number'
    )
    .optional()
    .or(z.literal('')),
  
  hire_date: z
    .string()
    .optional()
    .or(z.literal('')),
  
  employment_status: z
    .nativeEnum(EmploymentStatus)
    .optional()
    .default(EmploymentStatus.ACTIVE),
  
  // Driver-specific fields
  license_number: z
    .string()
    .refine(
      (val) => !val || isValidLicenseNumber(val),
      'Invalid license number format'
    )
    .optional()
    .or(z.literal('')),
  
  license_type: z
    .nativeEnum(LicenseType)
    .optional(),
  
  license_restrictions: z
    .string()
    .max(100, 'License restrictions text is too long')
    .optional()
    .or(z.literal('')),
  
  license_expiry: z
    .string()
    .optional()
    .or(z.literal('')),
  
  // Compensation
  base_salary: z
    .number()
    .nonnegative('Base salary cannot be negative')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),
  
  daily_rate: z
    .number()
    .nonnegative('Daily rate cannot be negative')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),
  
  trip_rate: z
    .number()
    .nonnegative('Trip rate cannot be negative')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),
}).refine(
  (data) => {
    // If role is driver, license number is required
    if (data.role === UserRole.DRIVER && !data.license_number) {
      return false;
    }
    return true;
  },
  {
    message: 'License number is required for drivers',
    path: ['license_number'],
  }
);

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const employeeSearchSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  employment_status: z.nativeEnum(EmploymentStatus).optional(),
  is_active: z.boolean().optional(),
});

export type EmployeeSearchData = z.infer<typeof employeeSearchSchema>;
