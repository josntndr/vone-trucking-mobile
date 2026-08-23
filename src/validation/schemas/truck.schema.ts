/**
 * Truck validation schemas
 */

import { z } from 'zod';
import { TruckStatus, FuelType } from '../../types/truck.types';
import { isValidPlateNumber } from '../../utils/philippines';

const currentYear = new Date().getFullYear();

export const truckSchema = z.object({
  truck_number: z
    .string()
    .min(1, 'Truck number is required')
    .max(20, 'Truck number is too long')
    .trim(),
  
  license_plate: z
    .string()
    .min(1, 'Plate number is required')
    .refine(
      (val) => isValidPlateNumber(val),
      'Invalid plate number format (e.g., ABC-1234)'
    )
    .transform((val) => val.toUpperCase()),
  
  make: z
    .string()
    .min(1, 'Make is required')
    .max(50, 'Make is too long')
    .trim(),
  
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model is too long')
    .trim(),
  
  year: z
    .union([
      z.number(),
      z.string().transform((val) => {
        const num = parseInt(val, 10);
        if (isNaN(num)) throw new Error('Invalid year');
        return num;
      }),
    ])
    .pipe(
      z
        .number()
        .int('Year must be a whole number')
        .min(1900, 'Year must be 1900 or later')
        .max(currentYear + 1, `Year cannot be later than ${currentYear + 1}`)
    ),
  
  truck_type: z
    .string()
    .max(50, 'Truck type is too long')
    .optional(),
  
  capacity_kg: z
    .union([
      z.number(),
      z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) throw new Error('Capacity must be a positive number');
        return num;
      }),
    ])
    .pipe(z.number().positive('Capacity must be positive')),
  
  fuel_type: z.nativeEnum(FuelType, {
    message: 'Invalid fuel type',
  }),
  
  avg_km_per_liter: z
    .number()
    .positive('Fuel efficiency must be positive')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),
  
  current_odometer: z
    .number()
    .nonnegative('Odometer cannot be negative')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),
  
  vin: z
    .string()
    .max(17, 'VIN is too long')
    .optional()
    .or(z.literal('')),
  
  or_number: z
    .string()
    .max(50, 'OR number is too long')
    .optional()
    .or(z.literal('')),
  
  cr_number: z
    .string()
    .max(50, 'CR number is too long')
    .optional()
    .or(z.literal('')),
  
  or_expiry: z
    .string()
    .optional()
    .or(z.literal('')),
  
  cr_expiry: z
    .string()
    .optional()
    .or(z.literal('')),
  
  insurance_provider: z
    .string()
    .max(100, 'Insurance provider name is too long')
    .optional()
    .or(z.literal('')),
  
  insurance_policy_number: z
    .string()
    .max(50, 'Policy number is too long')
    .optional()
    .or(z.literal('')),
  
  insurance_expiry: z
    .string()
    .optional()
    .or(z.literal('')),
  
  status: z
    .nativeEnum(TruckStatus)
    .optional()
    .default(TruckStatus.AVAILABLE),
  
  purchase_date: z
    .string()
    .optional()
    .or(z.literal('')),
  
  notes: z
    .string()
    .max(1000, 'Notes are too long')
    .optional()
    .or(z.literal('')),
});

export type TruckFormData = z.infer<typeof truckSchema>;

export const truckSearchSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TruckStatus).optional(),
  is_active: z.boolean().optional(),
});

export type TruckSearchData = z.infer<typeof truckSearchSchema>;
