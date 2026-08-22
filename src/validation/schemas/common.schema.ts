/**
 * Common Validation Schemas
 * Reusable schemas for common fields
 */

import { z } from 'zod';

/**
 * Phone number schema
 */
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');

/**
 * Optional phone schema
 */
export const optionalPhoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

/**
 * URL schema
 */
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''));

/**
 * Date schema
 */
export const dateSchema = z.coerce.date().refine((date) => date !== null && date !== undefined, {
  message: 'Date is required',
});

/**
 * Optional date schema
 */
export const optionalDateSchema = z.coerce.date().optional();

/**
 * Positive number schema
 */
export const positiveNumberSchema = z
  .number()
  .refine((val) => val !== undefined && val !== null, {
    message: 'This field is required',
  })
  .positive('Value must be positive');

/**
 * Non-negative number schema
 */
export const nonNegativeNumberSchema = z
  .number()
  .refine((val) => val !== undefined && val !== null, {
    message: 'This field is required',
  })
  .nonnegative('Value cannot be negative');

/**
 * Text field schema (required)
 */
export const textFieldSchema = (fieldName: string, minLength: number = 1) =>
  z
    .string()
    .min(minLength, `${fieldName} is required`)
    .trim();

/**
 * Optional text field schema
 */
export const optionalTextFieldSchema = z.string().trim().optional().or(z.literal(''));

/**
 * License plate schema
 */
export const licensePlateSchema = z
  .string()
  .min(1, 'License plate is required')
  .regex(/^[A-Z0-9\-]+$/i, 'Please enter a valid license plate')
  .toUpperCase()
  .trim();

/**
 * VIN schema (Vehicle Identification Number)
 */
export const vinSchema = z
  .string()
  .min(17, 'VIN must be 17 characters')
  .max(17, 'VIN must be 17 characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Please enter a valid VIN')
  .toUpperCase()
  .trim();

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(2, 'State is required').trim(),
  zipCode: z
    .string()
    .min(5, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  country: z.string().default('USA'),
});

export type Address = z.infer<typeof addressSchema>;
