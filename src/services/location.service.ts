/**
 * Location Service
 * Provides access to Philippine location data with caching and search functionality
 */

import {
  COUNTRIES,
  PROVINCES,
  CITIES,
  BARANGAYS,
  Country,
  Province,
  City,
  Barangay,
  getProvincesForCountry,
  getCitiesForProvince,
  getBarangaysForCity,
  getPostalCodesForCity,
  findProvinceByCode,
  findCityByCode,
  findBarangayByCode,
  formatAddress as formatAddressUtil,
} from '../data/locations/philippines';

// Cache for search results
const searchCache = new Map<string, any>();

// Search debounce timeout
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export interface LocationOption {
  code: string;
  name: string;
  label: string; // For display in selectors
}

export interface AddressComponents {
  country: string;
  countryCode: string;
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  barangay: string;
  barangayCode: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
}

/**
 * Get all available countries
 */
export function getCountries(): LocationOption[] {
  return COUNTRIES.map(country => ({
    code: country.code,
    name: country.name,
    label: country.name,
  }));
}

/**
 * Get provinces for a country
 */
export function getProvinces(countryCode: string): LocationOption[] {
  const provinces = getProvincesForCountry(countryCode);
  return provinces.map(province => ({
    code: province.code,
    name: province.name,
    label: `${province.name} (${province.region})`,
  }));
}

/**
 * Get cities/municipalities for a province
 */
export function getCities(provinceCode: string): LocationOption[] {
  const cities = getCitiesForProvince(provinceCode);
  return cities.map(city => ({
    code: city.code,
    name: city.name,
    label: city.type === 'city' ? `${city.name} (City)` : city.name,
  }));
}

/**
 * Get barangays for a city
 */
export function getBarangays(cityCode: string): LocationOption[] {
  const barangays = getBarangaysForCity(cityCode);
  return barangays.map(barangay => ({
    code: barangay.code,
    name: barangay.name,
    label: barangay.name,
  }));
}

/**
 * Get postal codes for a city
 */
export function getPostalCodes(cityCode: string): string[] {
  return getPostalCodesForCity(cityCode);
}

/**
 * Search provinces by name
 */
export function searchProvinces(countryCode: string, query: string): LocationOption[] {
  if (!query.trim()) {
    return getProvinces(countryCode);
  }

  const cacheKey = `provinces_${countryCode}_${query.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const provinces = getProvincesForCountry(countryCode);
  const searchLower = query.toLowerCase();
  
  const results = provinces
    .filter(province => 
      province.name.toLowerCase().includes(searchLower) ||
      province.region.toLowerCase().includes(searchLower)
    )
    .map(province => ({
      code: province.code,
      name: province.name,
      label: `${province.name} (${province.region})`,
    }));

  searchCache.set(cacheKey, results);
  return results;
}

/**
 * Search cities by name
 */
export function searchCities(provinceCode: string, query: string): LocationOption[] {
  if (!query.trim()) {
    return getCities(provinceCode);
  }

  const cacheKey = `cities_${provinceCode}_${query.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const cities = getCitiesForProvince(provinceCode);
  const searchLower = query.toLowerCase();
  
  const results = cities
    .filter(city => city.name.toLowerCase().includes(searchLower))
    .map(city => ({
      code: city.code,
      name: city.name,
      label: city.type === 'city' ? `${city.name} (City)` : city.name,
    }));

  searchCache.set(cacheKey, results);
  return results;
}

/**
 * Search barangays by name
 */
export function searchBarangays(cityCode: string, query: string): LocationOption[] {
  if (!query.trim()) {
    return getBarangays(cityCode);
  }

  const cacheKey = `barangays_${cityCode}_${query.toLowerCase()}`;
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey);
  }

  const barangays = getBarangaysForCity(cityCode);
  const searchLower = query.toLowerCase();
  
  const results = barangays
    .filter(barangay => barangay.name.toLowerCase().includes(searchLower))
    .map(barangay => ({
      code: barangay.code,
      name: barangay.name,
      label: barangay.name,
    }));

  searchCache.set(cacheKey, results);
  return results;
}

/**
 * Validate location hierarchy
 * Ensures city belongs to province and barangay belongs to city
 */
export function validateLocationHierarchy(
  provinceCode: string,
  cityCode: string,
  barangayCode: string
): { valid: boolean; error?: string } {
  // Validate city belongs to province
  const city = findCityByCode(cityCode);
  if (!city) {
    return { valid: false, error: 'Invalid city code' };
  }
  
  if (city.provinceCode !== provinceCode) {
    return { valid: false, error: 'This city does not belong to the selected province' };
  }

  // Validate barangay belongs to city
  const barangay = findBarangayByCode(barangayCode);
  if (!barangay) {
    return { valid: false, error: 'Invalid barangay code' };
  }
  
  if (barangay.cityCode !== cityCode) {
    return { valid: false, error: 'This barangay does not belong to the selected city' };
  }

  return { valid: true };
}

