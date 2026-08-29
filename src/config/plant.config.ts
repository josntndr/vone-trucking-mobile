/**
 * Central Plant Configuration
 * Single source of truth for company plant/warehouse locations
 */

export interface PlantLocation {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

/**
 * Main company plant in Imus
 * All deliveries originate from this location
 */
export const IMUS_PLANT: PlantLocation = {
  id: 'imus-plant',
  name: 'Imus Plant',
  address: 'Imus, Cavite, Philippines',
  latitude: undefined, // TODO: Configure actual coordinates
  longitude: undefined, // TODO: Configure actual coordinates
  isActive: true,
};

/**
 * Get the default pickup location for all trips
 */
export const getDefaultPickupLocation = (): PlantLocation => {
  return IMUS_PLANT;
};

/**
 * Validate if a pickup location is the authorized plant
 */
export const isValidPickupLocation = (locationId: string): boolean => {
  return locationId === IMUS_PLANT.id;
};

/**
 * Format plant location for display
 */
export const formatPlantRoute = (destination: string): string => {
  return `${IMUS_PLANT.name} → ${destination}`;
};
