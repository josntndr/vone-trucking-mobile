/**
 * Trip Validation Schemas
 */

import { z } from 'zod';
import { TripStatus } from '../../types/trip.types';

// Helper to validate time format (HH:MM)
const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (e.g., 14:30)');

// Helper to validate date format (YYYY-MM-DD or MM/DD/YYYY)
const dateSchema = z
  .string()
  .min(1, 'Date is required')
  .refine(
    (val) => {
      // Accept YYYY-MM-DD or MM/DD/YYYY
      return /^\d{4}-\d{2}-\d{2}$/.test(val) || /^\d{2}\/\d{2}\/\d{4}$/.test(val);
    },
    'Invalid date format'
  );

// Create Trip Schema
export const createTripSchema = z.object({
  delivery_reference: z
    .string()
    .min(1, 'Delivery reference is required')
    .max(50, 'Delivery reference is too long')
    .trim(),

  delivery_date: dateSchema,

  call_time: timeSchema,

  pickup_warehouse: z
    .string()
    .min(1, 'Pickup warehouse is required')
    .max(200, 'Pickup warehouse name is too long')
    .trim(),

  pickup_address: z
    .string()
    .max(500, 'Pickup address is too long')
    .optional()
    .or(z.literal('')),

  delivery_destination: z
    .string()
    .min(1, 'Delivery destination is required')
    .max(200, 'Delivery destination is too long')
    .trim(),

  delivery_address: z
    .string()
    .min(1, 'Delivery address is required')
    .max(500, 'Delivery address is too long')
    .trim(),

  store_branch_name: z
    .string()
    .max(200, 'Store/branch name is too long')
    .optional()
    .or(z.literal('')),

  cargo_description: z
    .string()
    .min(1, 'Cargo description is required')
    .max(1000, 'Cargo description is too long')
    .trim(),

  cargo_weight_kg: z
    .number()
    .positive('Cargo weight must be positive')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),

  cargo_volume_cbm: z
    .number()
    .positive('Cargo volume must be positive')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),

  number_of_items: z
    .number()
    .int('Number of items must be a whole number')
    .positive('Number of items must be positive')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseInt(val, 10);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),

  estimated_duration_hours: z
    .number()
    .positive('Duration must be positive')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),

  expected_income: z
    .number()
    .nonnegative('Expected income cannot be negative')
    .optional()
    .or(
      z.string().transform((val) => {
        if (!val) return undefined;
        const num = parseFloat(val);
        if (isNaN(num)) return undefined;
        return num;
      })
    ),

  special_instructions: z
    .string()
    .max(2000, 'Special instructions are too long')
    .optional()
    .or(z.literal('')),

  delivery_instructions: z
    .string()
    .max(2000, 'Delivery instructions are too long')
    .optional()
    .or(z.literal('')),

  internal_notes: z
    .string()
    .max(2000, 'Internal notes are too long')
    .optional()
    .or(z.literal('')),

  status: z.nativeEnum(TripStatus).default(TripStatus.DRAFT),

  is_recurring: z
    .boolean()
    .optional()
    .default(false),
});

export type CreateTripFormData = z.infer<typeof createTripSchema>;

// Update Trip Schema (all fields optional except ID)
export const updateTripSchema = createTripSchema.partial();

export type UpdateTripFormData = z.infer<typeof updateTripSchema>;

// Assign Resources Schema
export const assignResourcesSchema = z.object({
  trip_id: z.string().uuid('Invalid trip ID'),
  
  truck_id: z
    .string()
    .uuid('Invalid truck ID')
    .optional(),
  
  driver_id: z
    .string()
    .uuid('Invalid driver ID')
    .optional(),
  
  porter_ids: z
    .array(z.string().uuid('Invalid porter ID'))
    .optional(),
}).refine(
  (data) => {
    // At least one assignment must be provided
    return data.truck_id || data.driver_id || (data.porter_ids && data.porter_ids.length > 0);
  },
  {
    message: 'At least one resource (truck, driver, or porter) must be assigned',
  }
);

export type AssignResourcesFormData = z.infer<typeof assignResourcesSchema>;

// Update Status Schema
export const updateStatusSchema = z.object({
  trip_id: z.string().uuid('Invalid trip ID'),
  
  new_status: z.nativeEnum(TripStatus, {
    message: 'Invalid trip status',
  }),
  
  location: z
    .string()
    .max(200, 'Location is too long')
    .optional()
    .or(z.literal('')),
  
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notes are too long')
    .optional()
    .or(z.literal('')),
  
  reason: z
    .string()
    .max(500, 'Reason is too long')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => {
    // Certain statuses require a reason
    const statusesRequiringReason = [
      TripStatus.DELAYED,
      TripStatus.CANCELLED,
      TripStatus.INCIDENT_REPORTED,
    ];
    
    if (statusesRequiringReason.includes(data.new_status)) {
      return !!data.reason && data.reason.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Reason is required for this status',
    path: ['reason'],
  }
);

export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

// Cancel Trip Schema
export const cancelTripSchema = z.object({
  trip_id: z.string().uuid('Invalid trip ID'),
  
  reason: z
    .string()
    .min(10, 'Cancellation reason must be at least 10 characters')
    .max(500, 'Cancellation reason is too long')
    .trim(),
});

export type CancelTripFormData = z.infer<typeof cancelTripSchema>;

// Duplicate Trip Schema
export const duplicateTripSchema = z.object({
  source_trip_id: z.string().uuid('Invalid trip ID'),
  
  new_delivery_date: dateSchema,
  
  new_call_time: timeSchema,
  
  copy_assignments: z
    .boolean()
    .optional()
    .default(false),
});

export type DuplicateTripFormData = z.infer<typeof duplicateTripSchema>;

// Trip Search/Filter Schema
export const tripFilterSchema = z.object({
  search: z.string().optional(),
  
  status: z
    .nativeEnum(TripStatus)
    .optional(),
  
  delivery_date_from: dateSchema.optional(),
  
  delivery_date_to: dateSchema.optional(),
  
  assigned_truck_id: z
    .string()
    .uuid('Invalid truck ID')
    .optional(),
  
  assigned_driver_id: z
    .string()
    .uuid('Invalid driver ID')
    .optional(),
}).refine(
  (data) => {
    // If both dates provided, from must be before or equal to to
    if (data.delivery_date_from && data.delivery_date_to) {
      const from = new Date(data.delivery_date_from);
      const to = new Date(data.delivery_date_to);
      return from <= to;
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['delivery_date_to'],
  }
);

export type TripFilterFormData = z.infer<typeof tripFilterSchema>;
