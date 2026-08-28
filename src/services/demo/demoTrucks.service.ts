/**
 * Demo Trucks Service
 * Provides mock truck data for development when Supabase is not configured
 */

import { Truck, TruckStatus, FuelType } from '../../types/truck.types';

export const DEMO_TRUCKS: Truck[] = [
  {
    id: 'truck_demo_1',
    truck_number: 'VT-001',
    license_plate: 'ABC 1234',
    make: 'Isuzu',
    model: 'Forward',
    year: 2020,
    truck_type: 'Closed Van',
    capacity_kg: 5000,
    fuel_type: FuelType.DIESEL,
    status: TruckStatus.AVAILABLE,
    is_active: true,
    current_odometer: 45230,
    avg_km_per_liter: 8.5,
    last_service_date: '2024-07-15',
    next_service_date: '2024-10-15',
    assigned_driver_id: undefined,
    assigned_driver_name: undefined,
    gps_device_id: undefined,
    vin: 'ISUZU001234567890',
    insurance_expiry: '2025-06-30',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-08-20T10:30:00Z',
  },
  {
    id: 'truck_demo_2',
    truck_number: 'VT-002',
    license_plate: 'XYZ 5678',
    make: 'Mitsubishi',
    model: 'Fuso',
    year: 2019,
    truck_type: 'Dropside',
    capacity_kg: 4500,
    fuel_type: FuelType.DIESEL,
    status: TruckStatus.ON_TRIP,
    is_active: true,
    current_odometer: 67890,
    avg_km_per_liter: 7.8,
    last_service_date: '2024-08-01',
    next_service_date: '2024-11-01',
    assigned_driver_id: 'driver_demo_1',
    assigned_driver_name: 'Juan Dela Cruz',
    gps_device_id: 'gps_001',
    vin: 'FUSO001234567890',
    insurance_expiry: '2025-03-31',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-08-22T09:15:00Z',
  },
  {
    id: 'truck_demo_3',
    truck_number: 'VT-003',
    license_plate: 'DEF 9012',
    make: 'Hino',
    model: '500 Series',
    year: 2021,
    truck_type: 'Refrigerated Van',
    capacity_kg: 6000,
    fuel_type: FuelType.DIESEL,
    status: TruckStatus.AVAILABLE,
    is_active: true,
    current_odometer: 23450,
    avg_km_per_liter: 9.2,
    last_service_date: '2024-08-10',
    next_service_date: '2024-11-10',
    assigned_driver_id: undefined,
    assigned_driver_name: undefined,
    gps_device_id: undefined,
    vin: 'HINO001234567890',
    insurance_expiry: '2025-09-15',
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-08-15T14:20:00Z',
  },
  {
    id: 'truck_demo_4',
    truck_number: 'VT-004',
    license_plate: 'GHI 3456',
    make: 'Isuzu',
    model: 'Elf',
    year: 2018,
    truck_type: 'Closed Van',
    capacity_kg: 3000,
    fuel_type: FuelType.DIESEL,
    status: TruckStatus.UNDER_MAINTENANCE,
    is_active: true,
    current_odometer: 89120,
    avg_km_per_liter: 10.1,
    last_service_date: '2024-08-20',
    next_service_date: '2024-08-25',
    assigned_driver_id: undefined,
    assigned_driver_name: undefined,
    gps_device_id: undefined,
    vin: 'ISUZU987654321098',
    insurance_expiry: '2025-01-31',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-08-22T11:00:00Z',
  },
  {
    id: 'truck_demo_5',
    truck_number: 'VT-005',
    license_plate: 'JKL 7890',
    make: 'Mitsubishi',
    model: 'Canter',
    year: 2022,
    truck_type: 'Dropside',
    capacity_kg: 3500,
    fuel_type: FuelType.DIESEL,
    status: TruckStatus.ON_TRIP,
    is_active: true,
    current_odometer: 12340,
    avg_km_per_liter: 11.3,
    last_service_date: '2024-07-25',
    next_service_date: '2024-10-25',
    assigned_driver_id: 'driver_demo_2',
    assigned_driver_name: 'Maria Santos',
    gps_device_id: 'gps_002',
    vin: 'CANTER001234567890',
    insurance_expiry: '2025-12-31',
    created_at: '2024-03-01T08:00:00Z',
    updated_at: '2024-08-22T08:45:00Z',
  },
];

/**
 * Get demo trucks with optional filtering
 */
export const getDemoTrucks = (
  filters?: {
    status?: TruckStatus;
    is_active?: boolean;
    search?: string;
  }
): Truck[] => {
  let filtered = [...DEMO_TRUCKS];

  if (filters?.status) {
    filtered = filtered.filter(t => t.status === filters.status);
  }

  if (filters?.is_active !== undefined) {
    filtered = filtered.filter(t => t.is_active === filters.is_active);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      t =>
        t.truck_number.toLowerCase().includes(searchLower) ||
        t.license_plate.toLowerCase().includes(searchLower) ||
        t.make.toLowerCase().includes(searchLower) ||
        t.model.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

/**
 * Get demo truck by ID
 */
export const getDemoTruckById = (id: string): Truck | null => {
  return DEMO_TRUCKS.find(t => t.id === id) || null;
};
