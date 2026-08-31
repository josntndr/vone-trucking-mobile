/**
 * Location Service
 * Handles Philippine address hierarchy with proper Region/Province separation
 * Supports NCR (no province) and international addresses
 */

import {
  COUNTRIES,
  REGIONS,
  PROVINCES,
  CITIES,
  BARANGAYS,
  type Country,
  type Region,
  type Province,
  type City,
  type Barangay,
} from '../data/locations/philippines-complete';

// Cache for search results
const searchCache = new Map<string, any>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

// =============================================================================
// COUNTRY FUNCTIONS
// =============================================================================

export function getCountries(): Country[] {
  return COUNTRIES;
}

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function searchCountries(query: string): Country[] {
  if (!query.trim()) return COUNTRIES;
  
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery)
  );
}

// =============================================================================
// REGION FUNCTIONS
// =============================================================================

export function getRegions(countryCode: string = 'PH'): Region[] {
  if (countryCode !== 'PH') {
    // For non-PH countries, return empty (can be extended with other country regions)
    return [];
  }
  return REGIONS;
}

export function getRegionByCode(regionCode: string): Region | undefined {
  return REGIONS.find(r => r.code === regionCode);
}

export function searchRegions(query: string, countryCode: string = 'PH'): Region[] {
  const regions = getRegions(countryCode);
  if (!query.trim()) return regions;
  
  const lowerQuery = query.toLowerCase();
  return regions.filter(region =>
    region.name.toLowerCase().includes(lowerQuery) ||
    region.code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Check if a region requires a province
 * NCR (Region 13) does not have provinces
 */
export function regionHasProvinces(regionCode: string): boolean {
  const region = getRegionByCode(regionCode);
  return region?.hasProvinces ?? true;
}

// =============================================================================
// PROVINCE FUNCTIONS
// =============================================================================

export function getProvinces(regionCode?: string): Province[] {
  if (!regionCode) return PROVINCES;
  
  // Check if region has provinces
  if (!regionHasProvinces(regionCode)) {
    return [];
  }
  
  return PROVINCES.filter(p => p.regionCode === regionCode);
}

export function getProvinceByCode(provinceCode: string): Province | undefined {
  return PROVINCES.find(p => p.code === provinceCode);
}

export function searchProvinces(query: string, regionCode?: string): Province[] {
  const provinces = getProvinces(regionCode);
  if (!query.trim()) return provinces;
  
  const lowerQuery = query.toLowerCase();
  return provinces.filter(province =>
    province.name.toLowerCase().includes(lowerQuery) ||
    province.code.toLowerCase().includes(lowerQuery)
  );
}

// =============================================================================
// CITY/MUNICIPALITY FUNCTIONS
// =============================================================================

/**
 * Get cities/municipalities for a region or province
 * For NCR: returns cities directly under region (no province filter)
 * For other regions: returns independent cities before a province is selected
 */
export function getCities(params: { regionCode?: string; provinceCode?: string }): City[] {
  const { regionCode, provinceCode } = params;
  
  // If province is specified, filter by province
  if (provinceCode) {
    return CITIES.filter(c => c.provinceCode === provinceCode);
  }
  
  // If only region is specified
  if (regionCode) {
    // For NCR, return all cities in the region (they don't have provinces)
    if (!regionHasProvinces(regionCode)) {
      return CITIES.filter(c => c.regionCode === regionCode);
    }
    // For regions with provinces, province must be selected first
    return [];
  }
  
  return CITIES;
}

export function getCityByCode(cityCode: string): City | undefined {
  return CITIES.find(c => c.code === cityCode);
}

export function searchCities(
  query: string,
  params: { regionCode?: string; provinceCode?: string } = {}
): City[] {
  const cities = getCities(params);
  if (!query.trim()) return cities;
  
  const lowerQuery = query.toLowerCase();
  return cities.filter(city =>
    city.name.toLowerCase().includes(lowerQuery) ||
    city.code.toLowerCase().includes(lowerQuery) ||
    city.type.toLowerCase().includes(lowerQuery)
  );
}

// =============================================================================
// BARANGAY FUNCTIONS
// =============================================================================

export function getBarangays(cityCode?: string): Barangay[] {
  if (!cityCode) return BARANGAYS;
  return BARANGAYS.filter(b => b.cityMunicipalityCode === cityCode);
}

export function getBarangayByCode(barangayCode: string): Barangay | undefined {
  return BARANGAYS.find(b => b.code === barangayCode);
}

export function searchBarangays(query: string, cityCode?: string): Barangay[] {
  const barangays = getBarangays(cityCode);
  if (!query.trim()) return barangays;
  
  const lowerQuery = query.toLowerCase();
  return barangays.filter(barangay =>
    barangay.name.toLowerCase().includes(lowerQuery) ||
    barangay.code.toLowerCase().includes(lowerQuery)
  );
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateAddress(address: {
  countryCode?: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
}): AddressValidationResult {
  const errors: string[] = [];

  // Validate country
  if (address.countryCode) {
    const country = getCountryByCode(address.countryCode);
    if (!country) {
      errors.push('Invalid country code');
    }
  }

  // Validate region
  if (address.regionCode) {
    const region = getRegionByCode(address.regionCode);
    if (!region) {
      errors.push('Invalid region code');
    }
  }

  const selectedCity = address.cityCode ? getCityByCode(address.cityCode) : undefined;

  // Validate province
  if (address.provinceCode) {
    const province = getProvinceByCode(address.provinceCode);
    if (!province) {
      errors.push('Invalid province code');
    } else if (address.regionCode && province.regionCode !== address.regionCode) {
      errors.push('Province does not belong to the selected region');
    }
  } else if (selectedCity?.provinceCode) {
    errors.push('Province is required for this region');
  }

  // Validate city/municipality
  if (address.cityCode) {
    const city = selectedCity;
    if (!city) {
      errors.push('Invalid city/municipality code');
    } else {
      // Check if city belongs to the correct province (if applicable)
      if (address.provinceCode && city.provinceCode !== address.provinceCode) {
        errors.push('City/municipality does not belong to the selected province');
      }
      // Check if city belongs to the correct region
      if (address.regionCode && city.regionCode !== address.regionCode) {
        errors.push('City/municipality does not belong to the selected region');
      }
    }
  }

  // Validate barangay
  if (address.barangayCode) {
    const barangay = getBarangayByCode(address.barangayCode);
    if (!barangay) {
      errors.push('Invalid barangay code');
    } else if (address.cityCode && barangay.cityMunicipalityCode !== address.cityCode) {
      errors.push('Barangay does not belong to the selected city/municipality');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validatePostalCode(postalCode: string, countryCode: string): boolean {
  if (countryCode === 'PH') {
    // Philippine postal code: 4 digits
    return /^\d{4}$/.test(postalCode);
  }
  // Add validation for other countries as needed
  return true;
}

// =============================================================================
// ADDRESS FORMATTING
// =============================================================================

export interface FormattedAddressOptions {
  countryCode?: string;
  countryName?: string;
  regionCode?: string;
  regionName?: string;
  provinceCode?: string;
  provinceName?: string;
  cityCode?: string;
  cityName?: string;
  barangayCode?: string;
  barangayName?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
}

/**
 * Format address according to Philippine standards
 * Properly handles NCR (no province) and other special cases
 */
export function formatAddress(options: FormattedAddressOptions): string {
  const parts: string[] = [];

  // Address Line 1 (House/Unit, Building, Street)
  if (options.addressLine1) {
    parts.push(options.addressLine1);
  }

  // Address Line 2 (Apartment, Floor, Landmark)
  if (options.addressLine2) {
    parts.push(options.addressLine2);
  }

  // Barangay
  if (options.barangayName) {
    parts.push(options.barangayName);
  }

  // City/Municipality
  if (options.cityName) {
    parts.push(options.cityName);
  }

  // Province (only if applicable - not for NCR)
  if (options.provinceName && options.regionCode) {
    // Only add province if the region has provinces
    if (regionHasProvinces(options.regionCode)) {
      parts.push(options.provinceName);
    }
  }

  // Region
  if (options.regionName) {
    parts.push(options.regionName);
  }

  // Postal Code
  if (options.postalCode) {
    parts.push(options.postalCode);
  }

  // Country
  if (options.countryName) {
    parts.push(options.countryName);
  }

  // Join with commas, filter out empty parts
  return parts.filter(part => part && part.trim()).join(', ');
}

/**
 * Get suggested postal codes for a city
 */
export function getSuggestedPostalCodes(cityCode: string): string[] {
  const city = getCityByCode(cityCode);
  return city?.postalCodes || [];
}

// =============================================================================
// LEGACY ADDRESS PARSING (for migration)
// =============================================================================

export interface ParsedLegacyAddress {
  addressLine1?: string;
  addressLine2?: string;
  cityName?: string;
  provinceName?: string;
  regionName?: string;
  postalCode?: string;
  needsReview: boolean;
  matchedCityCode?: string;
  matchedProvinceCode?: string;
  matchedRegionCode?: string;
}

/**
 * Attempt to parse old combined address strings
 * Marks ambiguous results for manual review
 */
export function parseLegacyAddress(legacyAddress: string): ParsedLegacyAddress {
  const result: ParsedLegacyAddress = {
    needsReview: true, // Default to needs review
  };

  if (!legacyAddress || !legacyAddress.trim()) {
    return result;
  }

  // Split by common delimiters
  const parts = legacyAddress.split(/[,\n]/).map(p => p.trim()).filter(p => p);

  // Try to extract postal code (4 digits for PH)
  const postalCodeMatch = legacyAddress.match(/\b\d{4}\b/);
  if (postalCodeMatch) {
    result.postalCode = postalCodeMatch[0];
  }

  // Try to match city names
  for (const part of parts) {
    const matchedCity = CITIES.find(c => 
      c.name.toLowerCase() === part.toLowerCase()
    );
    if (matchedCity) {
      result.cityName = matchedCity.name;
      result.matchedCityCode = matchedCity.code;
      
      // If city has a province, try to match it
      if (matchedCity.provinceCode) {
        const province = getProvinceByCode(matchedCity.provinceCode);
        if (province) {
          result.provinceName = province.name;
          result.matchedProvinceCode = province.code;
          result.matchedRegionCode = province.regionCode;
          
          const region = getRegionByCode(province.regionCode);
          if (region) {
            result.regionName = region.name;
          }
        }
      } else if (matchedCity.regionCode) {
        // NCR city - no province
        const region = getRegionByCode(matchedCity.regionCode);
        if (region) {
          result.regionName = region.name;
          result.matchedRegionCode = region.code;
        }
      }
      break;
    }
  }

  // If we found a complete match, mark as not needing review
  if (result.matchedCityCode && (result.matchedProvinceCode || result.matchedRegionCode === '1300000000')) {
    result.needsReview = false;
  }

  // Use remaining parts as address lines
  const usedParts = new Set([result.cityName, result.provinceName, result.regionName, result.postalCode]);
  const addressParts = parts.filter(p => !usedParts.has(p) && !/^\d{4}$/.test(p));
  
  if (addressParts.length > 0) {
    result.addressLine1 = addressParts[0];
  }
  if (addressParts.length > 1) {
    result.addressLine2 = addressParts.slice(1).join(', ');
  }

  return result;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if location data is complete enough for the selected area
 */
export function isLocationDataComplete(regionCode: string, provinceCode?: string): {
  hasCities: boolean;
  hasBarangays: boolean;
  message?: string;
} {
  const cities = getCities({ regionCode, provinceCode });
  
  if (cities.length === 0) {
    return {
      hasCities: false,
      hasBarangays: false,
      message: 'Location data for this area could not be loaded. Please retry.',
    };
  }

  // Check if at least one city has barangay data
  const hasBarangays = cities.some(city => {
    const barangays = getBarangays(city.code);
    return barangays.length > 0;
  });

  return {
    hasCities: true,
    hasBarangays,
    message: hasBarangays ? undefined : 'Barangay data could not be loaded for this area. Please retry.',
  };
}

/**
 * Get location hierarchy display text
 */
export function getLocationHierarchyText(locationCodes: {
  countryCode?: string;
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
}): string {
  const parts: string[] = [];

  if (locationCodes.countryCode) {
    const country = getCountryByCode(locationCodes.countryCode);
    if (country) parts.push(country.name);
  }

  if (locationCodes.regionCode) {
    const region = getRegionByCode(locationCodes.regionCode);
    if (region) parts.push(region.name);
  }

  if (locationCodes.provinceCode) {
    const province = getProvinceByCode(locationCodes.provinceCode);
    if (province) parts.push(province.name);
  }

  if (locationCodes.cityCode) {
    const city = getCityByCode(locationCodes.cityCode);
    if (city) parts.push(city.name);
  }

  if (locationCodes.barangayCode) {
    const barangay = getBarangayByCode(locationCodes.barangayCode);
    if (barangay) parts.push(barangay.name);
  }

  return parts.join(' -> ');
}

/**
 * Clear cached search results
 */
export function clearLocationCache(): void {
  searchCache.clear();
}
