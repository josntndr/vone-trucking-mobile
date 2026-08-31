/**
 * Vone Trucking - Global Design System
 * Modern, premium design system for mobile app
 * Version: 2.0
 */

export const DESIGN_SYSTEM = {
  // ==================== COLORS ====================
  colors: {
    // Backgrounds
    background: '#0B1120',      // Deep modern slate canvas
    backgroundSecondary: '#111827',
    surface: '#1E293B',         // Executive dark surface card
    surfaceElevated: '#334155',
    
    // Primary Colors
    navy: '#0F1E36',           // Executive Deep Navy
    navyLight: '#1E293B',      // Slate Dark Navy
    teal: '#0EA5E9',           // Electric Cyan/Teal accent
    tealDark: '#0284C7',
    orange: '#F59E0B',         // Warm Amber/Orange highlight
    orangeDark: '#D97706',
    
    // Semantic Colors
    success: '#10B981',        // Emerald Green for success
    warning: '#F59E0B',        // Amber for warnings
    error: '#EF4444',          // Crimson for errors
    info: '#3B82F6',           // Modern Royal Blue for info
    
    // Text Colors
    text: '#F8FAFC',           // Crisp White Primary text
    textSecondary: '#94A3B8',  // Slate 400 Secondary text
    textTertiary: '#64748B',   // Slate 500 Tertiary text
    textMuted: '#94A3B8',      // Muted text
    textLight: '#CBD5E1',      // Light text
    
    // Additional Colors
    white: '#FFFFFF',
    border: '#334155',         // High-contrast clean dark border
    borderLight: '#475569',
    divider: '#334155',        // Dark divider
    overlay: 'rgba(11, 17, 32, 0.8)', // Deep modern overlay
    
    // Status Badge Backgrounds (dark pastel tints)
    statusAvailable: '#064E3B',      // Dark emerald
    statusOnTrip: '#1E3A5F',         // Dark cyan
    statusAssigned: '#1E3A5F',       // Dark blue
    statusMaintenance: '#3B2A10',    // Dark amber
    statusDelayed: '#451A1A',        // Dark red
    statusScheduled: '#1E293B',      // Dark slate
    
    // Alert Backgrounds
    alertWarningBg: '#2D2008',       // Dark amber background
    alertErrorBg: '#331111',         // Dark red background
    alertSuccessBg: '#064E3B',       // Dark emerald background
    alertInfoBg: '#1E3A5F',          // Dark cyan background
  },

  // ==================== TYPOGRAPHY ====================
  typography: {
    // Font Sizes
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 34,
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
    '2xl': 24,
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
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 1,
    },
    base: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
    lg: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 5,
    },
    fab: {
      shadowColor: '#0F1E36',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
  },

  // ==================== COMPONENT STYLES ====================
  components: {
    // Card Styles - Modern clean border with soft elevation
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      padding: 16,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    
    // Small Card (for stat cards)
    cardSmall: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      padding: 14,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    
    // Button - Primary
    buttonPrimary: {
      backgroundColor: '#0F1E36',
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 20,
      height: 52,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      shadowColor: '#0F1E36',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    
    buttonPrimaryText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
    },
    
    // Button - Secondary (Outlined)
    buttonSecondary: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 20,
      height: 52,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    buttonSecondaryText: {
      color: '#0F1E36',
      fontSize: 15,
      fontWeight: '600' as const,
    },
    
    // Button - Small (40px height)
    buttonSmall: {
      backgroundColor: '#F8FAFC',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 14,
      height: 40,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    buttonSmallText: {
      color: '#0F172A',
      fontSize: 13,
      fontWeight: '600' as const,
    },
    
    // FAB (Floating Action Button)
    fab: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#0EA5E9',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      position: 'absolute' as const,
      bottom: 24,
      right: 20,
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
    
    // Search Bar
    searchBar: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: '#E2E8F0',
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 10,
      height: 48,
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    
    searchBarText: {
      color: '#0F172A',
      fontSize: 14,
    },
    
    searchBarPlaceholder: {
      color: '#94A3B8',
      fontSize: 14,
    },
    
    // Filter Pill
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      backgroundColor: '#FFFFFF',
      marginRight: 8,
    },
    
    filterPillActive: {
      backgroundColor: '#0F1E36',
      borderColor: '#0F1E36',
    },
    
    filterPillText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: '#64748B',
    },
    
    filterPillTextActive: {
      color: '#FFFFFF',
    },
    
    // Status Badge
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
    },
    
    statusBadgeText: {
      fontSize: 11,
      fontWeight: '600' as const,
    },
    
    // Section Header
    sectionHeader: {
      fontSize: 12,
      fontWeight: '700' as const,
      color: '#64748B',
      textTransform: 'uppercase' as const,
      letterSpacing: 1,
      marginBottom: 12,
    },
    
    // Page Title
    pageTitle: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#0F172A',
      letterSpacing: -0.3,
    },
    
    // Page Subtitle
    pageSubtitle: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: '#64748B',
      marginTop: 4,
    },
    
    // Stat Number (large display numbers)
    statNumber: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: '#0F1E36',
      letterSpacing: -0.5,
    },
    
    // Icon Container (circular)
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    
    iconContainerSmall: {
      width: 38,
      height: 38,
      borderRadius: 12,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  },

  // ==================== STATUS COLORS ====================
  status: {
    available: {
      background: '#ECFDF5',
      text: '#059669',
    },
    onTrip: {
      background: '#F0F9FF',
      text: '#0284C7',
    },
    assigned: {
      background: '#EFF6FF',
      text: '#2563EB',
    },
    maintenance: {
      background: '#FFFBEB',
      text: '#D97706',
    },
    delayed: {
      background: '#FFF7ED',
      text: '#EA580C',
    },
    scheduled: {
      background: '#F1F5F9',
      text: '#64748B',
    },
    inTransit: {
      background: '#F0F9FF',
      text: '#0284C7',
    },
    completed: {
      background: '#ECFDF5',
      text: '#059669',
    },
    cancelled: {
      background: '#FEF2F2',
      text: '#DC2626',
    },
  },

  // ==================== HELPER FUNCTIONS ====================
  helpers: {
    // Get status badge style
    getStatusStyle: (status: string) => {
      const statusMap: Record<string, { background: string; text: string }> = {
        available: { background: '#ECFDF5', text: '#059669' },
        'on trip': { background: '#F0F9FF', text: '#0284C7' },
        'on-trip': { background: '#F0F9FF', text: '#0284C7' },
        assigned: { background: '#EFF6FF', text: '#2563EB' },
        maintenance: { background: '#FFFBEB', text: '#D97706' },
        delayed: { background: '#FFF7ED', text: '#EA580C' },
        scheduled: { background: '#F1F5F9', text: '#64748B' },
        'in transit': { background: '#F0F9FF', text: '#0284C7' },
        'in-transit': { background: '#F0F9FF', text: '#0284C7' },
        completed: { background: '#ECFDF5', text: '#059669' },
        cancelled: { background: '#FEF2F2', text: '#DC2626' },
      };
      
      const normalizedStatus = status.toLowerCase().trim();
      return statusMap[normalizedStatus] || { background: '#F1F5F9', text: '#64748B' };
    },
    
    // Get icon background color by type
    getIconBackground: (type: 'teal' | 'navy' | 'orange' | 'green' | 'amber' | 'red') => {
      const colorMap = {
        teal: '#F0F9FF',
        navy: '#EFF6FF',
        orange: '#FFF7ED',
        green: '#ECFDF5',
        amber: '#FFFBEB',
        red: '#FEF2F2',
      };
      return colorMap[type] || '#F1F5F9';
    },
    
    // Get icon color by type
    getIconColor: (type: 'teal' | 'navy' | 'orange' | 'green' | 'amber' | 'red') => {
      const colorMap = {
        teal: '#0284C7',
        navy: '#0F1E36',
        orange: '#EA580C',
        green: '#059669',
        amber: '#D97706',
        red: '#DC2626',
      };
      return colorMap[type] || '#64748B';
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
