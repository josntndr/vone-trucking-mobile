/**
 * Employee Validation Schemas
 * Updated for per-trip compensation and operator-managed accounts
 */

import { z } from 'zod';
import { UserRole } from '../../types';
import { LicenseType, EmploymentStatus, AccountStatus } from '../../types/employee.types';

// Helper to validate and normalize Philippine phone format
const philippinePhoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .trim()
  .transform((val) => val.replace(/[-\s]/g, ''))
  .refine(
    (val) => {
      // Accept formats: 09171234567, +639171234567, 639171234567
      return /^(\+?63|0)?9\d{9}$/.test(val);
    },
    'Enter a valid Philippine mobile number (e.g., 0917 123 4567)'
  )
  .transform((val) => {
    // Normalize to 09XXXXXXXXX format
    const cleaned = val.replace(/^(\+?63|0)?/, '');
    return `0${cleaned}`;
  });

// Date schema
const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine(
    (val) => /^\d{4}-\d{2}-\d{2}$/.test(val),
    'Date must be in YYYY-MM-DD format'
  );

// Username validation
const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .min(4, 'Username must be at least 4 characters')
  .max(30, 'Username must not exceed 30 characters')
  .trim()
  .toLowerCase()
  .refine(
    (val) => /^[a-z0-9_-]+$/.test(val),
    'Username can only contain lowercase letters, numbers, underscores, and hyphens'
  )
  .refine(
    (val) => !['admin', 'root', 'system', 'operator', 'test'].includes(val),
    'This username is reserved'
  );

// Password validation
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .refine(
    (val) => /[A-Z]/.test(val),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (val) => /[a-z]/.test(val),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (val) => /[0-9]/.test(val),
    'Password must contain at least one number'
  );

// Per-trip rate validation
const perTripRateSchema = z
  .union([
    z.number().positive('Per-trip rate must be greater than zero'),
    z.string()
      .min(1, 'Enter a valid per-trip rate')
      .transform((val) => {
        const cleaned = val.replace(/[₱,\s]/g, '');
        const num = parseFloat(cleaned);
        if (isNaN(num) || num <= 0) {
          throw new Error('Enter a valid per-trip rate');
        }
        return num;
      }),
  ])
  .refine(
    (val) => val > 0 && val <= 999999,
    'Per-trip rate must be between ₱1.00 and ₱999,999.00'
  );

// Structured Address Validation
const structuredAddressSchema = z.object({
  // Country (required)
  country: z.string().min(1, 'Select a country'),
  country_code: z.string().min(1, 'Country code is required'),
  
  // Region (required - separate from Province)
  region: z.string().min(1, 'Select a region'),
  region_code: z.string().min(1, 'Region code is required'),
  
  // Province (optional - not required for NCR region code '13')
  province: z.string().optional().or(z.literal('')),
  province_code: z.string().optional().or(z.literal('')),
  
  // City/Municipality (required)
  city: z.string().min(1, 'Select a city or municipality'),
  city_code: z.string().min(1, 'City code is required'),
  
  // Barangay (required)
  barangay: z.string().min(1, 'Select a barangay'),
  barangay_code: z.string().min(1, 'Barangay code is required'),
  
  // Postal Code (required)
  postal_code: z
    .string()
    .min(1, 'Enter a postal code')
    .regex(/^\d{4}$/, 'Postal code must be exactly 4 digits')
    .refine(
      (val) => {
        const code = parseInt(val, 10);
        return code >= 1000 && code <= 9999;
      },
      'Enter a valid postal code'
    ),
  
  // Address Line 1 (required)
  address_line_1: z
    .string()
    .min(1, "Enter the employee's house, street, or subdivision")
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 is too long')
    .trim()
    .refine(
      (val) => val.split(' ').length >= 2,
      'Enter a detailed address (e.g., Block 3 Lot 15, Treelane 3 Subdivision)'
    ),
  
  // Address Line 2 (optional)
  address_line_2: z
    .string()
    .max(200, 'Address line 2 is too long')
    .trim()
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Province is required for all regions except NCR (region code '13')
    if (data.region_code && data.region_code !== '13') {
      return !!(data.province && data.province_code);
    }
    return true;
  },
  {
    message: 'Select a province (required for this region)',
    path: ['province'],
  }
);

