/**
 * Analytics Type Definitions
 * 
 * Types for dashboard metrics, trip profit calculations, reports, and filters
 */

export interface TripProfitCalculation {
  trip_id: string;
  trip_income: number;
  total_expenses: number;
  net_profit: number;
  expense_breakdown: {
    fuel: number;
    toll: number;
    parking: number;
    maintenance: number;
    other: number;
  };
  profit_margin_percentage: number;
}

export interface DashboardMetrics {
  // Trip Status Counts
  active_trips: number;
  scheduled_trips: number;
  completed_trips: number;
  delayed_trips: number;
  
  // Truck Status Counts
  available_trucks: number;
  trucks_on_trips: number;
  trucks_under_maintenance: number;
  
  // Financial Metrics
  weekly_trip_income: number;
  monthly_trip_income: number;
  weekly_expenses: number;
  monthly_expenses: number;
  weekly_net_profit: number;
  monthly_net_profit: number;
  
  // Expense Breakdown
  fuel_expenses: number;
  payroll_costs: number;
  outstanding_cash_advances: number;
  
  // Utilization and Performance
  truck_utilization_percentage: number;
  estimated_vs_actual_fuel_variance: number;
  on_time_delivery_rate: number;
  
  // Destinations
  frequent_destinations: Array<{
    destination: string;
    trip_count: number;
    total_income: number;
  }>;
  
  // Alerts
  expiring_documents_count: number;
  maintenance_reminders_count: number;
  offline_gps_devices_count: number;
  
  // Metadata
  calculated_at: string;
  date_range_start: string;
  date_range_end: string;
}

export interface DateFilter {
  type: 'today' | 'this_week' | 'this_month' | 'custom';
  start_date?: string;
  end_date?: string;
}

export interface DashboardFilters {
  date_filter: DateFilter;
  truck_id?: string;
  driver_id?: string;
  porter_id?: string;
  destination?: string;
}

export interface TripMetrics {
  total_trips: number;
  completed_trips: number;
  in_progress_trips: number;
  scheduled_trips: number;
  delayed_trips: number;
  cancelled_trips: number;
  average_trip_duration_hours: number;
  on_time_percentage: number;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  average_profit_per_trip: number;
  
  income_breakdown: {
    trip_fees: number;
    additional_charges: number;
    other: number;
  };
  
  expense_breakdown: {
    fuel: number;
    payroll: number;
    maintenance: number;
    tolls: number;
    parking: number;
    other: number;
  };
}

export interface TruckUtilization {
  truck_id: string;
  truck_name: string;
  total_trips: number;
  active_days: number;
  utilization_percentage: number;
  total_income: number;
  total_expenses: number;
  net_profit: number;
}

export interface DriverPerformance {
  driver_id: string;
  driver_name: string;
  total_trips: number;
  completed_trips: number;
  on_time_deliveries: number;
  on_time_percentage: number;
  total_income_generated: number;
  fuel_efficiency_rating: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface MaintenanceAlert {
  id: string;
  truck_id: string;
  truck_name: string;
  alert_type: 'due' | 'overdue' | 'upcoming';
  maintenance_type: string;
  due_date: string;
  days_until_due: number;
  priority: 'high' | 'medium' | 'low';
}

export interface DocumentExpiryAlert {
  id: string;
  entity_type: 'truck' | 'driver' | 'porter';
  entity_id: string;
  entity_name: string;
  document_type: string;
  expiry_date: string;
  days_until_expiry: number;
  status: 'expired' | 'expiring_soon' | 'upcoming';
}

export interface GPSHealthStatus {
  device_id: string;
  truck_id: string;
  truck_name: string;
  status: 'online' | 'offline' | 'poor_signal';
  last_update: string;
  hours_since_update: number;
}

export interface FuelAnalysis {
  estimated_total: number;
  actual_total: number;
  variance: number;
  variance_percentage: number;
  trip_count: number;
  
  trips_with_variance: Array<{
    trip_id: string;
    destination: string;
    estimated: number;
    actual: number;
    variance: number;
    variance_percentage: number;
  }>;
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  category: 'trip' | 'delivery' | 'fuel' | 'expense' | 'payroll' | 'maintenance' | 'incident' | 'financial';
  supports_pdf: boolean;
  supports_spreadsheet: boolean;
}

export interface ReportFilters {
  date_range_start: string;
  date_range_end: string;
  truck_ids?: string[];
  driver_ids?: string[];
  porter_ids?: string[];
  destinations?: string[];
  status?: string[];
}

export interface ReportData {
  report_type: ReportType;
  filters: ReportFilters;
  generated_at: string;
  generated_by: string;
  data: any; // Flexible data structure based on report type
  summary: {
    total_records: number;
    [key: string]: any;
  };
}

export const REPORT_TYPES: ReportType[] = [
  {
    id: 'trip_report',
    name: 'Trip Report',
    description: 'Comprehensive trip details with income and expenses',
    category: 'trip',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'delivery_report',
    name: 'Delivery Report',
    description: 'Proof of delivery with customer signatures and photos',
    category: 'delivery',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'fuel_report',
    name: 'Fuel Report',
    description: 'Fuel purchases with receipts and efficiency analysis',
    category: 'fuel',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'truck_expense_report',
    name: 'Truck Expense Report',
    description: 'All expenses per truck with categorization',
    category: 'expense',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'payroll_report',
    name: 'Payroll Report',
    description: 'Employee compensation with breakdown',
    category: 'payroll',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'cash_advance_report',
    name: 'Cash Advance Statement',
    description: 'Cash advance requests and repayment status',
    category: 'payroll',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'employee_trip_report',
    name: 'Employee Trip Report',
    description: 'Trip history per employee',
    category: 'trip',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'maintenance_report',
    name: 'Maintenance Report',
    description: 'Maintenance history and upcoming schedules',
    category: 'maintenance',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'incident_report',
    name: 'Incident Report',
    description: 'Incidents and accidents with details',
    category: 'incident',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
  {
    id: 'income_profit_report',
    name: 'Income and Profit Report',
    description: 'Financial summary with profit margins',
    category: 'financial',
    supports_pdf: true,
    supports_spreadsheet: true,
  },
];
