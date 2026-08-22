/**
 * Philippine-specific formatting utilities
 */

/**
 * Format Philippine plate number
 * Examples: ABC-1234, TAX-123
 */
export const formatPlatNumber = (plate: string): string => {
  if (!plate) return '';
  
  // Remove any existing dashes and spaces
  const cleaned = plate.replace(/[-\s]/g, '').toUpperCase();
  
  // Check if it's already in the correct format
  if (/^[A-Z]{3}-?\d{3,4}$/.test(cleaned)) {
    // Format as XXX-####
    const letters = cleaned.slice(0, 3);
    const numbers = cleaned.slice(3);
    return `${letters}-${numbers}`;
  }
  
  return plate.toUpperCase();
};

/**
 * Validate Philippine plate number
 */
export const isValidPlateNumber = (plate: string): boolean => {
  const cleaned = plate.replace(/[-\s]/g, '').toUpperCase();
  return /^[A-Z]{3}\d{3,4}$/.test(cleaned);
};

/**
 * Format Philippine mobile number
 * Examples: +63 917 123 4567, 0917 123 4567
 */
export const formatPhilippinePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('63')) {
    // +63 format
    const number = cleaned.slice(2);
    if (number.length === 10) {
      return `+63 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    }
  } else if (cleaned.startsWith('0')) {
    // 0### format
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
  } else if (cleaned.length === 10) {
    // 9## format (missing leading 0)
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Validate Philippine mobile number
 */
export const isValidPhilippinePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check various formats
  if (cleaned.startsWith('63')) {
    // +63 format: should be 12 digits total
    return cleaned.length === 12 && /^63[89]\d{9}$/.test(cleaned);
  } else if (cleaned.startsWith('0')) {
    // 0### format: should be 11 digits total
    return cleaned.length === 11 && /^0[89]\d{9}$/.test(cleaned);
  } else {
    // 9## format: should be 10 digits
    return cleaned.length === 10 && /^[89]\d{9}$/.test(cleaned);
  }
};

/**
 * Format Philippine currency (Peso)
 */
export const formatPeso = (amount: number | string, showSymbol: boolean = true): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return showSymbol ? '₱0.00' : '0.00';
  
  const formatted = num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return showSymbol ? `₱${formatted}` : formatted;
};

/**
 * Parse peso string to number
 */
export const parsePeso = (amount: string): number => {
  if (!amount) return 0;
  
  // Remove peso sign, commas, and spaces
  const cleaned = amount.replace(/[₱,\s]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? 0 : num;
};

/**
 * Format Philippine date (MM/DD/YYYY)
 */
export const formatPhilippineDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Format Philippine date and time
 */
export const formatPhilippineDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';
  
  const dateStr = formatPhilippineDate(d);
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${dateStr} ${displayHours}:${minutes} ${ampm}`;
};

/**
 * Format license number (Philippine driver's license)
 * Example: A12-34-567890
 */
export const formatLicenseNumber = (license: string): string => {
  if (!license) return '';
  
  // Remove any existing dashes and spaces
  const cleaned = license.replace(/[-\s]/g, '').toUpperCase();
  
  // Format as A##-##-######
  if (/^[A-Z]\d{10}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  return license.toUpperCase();
};

/**
 * Validate Philippine driver's license number
 */
export const isValidLicenseNumber = (license: string): boolean => {
  const cleaned = license.replace(/[-\s]/g, '').toUpperCase();
  return /^[A-Z]\d{10}$/.test(cleaned);
};

/**
 * Get relative date string in Tagalog/English
 */
export const getRelativeDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Check if date is expiring soon (within 30 days)
 */
export const isExpiringSoon = (expiryDate: Date | string, daysThreshold: number = 30): boolean => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= daysThreshold;
};

/**
 * Check if date is expired
 */
export const isExpired = (expiryDate: Date | string): boolean => {
  const expiry = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  
  return expiry.getTime() < now.getTime();
};