// Create Employee Schema
export const employeeSchema = z
  .object({
    // Basic Information (required)
    employee_id: z
      .string()
      .min(1, 'Enter the employee ID')
      .max(20, 'Employee ID is too long')
      .trim()
      .toUpperCase(),

    first_name: z
      .string()
      .min(1, 'Enter the employee\'s first name')
      .max(100, 'First name is too long')
      .trim(),

    last_name: z
      .string()
      .min(1, 'Enter the employee\'s last name')
      .max(100, 'Last name is too long')
      .trim(),

    role: z
      .enum([UserRole.DRIVER, UserRole.PORTER], {
        message: 'Select either Driver or Helper',
      }),

    // Contact Information (required)
    phone: philippinePhoneSchema,

    // Legacy address field (optional for backward compatibility)
    address: z
      .string()
      .optional()
      .or(z.literal('')),

    // Structured Address (required) - Country is always Philippines
    country: z.string().default('Philippines'),
    country_code: z.string().default('PH'),
    region: z.string().min(1, 'Select a region'),
    region_code: z.string().min(1, 'Region code is required'),
    province: z.string().optional().or(z.literal('')),
    province_code: z.string().optional().or(z.literal('')),
    city: z.string().min(1, 'Select a city or municipality'),
    city_code: z.string().min(1, 'City code is required'),
    barangay: z.string().min(1, 'Select a barangay'),
    barangay_code: z.string().min(1, 'Barangay code is required'),
    postal_code: z
      .string()
      .min(1, 'Enter a postal code')
      .regex(/^\d{4}$/, 'Postal code must be exactly 4 digits'),
    address_line_1: z
      .string()
      .min(1, "Enter the employee's house, street, or subdivision")
      .min(5, 'Address line 1 must be at least 5 characters')
      .max(200, 'Address line 1 is too long')
      .trim(),
    address_line_2: z
      .string()
      .max(200, 'Address line 2 is too long')
      .trim()
      .optional()
      .or(z.literal('')),

    // Emergency Contact (required)
    emergency_contact_name: z
      .string()
      .min(1, 'Enter an emergency contact name')
      .max(200, 'Emergency contact name is too long')
      .trim(),

    emergency_contact_relationship: z
      .string()
      .min(1, 'Enter the relationship')
      .max(50, 'Relationship is too long')
      .trim(),

    emergency_contact_phone: philippinePhoneSchema,

    // Employment Details (required)
    hire_date: dateSchema,

    employment_status: z
      .nativeEnum(EmploymentStatus, {
        message: 'Select employment status',
      })
      .default(EmploymentStatus.ACTIVE),

    // Driver-specific fields (conditional)
    license_number: z
      .string()
      .max(50, 'License number is too long')
      .optional()
      .or(z.literal('')),

    license_type: z.nativeEnum(LicenseType).optional(),

    license_restrictions: z
      .string()
      .max(100, 'License restrictions are too long')
      .optional()
      .or(z.literal('')),

    license_expiry: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine(
        (val) => {
          if (!val) return true;
          return /^\d{4}-\d{2}-\d{2}$/.test(val);
        },
        'Date must be in YYYY-MM-DD format'
      ),

    // Compensation (required)
    per_trip_rate: perTripRateSchema,

    // Account Access (required)
    username: usernameSchema,

    temporary_password: passwordSchema,

    confirm_password: z.string().min(1, 'Confirm the password'),

    account_status: z
      .nativeEnum(AccountStatus, {
        message: 'Select account status',
      })
      .default(AccountStatus.ACTIVE),

    require_password_change: z.boolean().default(true),
  })
  .refine(
    (data) => data.temporary_password === data.confirm_password,
    {
      message: 'The passwords do not match',
      path: ['confirm_password'],
    }
  )
  .refine(
    (data) => {
      // Province is required for all regions except NCR (region code '13')
      if (data.region_code && data.region_code !== '13') {
        return !!(data.province && data.province_code);
      }
      return true;
    },
    {
      message: 'Select a province (required for this region)',
      path: ['province'],
    }
  )
  .refine(
    (data) => {
      // If role is DRIVER, license_number and license_expiry are required
      if (data.role === UserRole.DRIVER) {
        return !!(data.license_number && data.license_expiry);
      }
      return true;
    },
    {
      message: 'License number and expiry date are required for drivers',
      path: ['license_number'],
    }
  )
  .refine(
    (data) => {
      // Emergency contact phone must be different from employee phone
      return data.emergency_contact_phone !== data.phone;
    },
    {
      message: 'Emergency contact must use a different phone number',
      path: ['emergency_contact_phone'],
    }
  )
  .refine(
    (data) => {
      // Validate address line 1 has meaningful content (not just spaces/punctuation)
      if (data.address_line_1) {
        const cleaned = data.address_line_1.trim();
        return cleaned.length >= 5 && /[a-zA-Z0-9]/.test(cleaned);
      }
      return true;
    },
    {
      message: 'Enter a valid street address with house or building details',
      path: ['address_line_1'],
    }
  );

export type CreateEmployeeFormData = z.infer<typeof employeeSchema>;

