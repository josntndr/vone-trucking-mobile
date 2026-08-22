/**
 * Notification Type Definitions
 * 
 * Types for push notifications and in-app notifications
 */

export type NotificationType =
  | 'trip_assignment'
  | 'trip_update'
  | 'trip_cancelled'
  | 'upcoming_schedule'
  | 'trip_delayed'
  | 'driver_arrival'
  | 'delivery_completed'
  | 'google_sheets_schedule'
  | 'gps_disconnection'
  | 'maintenance_due'
  | 'document_expiring'
  | 'payroll_available'
  | 'cash_advance_update'
  | 'fuel_irregularity'
  | 'incident_report';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  
  // Targeting
  recipient_id: string; // User ID
  recipient_role: 'driver' | 'porter' | 'operator' | 'all';
  
  // Data payload
  data?: {
    trip_id?: string;
    truck_id?: string;
    employee_id?: string;
    payroll_period_id?: string;
    cash_advance_id?: string;
    [key: string]: any;
  };
  
  // Status
  is_read: boolean;
  is_delivered: boolean;
  
  // Actions
  action_url?: string; // Deep link to specific screen
  action_buttons?: Array<{
    id: string;
    label: string;
    action: string;
  }>;
  
  // Timestamps
  created_at: string;
  delivered_at?: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  
  // Push notification settings
  push_enabled: boolean;
  push_sound_enabled: boolean;
  push_vibrate_enabled: boolean;
  
  // Notification type preferences
  trip_notifications: boolean;
  schedule_notifications: boolean;
  delivery_notifications: boolean;
  gps_notifications: boolean;
  maintenance_notifications: boolean;
  document_notifications: boolean;
  payroll_notifications: boolean;
  cash_advance_notifications: boolean;
  fuel_notifications: boolean;
  incident_notifications: boolean;
  
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // HH:mm format
  quiet_hours_end?: string; // HH:mm format
  
  updated_at: string;
}

export interface PushNotificationToken {
  user_id: string;
  token: string;
  platform: 'ios' | 'android';
  device_id: string;
  registered_at: string;
  last_used_at: string;
}

export interface NotificationTemplate {
  type: NotificationType;
  title_template: string;
  body_template: string;
  priority: NotificationPriority;
  action_url_template?: string;
}

export const NOTIFICATION_TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  trip_assignment: {
    type: 'trip_assignment',
    title_template: 'New Trip Assignment',
    body_template: 'You have been assigned to trip {{trip_number}} to {{destination}}',
    priority: 'high',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  trip_update: {
    type: 'trip_update',
    title_template: 'Trip Updated',
    body_template: 'Trip {{trip_number}} has been updated',
    priority: 'normal',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  trip_cancelled: {
    type: 'trip_cancelled',
    title_template: 'Trip Cancelled',
    body_template: 'Trip {{trip_number}} to {{destination}} has been cancelled',
    priority: 'high',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  upcoming_schedule: {
    type: 'upcoming_schedule',
    title_template: 'Upcoming Trip',
    body_template: 'You have a trip scheduled for {{schedule_date}} to {{destination}}',
    priority: 'normal',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  trip_delayed: {
    type: 'trip_delayed',
    title_template: 'Trip Delayed',
    body_template: 'Trip {{trip_number}} is running behind schedule',
    priority: 'high',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  driver_arrival: {
    type: 'driver_arrival',
    title_template: 'Driver Arrived',
    body_template: '{{driver_name}} has arrived at {{location}}',
    priority: 'normal',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  delivery_completed: {
    type: 'delivery_completed',
    title_template: 'Delivery Completed',
    body_template: 'Trip {{trip_number}} to {{destination}} has been completed',
    priority: 'normal',
    action_url_template: 'voneTrucking://trip/{{trip_id}}',
  },
  google_sheets_schedule: {
    type: 'google_sheets_schedule',
    title_template: 'New Schedules Imported',
    body_template: '{{count}} new trips have been imported from Google Sheets',
    priority: 'normal',
    action_url_template: 'voneTrucking://trips',
  },
  gps_disconnection: {
    type: 'gps_disconnection',
    title_template: 'GPS Device Offline',
    body_template: 'GPS device for {{truck_name}} has been offline for {{hours}} hours',
    priority: 'high',
    action_url_template: 'voneTrucking://truck/{{truck_id}}',
  },
  maintenance_due: {
    type: 'maintenance_due',
    title_template: 'Maintenance Due',
    body_template: '{{truck_name}} requires {{maintenance_type}} maintenance',
    priority: 'high',
    action_url_template: 'voneTrucking://truck/{{truck_id}}/maintenance',
  },
  document_expiring: {
    type: 'document_expiring',
    title_template: 'Document Expiring Soon',
    body_template: '{{document_type}} for {{entity_name}} expires in {{days}} days',
    priority: 'high',
    action_url_template: 'voneTrucking://documents',
  },
  payroll_available: {
    type: 'payroll_available',
    title_template: 'Payslip Available',
    body_template: 'Your payslip for {{period}} is now available',
    priority: 'normal',
    action_url_template: 'voneTrucking://payroll/payslip/{{payroll_id}}',
  },
  cash_advance_update: {
    type: 'cash_advance_update',
    title_template: 'Cash Advance {{status}}',
    body_template: 'Your cash advance request for ${{amount}} has been {{status}}',
    priority: 'high',
    action_url_template: 'voneTrucking://cashAdvance/{{cash_advance_id}}',
  },
  fuel_irregularity: {
    type: 'fuel_irregularity',
    title_template: 'Fuel Irregularity Detected',
    body_template: 'Unusual fuel consumption detected for trip {{trip_number}}',
    priority: 'high',
    action_url_template: 'voneTrucking://trip/{{trip_id}}/fuel',
  },
  incident_report: {
    type: 'incident_report',
    title_template: 'New Incident Report',
    body_template: 'An incident has been reported for trip {{trip_number}}',
    priority: 'urgent',
    action_url_template: 'voneTrucking://incident/{{incident_id}}',
  },
};
