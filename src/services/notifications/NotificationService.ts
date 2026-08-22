/**
 * Notification Service
 * 
 * Handles push notifications and in-app notifications for all events:
 * - Trip assignments, updates, and completions
 * - GPS and maintenance alerts
 * - Payroll and cash advance notifications
 * - Fuel irregularities and incidents
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
  PushNotificationToken,
  NotificationTemplate,
  NOTIFICATION_TEMPLATES,
} from '../../types/notification.types';

const NOTIFICATIONS_KEY = '@vone_notifications';
const PREFERENCES_KEY = '@vone_notification_preferences';
const TOKENS_KEY = '@vone_push_tokens';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private pushToken: string | null = null;

  /**
   * Initialize notification service
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Request permissions
      await this.requestPermissions();

      // Register for push notifications
      await this.registerForPushNotifications(userId);

      // Set up notification listeners
      this.setupNotificationListeners();

      // Clear expired notifications
      await this.clearExpiredNotifications();
    } catch (error) {
      console.error('[Notifications] Failed to initialize:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('[Notifications] Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Notifications] Push notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Notifications] Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(userId: string): Promise<void> {
    try {
      if (!Device.isDevice) {
        return;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // TODO: Replace with actual project ID
      });
      
      this.pushToken = tokenData.data;

      // Save token
      const token: PushNotificationToken = {
        user_id: userId,
        token: this.pushToken,
        platform: Platform.OS as 'ios' | 'android',
        device_id: Device.modelId || 'unknown',
        registered_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      };

      await this.savePushToken(token);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Vone Trucking',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B82F6',
        });
      }

      console.log('[Notifications] Registered for push notifications:', this.pushToken);
    } catch (error) {
      console.error('[Notifications] Failed to register for push notifications:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notifications] Received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notifications] Response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Create and send notification
   */
  async sendNotification(
    type: NotificationType,
    recipientId: string,
    recipientRole: Notification['recipient_role'],
    data: any
  ): Promise<Notification> {
    try {
      // Get template
      const templates = await import('../../types/notification.types');
      const template = templates.NOTIFICATION_TEMPLATES[type];

      // Replace template variables
      const title = this.replaceTemplateVariables(template.title_template, data);
      const body = this.replaceTemplateVariables(template.body_template, data);
      const actionUrl = template.action_url_template 
        ? this.replaceTemplateVariables(template.action_url_template, data)
        : undefined;

      // Create notification
      const notification: Notification = {
        id: this.generateId(),
        type,
        title,
        body,
        priority: template.priority,
        recipient_id: recipientId,
        recipient_role: recipientRole,
        data,
        is_read: false,
        is_delivered: false,
        action_url: actionUrl,
        created_at: new Date().toISOString(),
      };

      // Save to storage
      await this.saveNotification(notification);

      // Check preferences
      const preferences = await this.getPreferences(recipientId);
      if (!this.shouldSendNotification(type, preferences)) {
        console.log('[Notifications] Notification blocked by preferences:', type);
        return notification;
      }

      // Send push notification
      await this.sendPushNotification(notification);

      return notification;
    } catch (error) {
      console.error('[Notifications] Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: true,
          priority: this.getPushPriority(notification.priority),
        },
        trigger: null, // Send immediately
      });

      // Update delivered status
      notification.is_delivered = true;
      notification.delivered_at = new Date().toISOString();
      await this.updateNotification(notification);
    } catch (error) {
      console.error('[Notifications] Failed to send push notification:', error);
    }
  }

  /**
   * Convenience methods for specific notification types
   */

  async notifyTripAssignment(
    employeeId: string,
    role: 'driver' | 'porter',
    tripData: any
  ): Promise<void> {
    await this.sendNotification('trip_assignment', employeeId, role, {
      trip_id: tripData.id,
      trip_number: tripData.trip_number,
      destination: tripData.destination,
    });
  }

  async notifyTripUpdate(
    employeeId: string,
    role: 'driver' | 'porter',
    tripData: any
  ): Promise<void> {
    await this.sendNotification('trip_update', employeeId, role, {
      trip_id: tripData.id,
      trip_number: tripData.trip_number,
    });
  }

  async notifyTripCancelled(
    employeeId: string,
    role: 'driver' | 'porter',
    tripData: any
  ): Promise<void> {
    await this.sendNotification('trip_cancelled', employeeId, role, {
      trip_id: tripData.id,
      trip_number: tripData.trip_number,
      destination: tripData.destination,
    });
  }

  async notifyUpcomingSchedule(
    employeeId: string,
    role: 'driver' | 'porter',
    tripData: any
  ): Promise<void> {
    await this.sendNotification('upcoming_schedule', employeeId, role, {
      trip_id: tripData.id,
      schedule_date: new Date(tripData.scheduled_date).toLocaleDateString(),
      destination: tripData.destination,
    });
  }

  async notifyTripDelayed(
    operatorId: string,
    tripData: any
  ): Promise<void> {
    await this.sendNotification('trip_delayed', operatorId, 'operator', {
      trip_id: tripData.id,
      trip_number: tripData.trip_number,
    });
  }

  async notifyDriverArrival(
    operatorId: string,
    driverName: string,
    location: string,
    tripId: string
  ): Promise<void> {
    await this.sendNotification('driver_arrival', operatorId, 'operator', {
      trip_id: tripId,
      driver_name: driverName,
      location,
    });
  }

  async notifyDeliveryCompleted(
    operatorId: string,
    tripData: any
  ): Promise<void> {
    await this.sendNotification('delivery_completed', operatorId, 'operator', {
      trip_id: tripData.id,
      trip_number: tripData.trip_number,
      destination: tripData.destination,
    });
  }

  async notifyGoogleSheetsImport(
    operatorId: string,
    count: number
  ): Promise<void> {
    await this.sendNotification('google_sheets_schedule', operatorId, 'operator', {
      count,
    });
  }

  async notifyGPSDisconnection(
    operatorId: string,
    truckName: string,
    truckId: string,
    hours: number
  ): Promise<void> {
    await this.sendNotification('gps_disconnection', operatorId, 'operator', {
      truck_id: truckId,
      truck_name: truckName,
      hours,
    });
  }

  async notifyMaintenanceDue(
    operatorId: string,
    truckName: string,
    truckId: string,
    maintenanceType: string
  ): Promise<void> {
    await this.sendNotification('maintenance_due', operatorId, 'operator', {
      truck_id: truckId,
      truck_name: truckName,
      maintenance_type: maintenanceType,
    });
  }

  async notifyDocumentExpiring(
    recipientId: string,
    role: Notification['recipient_role'],
    documentType: string,
    entityName: string,
    days: number
  ): Promise<void> {
    await this.sendNotification('document_expiring', recipientId, role, {
      document_type: documentType,
      entity_name: entityName,
      days,
    });
  }

  async notifyPayrollAvailable(
    employeeId: string,
    period: string,
    payrollId: string
  ): Promise<void> {
    await this.sendNotification('payroll_available', employeeId, 'driver', {
      payroll_id: payrollId,
      period,
    });
  }

  async notifyCashAdvanceUpdate(
    employeeId: string,
    cashAdvanceId: string,
    amount: number,
    status: string
  ): Promise<void> {
    await this.sendNotification('cash_advance_update', employeeId, 'driver', {
      cash_advance_id: cashAdvanceId,
      amount,
      status,
    });
  }

  async notifyFuelIrregularity(
    operatorId: string,
    tripNumber: string,
    tripId: string
  ): Promise<void> {
    await this.sendNotification('fuel_irregularity', operatorId, 'operator', {
      trip_id: tripId,
      trip_number: tripNumber,
    });
  }

  async notifyIncidentReport(
    operatorId: string,
    tripNumber: string,
    incidentId: string
  ): Promise<void> {
    await this.sendNotification('incident_report', operatorId, 'operator', {
      incident_id: incidentId,
      trip_number: tripNumber,
    });
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(
    userId: string,
    includeRead: boolean = false
  ): Promise<Notification[]> {
    try {
      const allNotifications = await this.getAllNotifications();
      
      let notifications = allNotifications.filter(n => n.recipient_id === userId);
      
      if (!includeRead) {
        notifications = notifications.filter(n => !n.is_read);
      }

      // Sort by created date, newest first
      notifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return notifications;
    } catch (error) {
      console.error('[Notifications] Failed to get user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const notification = notifications.find(n => n.id === notificationId);
      
      if (notification && !notification.is_read) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        await this.updateNotification(notification);
      }
    } catch (error) {
      console.error('[Notifications] Failed to mark as read:', error);
    }
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const userNotifications = notifications.filter(
        n => n.recipient_id === userId && !n.is_read
      );

      const now = new Date().toISOString();
      for (const notification of userNotifications) {
        notification.is_read = true;
        notification.read_at = now;
      }

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('[Notifications] Failed to mark all as read:', error);
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId, false);
      return notifications.length;
    } catch (error) {
      console.error('[Notifications] Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (!data) {
        return this.getDefaultPreferences(userId);
      }

      const allPreferences = JSON.parse(data);
      const userPreferences = allPreferences[userId];

      return userPreferences || this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('[Notifications] Failed to get preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    try {
      preferences.updated_at = new Date().toISOString();

      const data = await AsyncStorage.getItem(PREFERENCES_KEY);
      const allPreferences = data ? JSON.parse(data) : {};
      
      allPreferences[preferences.user_id] = preferences;
      
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPreferences));
    } catch (error) {
      console.error('[Notifications] Failed to update preferences:', error);
    }
  }

  /**
   * Helper methods
   */
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      user_id: userId,
      push_enabled: true,
      push_sound_enabled: true,
      push_vibrate_enabled: true,
      trip_notifications: true,
      schedule_notifications: true,
      delivery_notifications: true,
      gps_notifications: true,
      maintenance_notifications: true,
      document_notifications: true,
      payroll_notifications: true,
      cash_advance_notifications: true,
      fuel_notifications: true,
      incident_notifications: true,
      quiet_hours_enabled: false,
      updated_at: new Date().toISOString(),
    };
  }

  private shouldSendNotification(
    type: NotificationType,
    preferences: NotificationPreferences
  ): boolean {
    if (!preferences.push_enabled) {
      return false;
    }

    // Check quiet hours
    if (preferences.quiet_hours_enabled && this.isQuietHours(preferences)) {
      return false;
    }

    // Check type-specific preferences
    const typeMap: Record<string, keyof NotificationPreferences> = {
      trip_assignment: 'trip_notifications',
      trip_update: 'trip_notifications',
      trip_cancelled: 'trip_notifications',
      upcoming_schedule: 'schedule_notifications',
      trip_delayed: 'trip_notifications',
      driver_arrival: 'trip_notifications',
      delivery_completed: 'delivery_notifications',
      google_sheets_schedule: 'schedule_notifications',
      gps_disconnection: 'gps_notifications',
      maintenance_due: 'maintenance_notifications',
      document_expiring: 'document_notifications',
      payroll_available: 'payroll_notifications',
      cash_advance_update: 'cash_advance_notifications',
      fuel_irregularity: 'fuel_notifications',
      incident_report: 'incident_notifications',
    };

    const prefKey = typeMap[type];
    return prefKey ? preferences[prefKey] as boolean : true;
  }

  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= preferences.quiet_hours_start && 
           currentTime <= preferences.quiet_hours_end;
  }

  private replaceTemplateVariables(template: string, data: any): string {
    let result = template;
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return result;
  }

  private getPushPriority(priority: NotificationPriority): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'urgent':
        return Notifications.AndroidNotificationPriority.MAX;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      case 'normal':
        return Notifications.AndroidNotificationPriority.DEFAULT;
      case 'low':
        return Notifications.AndroidNotificationPriority.LOW;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
    // Handle foreground notification
    console.log('[Notifications] Notification received in foreground');
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    // Handle notification tap
    const notification = response.notification;
    const data = notification.request.content.data;
    
    console.log('[Notifications] User tapped notification:', data);
    
    // TODO: Navigate to appropriate screen based on action_url
  }

  private async clearExpiredNotifications(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const now = new Date();

      const validNotifications = notifications.filter(n => {
        if (!n.expires_at) {
          return true;
        }
        return new Date(n.expires_at) > now;
      });

      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(validNotifications));
    } catch (error) {
      console.error('[Notifications] Failed to clear expired notifications:', error);
    }
  }

  /**
   * Storage helpers
   */
  private async getAllNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Notifications] Failed to get notifications:', error);
      return [];
    }
  }

  private async saveNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      notifications.push(notification);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('[Notifications] Failed to save notification:', error);
    }
  }

  private async updateNotification(notification: Notification): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const index = notifications.findIndex(n => n.id === notification.id);
      
      if (index >= 0) {
        notifications[index] = notification;
        await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('[Notifications] Failed to update notification:', error);
    }
  }

  private async savePushToken(token: PushNotificationToken): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(TOKENS_KEY);
      const tokens = data ? JSON.parse(data) : [];
      
      // Remove existing token for this user
      const filteredTokens = tokens.filter((t: PushNotificationToken) => 
        t.user_id !== token.user_id
      );
      
      filteredTokens.push(token);
      await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(filteredTokens));
    } catch (error) {
      console.error('[Notifications] Failed to save push token:', error);
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