// Update Employee Schema (without account fields)
export const updateEmployeeSchema = z.object({
  id: z.string().uuid('Invalid employee ID'),

  employee_id: z
    .string()
    .min(1, 'Enter the employee ID')
    .max(20, 'Employee ID is too long')
    .trim()
    .toUpperCase()
    .optional(),

  first_name: z
    .string()
    .min(1, 'Enter the employee\'s first name')
    .max(100, 'First name is too long')
    .trim()
    .optional(),

  last_name: z
    .string()
    .min(1, 'Enter the employee\'s last name')
    .max(100, 'Last name is too long')
    .trim()
    .optional(),

  phone: philippinePhoneSchema.optional(),

  // Legacy address field (optional for backward compatibility)
  address: z
    .string()
    .max(500, 'Address is too long')
    .trim()
    .optional()
    .or(z.literal('')),

  // Structured Address (optional for updates) - Country is always Philippines
  country: z.string().default('Philippines').optional(),
  country_code: z.string().default('PH').optional(),
  region: z.string().min(1, 'Select a region').optional(),
  region_code: z.string().optional(),
  province: z.string().optional().or(z.literal('')),
  province_code: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'Select a city or municipality').optional(),
  city_code: z.string().optional(),
  barangay: z.string().min(1, 'Select a barangay').optional(),
  barangay_code: z.string().optional(),
  postal_code: z
    .string()
    .regex(/^\d{4}$/, 'Postal code must be exactly 4 digits')
    .optional()
    .or(z.literal('')),
  address_line_1: z
    .string()
    .min(5, 'Address line 1 must be at least 5 characters')
    .max(200, 'Address line 1 is too long')
    .trim()
    .optional()
    .or(z.literal('')),
  address_line_2: z
    .string()
    .max(200, 'Address line 2 is too long')
    .trim()
    .optional()
    .or(z.literal('')),

  emergency_contact_name: z
    .string()
    .min(1, 'Enter an emergency contact name')
    .max(200, 'Emergency contact name is too long')
    .trim()
    .optional(),

  emergency_contact_relationship: z
    .string()
    .min(1, 'Enter the relationship')
    .max(50, 'Relationship is too long')
    .trim()
    .optional(),

  emergency_contact_phone: philippinePhoneSchema.optional(),

  hire_date: dateSchema.optional(),

  employment_status: z.nativeEnum(EmploymentStatus).optional(),

  license_number: z
    .string()
    .max(50, 'License number is too long')
    .optional()
    .or(z.literal('')),

  license_type: z.nativeEnum(LicenseType).optional(),

  license_restrictions: z
    .string()
    .max(100, 'License restrictions are too long')
    .optional()
    .or(z.literal('')),

  license_expiry: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true;
        return /^\d{4}-\d{2}-\d{2}$/.test(val);
      },
      'Date must be in YYYY-MM-DD format'
    ),

  per_trip_rate: perTripRateSchema.optional(),
});

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;

// Update Employee Account Schema
export const updateEmployeeAccountSchema = z
  .object({
    employee_id: z.string().uuid('Invalid employee ID'),

    username: usernameSchema.optional(),

    temporary_password: passwordSchema.optional(),

    confirm_password: z.string().optional(),

    account_status: z.nativeEnum(AccountStatus).optional(),

    require_password_change: z.boolean().optional(),

    revoke_sessions: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If temporary_password is provided, confirm_password must match
      if (data.temporary_password) {
        return data.temporary_password === data.confirm_password;
      }
      return true;
    },
    {
      message: 'The passwords do not match',
      path: ['confirm_password'],
    }
  );

export type UpdateEmployeeAccountFormData = z.infer<typeof updateEmployeeAccountSchema>;

// Password generation helper
export const generateSecurePassword = (): string => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '!@#$%&*';
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Shuffle
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Validate complete structured address
 * Returns detailed validation errors for each field
 */
export const validateStructuredAddress = async (address: {
  country_code: string;
  region_code: string;
  province_code?: string;
  city_code: string;
  barangay_code: string;
  postal_code: string;
  address_line_1: string;
}): Promise<{ valid: boolean; errors: Record<string, string> }> => {
  const errors: Record<string, string> = {};

  // Validate required fields
  if (!address.country_code) errors.country = 'Select a country';
  if (!address.region_code) errors.region = 'Select a region';
  
  if (!address.city_code) errors.city = 'Select a city or municipality';
  if (!address.barangay_code) errors.barangay = 'Select a barangay';
  if (!address.postal_code) errors.postal_code = 'Enter a postal code';
  if (!address.address_line_1 || address.address_line_1.trim().length < 5) {
    errors.address_line_1 = "Enter the employee's house, street, or subdivision";
  }

  // If basic validation fails, return early
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  // Validate location hierarchy
  const locationService = await import('../../services/location.service');
  const hierarchyResult = await locationService.validateAddress({
    regionCode: address.region_code,
    provinceCode: address.province_code,
    cityCode: address.city_code,
    barangayCode: address.barangay_code,
  });
  
  if (!hierarchyResult.isValid) {
    const hierarchyError = hierarchyResult.errors[0] || 'Invalid address hierarchy';
    // Determine which field caused the error
    if (hierarchyError.toLowerCase().includes('city')) {
      errors.city = hierarchyError;
    } else if (hierarchyError.toLowerCase().includes('barangay')) {
      errors.barangay = hierarchyError;
    } else if (hierarchyError.toLowerCase().includes('province')) {
      errors.province = hierarchyError;
    } else {
      errors.barangay = hierarchyError;
    }
  }

  // Validate postal code
  const postalValid = locationService.validatePostalCode(
    address.postal_code,
    address.country_code || 'PH'
  );
  
  if (!postalValid) {
    errors.postal_code = 'Enter a valid 4-digit Philippine postal code';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