/**
 * Get address components from codes
 */
export function getAddressComponents(
  countryCode: string,
  provinceCode: string,
  cityCode: string,
  barangayCode: string,
  postalCode: string,
  addressLine1: string,
  addressLine2?: string
): AddressComponents | null {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const province = findProvinceByCode(provinceCode);
  const city = findCityByCode(cityCode);
  const barangay = findBarangayByCode(barangayCode);

  if (!country || !province || !city || !barangay) {
    return null;
  }

  return {
    country: country.name,
    countryCode: country.code,
    province: province.name,
    provinceCode: province.code,
    city: city.name,
    cityCode: city.code,
    barangay: barangay.name,
    barangayCode: barangay.code,
    postalCode,
    addressLine1,
    addressLine2,
  };
}

/**
 * Format complete address for display
 */
export function formatAddress(components: {
  addressLine1: string;
  addressLine2?: string;
  barangayCode: string;
  cityCode: string;
  provinceCode: string;
  postalCode: string;
  countryCode: string;
}): string {
  return formatAddressUtil(components);
}

/**
 * Format address with line 2 included
 */
export function formatAddressWithLine2(components: {
  addressLine1: string;
  addressLine2?: string;
  barangayCode: string;
  cityCode: string;
  provinceCode: string;
  postalCode: string;
  countryCode: string;
}): string {
  const barangay = findBarangayByCode(components.barangayCode);
  const city = findCityByCode(components.cityCode);
  const province = findProvinceByCode(components.provinceCode);
  const country = COUNTRIES.find(c => c.code === components.countryCode);

  const addressParts: string[] = [];
  
  // Add address lines
  addressParts.push(components.addressLine1);
  if (components.addressLine2?.trim()) {
    addressParts.push(components.addressLine2);
  }
  
  // Add location hierarchy
  if (barangay) addressParts.push(barangay.name);
  if (city) addressParts.push(city.name);
  if (province) addressParts.push(province.name);
  addressParts.push(components.postalCode);
  if (country) addressParts.push(country.name);

  return addressParts.filter(Boolean).join(', ');
}

/**
 * Validate Philippine postal code format
 */
export function validatePostalCode(postalCode: string, cityCode: string): { valid: boolean; error?: string } {
  // Philippine postal codes are 4 digits
  if (!/^\d{4}$/.test(postalCode)) {
    return { valid: false, error: 'Postal code must be exactly 4 digits' };
  }

  // Check if postal code is valid for the city
  const validCodes = getPostalCodesForCity(cityCode);
  if (validCodes.length > 0 && !validCodes.includes(postalCode)) {
    return { 
      valid: false, 
      error: `This postal code is not valid for the selected city. Expected: ${validCodes.join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * Get suggested postal code for a city
 */
export function getSuggestedPostalCode(cityCode: string): string | null {
  const codes = getPostalCodesForCity(cityCode);
  return codes.length > 0 ? codes[0] : null;
}

/**
 * Clear search cache
 */
export function clearLocationCache(): void {
  searchCache.clear();
}

/**
 * Parse legacy address string (best effort)
 * This attempts to extract structured components from old single-line addresses
 * Returns null if parsing is not reliable
 */
export function parseLegacyAddress(address: string): {
  addressLine1?: string;
  city?: string;
  province?: string;
  confidence: 'high' | 'low' | 'none';
} | null {
  if (!address || address.trim().length < 10) {
    return null;
  }

  const parts = address.split(',').map(p => p.trim());
  
  // Look for known provinces in the address
  const foundProvince = PROVINCES.find(p => 
    address.toLowerCase().includes(p.name.toLowerCase())
  );

  // Look for known cities in the address
  const foundCity = CITIES.find(c => 
    address.toLowerCase().includes(c.name.toLowerCase())
  );

  if (foundProvince && foundCity) {
    // High confidence: both province and city found
    const cityIndex = parts.findIndex(p => 
      p.toLowerCase().includes(foundCity.name.toLowerCase())
    );
    
    const addressLine1 = parts.slice(0, cityIndex).join(', ');
    
    return {
      addressLine1: addressLine1 || parts[0],
      city: foundCity.name,
      province: foundProvince.name,
      confidence: 'high',
    };
  }

  if (foundCity || foundProvince) {
    // Low confidence: only one component found
    return {
      addressLine1: parts[0],
      city: foundCity?.name,
      province: foundProvince?.name,
      confidence: 'low',
    };
  }

  // No confidence: couldn't parse
  return {
    addressLine1: address,
    confidence: 'none',
  };
}

/**
 * Check if address appears to be structured (has location codes)
 */
export function isStructuredAddress(address: any): boolean {
  return (
    address &&
    typeof address === 'object' &&
    'countryCode' in address &&
    'provinceCode' in address &&
    'cityCode' in address &&
    'barangayCode' in address &&
    'postalCode' in address &&
    'addressLine1' in address
  );
}
