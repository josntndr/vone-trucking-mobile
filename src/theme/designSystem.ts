/**
 * Vone Trucking - Global Design System
 * Modern, premium design system for mobile app
 * Version: 2.0
 */

export const DESIGN_SYSTEM = {
  // ==================== COLORS ====================
  colors: {
    // Backgrounds
    background: '#F5F4F0',      // Warm off-white primary background
    surface: '#FFFFFF',         // Card background
    
    // Primary Colors
    navy: '#1B2A4A',           // Primary navy for headers, buttons, icons
    teal: '#3A7D8C',           // Accent teal for links, secondary actions
    orange: '#E07B2A',         // Accent orange for highlights, badges
    
    // Semantic Colors
    success: '#2E7D32',        // Green for success states
    warning: '#F59E0B',        // Amber for warnings
    error: '#D32F2F',          // Red for errors
    
    // Text Colors
    text: '#2D2D2D',           // Primary body text
    textSecondary: '#9E9E9E',  // Secondary grey text (alias for textMuted)
    textTertiary: '#BDBDBD',   // Tertiary light grey text (alias for textLight)
    textMuted: '#9E9E9E',      // Muted grey text for labels
    textLight: '#BDBDBD',      // Light grey for disabled/subtle text
    
    // Additional Colors
    white: '#FFFFFF',
    border: '#E0E0E0',         // Light grey for borders
    divider: '#F0F0F0',        // Very light grey for dividers
    overlay: 'rgba(0,0,0,0.5)', // Dark overlay for modals
    
    // Status Badge Backgrounds
    statusAvailable: '#E8F5E9',      // Light green
    statusOnTrip: '#E0F2F7',         // Light teal
    statusAssigned: '#E3F2FD',       // Light navy
    statusMaintenance: '#FFF8E1',    // Light amber
    statusDelayed: '#FFF4E6',        // Light orange
    statusScheduled: '#F5F5F5',      // Light grey
    
    // Alert Backgrounds
    alertWarningBg: '#FFFBF0',       // Soft amber background
    alertErrorBg: '#FFF5F5',         // Soft red background
    alertSuccessBg: '#F1F8F4',       // Soft green background
    alertInfoBg: '#F0F7FA',          // Soft teal background
  },

  // ==================== TYPOGRAPHY ====================
  typography: {
    // Font Sizes
    fontSize: {
      xs: 10,
      sm: 11,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 22,
      '3xl': 28,
    },
    
    // Font Weights
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // Line Heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    
    // Letter Spacing
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.4,
      wider: 1.2,
    },
  },

  // ==================== SPACING ====================
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },

  // ==================== BORDER RADIUS ====================
  borderRadius: {
    sm: 8,
    base: 12,
    md: 14,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // ==================== SHADOWS ====================
  shadows: {
    none: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 4,
    },
    fab: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
  },

  // ==================== COMPONENT STYLES ====================
  components: {
    // Card Styles
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 2,
    },
    
    // Small Card (for stat cards)
    cardSmall: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 2,
    },
    
    // Button - Primary
    buttonPrimary: {
      backgroundColor: '#1B2A4A',
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 20,
      height: 52,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    
    buttonPrimaryText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700' as const,
    },
    
    // Button - Secondary (Outlined)
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#1B2A4A',
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 20,
      height: 52,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    buttonSecondaryText: {
      color: '#1B2A4A',
      fontSize: 14,
      fontWeight: '700' as const,
    },
    
    // Button - Small (44px height)
    buttonSmall: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 16,
      height: 44,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    buttonSmallText: {
      color: '#2D2D2D',
      fontSize: 13,
      fontWeight: '600' as const,
    },
    
    // FAB (Floating Action Button)
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#1B2A4A',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      position: 'absolute' as const,
      bottom: 20,
      right: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    
    // Search Bar
    searchBar: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      height: 44,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    
    searchBarText: {
      color: '#2D2D2D',
      fontSize: 14,
    },
    
    searchBarPlaceholder: {
      color: '#9E9E9E',
      fontSize: 13,
    },
    
    // Filter Pill
    filterPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'transparent',
      backgroundColor: 'transparent',
      marginRight: 8,
    },
    
    filterPillActive: {
      backgroundColor: '#1B2A4A',
      borderColor: '#1B2A4A',
    },
    
    filterPillText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: '#2D2D2D',
    },
    
    filterPillTextActive: {
      color: '#FFFFFF',
    },
    
    // Status Badge
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '600' as const,
    },
    
    // Section Header
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700' as const,
      color: '#9E9E9E',
      textTransform: 'uppercase' as const,
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    
    // Page Title
    pageTitle: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: '#1B2A4A',
    },
    
    // Page Subtitle
    pageSubtitle: {
      fontSize: 13,
      fontWeight: '400' as const,
      color: '#9E9E9E',
      marginTop: 4,
    },
    
    // Stat Number (large display numbers)
    statNumber: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: '#1B2A4A',
    },
    
    // Icon Container (circular)
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    iconContainerSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  },

  // ==================== STATUS COLORS ====================
  status: {
    available: {
      background: '#E8F5E9',
      text: '#2E7D32',
    },
    onTrip: {
      background: '#E0F2F7',
      text: '#3A7D8C',
    },
    assigned: {
      background: '#E3F2FD',
      text: '#1B2A4A',
    },
    maintenance: {
      background: '#FFF8E1',
      text: '#F59E0B',
    },
    delayed: {
      background: '#FFF4E6',
      text: '#E07B2A',
    },
    scheduled: {
      background: '#F5F5F5',
      text: '#9E9E9E',
    },
    inTransit: {
      background: '#E0F2F7',
      text: '#3A7D8C',
    },
    completed: {
      background: '#E8F5E9',
      text: '#2E7D32',
    },
    cancelled: {
      background: '#FFEBEE',
      text: '#D32F2F',
    },
  },

  // ==================== HELPER FUNCTIONS ====================
  helpers: {
    // Get status badge style
    getStatusStyle: (status: string) => {
      const statusMap: Record<string, { background: string; text: string }> = {
        available: { background: '#E8F5E9', text: '#2E7D32' },
        'on trip': { background: '#E0F2F7', text: '#3A7D8C' },
        'on-trip': { background: '#E0F2F7', text: '#3A7D8C' },
        assigned: { background: '#E3F2FD', text: '#1B2A4A' },
        maintenance: { background: '#FFF8E1', text: '#F59E0B' },
        delayed: { background: '#FFF4E6', text: '#E07B2A' },
        scheduled: { background: '#F5F5F5', text: '#9E9E9E' },
        'in transit': { background: '#E0F2F7', text: '#3A7D8C' },
        'in-transit': { background: '#E0F2F7', text: '#3A7D8C' },
        completed: { background: '#E8F5E9', text: '#2E7D32' },
        cancelled: { background: '#FFEBEE', text: '#D32F2F' },
      };
      
      const normalizedStatus = status.toLowerCase().trim();
      return statusMap[normalizedStatus] || { background: '#F5F5F5', text: '#9E9E9E' };
    },
    
    // Get icon background color by type
    getIconBackground: (type: 'teal' | 'navy' | 'orange' | 'green' | 'amber' | 'red') => {
      const colorMap = {
        teal: '#E0F2F7',
        navy: '#E3F2FD',
        orange: '#FFF4E6',
        green: '#E8F5E9',
        amber: '#FFF8E1',
        red: '#FFEBEE',
      };
      return colorMap[type] || '#F5F5F5';
    },
    
    // Get icon color by type
    getIconColor: (type: 'teal' | 'navy' | 'orange' | 'green' | 'amber' | 'red') => {
      const colorMap = {
        teal: '#3A7D8C',
        navy: '#1B2A4A',
        orange: '#E07B2A',
        green: '#2E7D32',
        amber: '#F59E0B',
        red: '#D32F2F',
      };
      return colorMap[type] || '#9E9E9E';
    },
  },
};

// Export individual sections for convenience
export const COLORS = DESIGN_SYSTEM.colors;
export const TYPOGRAPHY = DESIGN_SYSTEM.typography;
export const SPACING = DESIGN_SYSTEM.spacing;
export const BORDER_RADIUS = DESIGN_SYSTEM.borderRadius;
export const SHADOWS = DESIGN_SYSTEM.shadows;
export const COMPONENTS = DESIGN_SYSTEM.components;
export const STATUS = DESIGN_SYSTEM.status;
export const HELPERS = DESIGN_SYSTEM.helpers;

// Export default
export default DESIGN_SYSTEM;
