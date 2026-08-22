/**
 * Incident Reporting Service
 * 
 * Manages incident report creation, photo/document uploads,
 * severity assignment, resolution tracking, and operator review.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type {
  IncidentReport,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  InvolvedEmployee,
  DocumentAttachment,
  GPSCoordinates,
  IncidentValidation,
  IncidentValidationRules,
  DEFAULT_INCIDENT_RULES,
} from '../../types/delivery.types';

const DRAFT_STORAGE_KEY = '@vone_incident_drafts';

interface CreateIncidentInput {
  incident_type: IncidentType;
  title: string;
  description: string;
  incident_date: string;
  reported_by: string;
  trip_id?: string;
  truck_id?: string;
  stop_id?: string;
  location_description?: string;
  immediate_action_taken?: string;
  involved_employees?: InvolvedEmployee[];
}

export class IncidentReportingService {
  private validationRules: IncidentValidationRules;

  constructor(validationRules?: Partial<IncidentValidationRules>) {
    this.validationRules = {
      ...DEFAULT_INCIDENT_RULES,
      ...validationRules,
    };
  }

  /**
   * Create new incident report
   */
  async createIncident(input: CreateIncidentInput): Promise<IncidentReport> {
    const incidentId = this.generateIncidentId();
    const now = new Date().toISOString();

    // Get current GPS coordinates
    const gpsCoordinates = await this.getCurrentGPSCoordinates();

    // Assign severity based on incident type
    const severity = this.assignSeverity(input.incident_type);

    const incident: IncidentReport = {
      id: incidentId,
      
      // Classification
      incident_type: input.incident_type,
      severity,
      status: 'reported',
      
      // Description
      title: input.title,
      description: input.description,
      
      // Context
      incident_date: input.incident_date,
      reported_at: now,
      reported_by: input.reported_by,
      
      // Location
      location_description: input.location_description,
      gps_coordinates: gpsCoordinates,
      
      // Related entities
      trip_id: input.trip_id,
      truck_id: input.truck_id,
      stop_id: input.stop_id,
      
      // Involved parties
      involved_employees: input.involved_employees || [],
      
      // Evidence
      photos: [],
      documents: [],
      
      // Actions
      immediate_action_taken: input.immediate_action_taken,
      
      // Follow-up
      follow_up_required: severity === 'high' || severity === 'critical',
      
      // Offline
      created_offline: !(await this.isOnline()),
      synced: false,
      sync_attempts: 0,
      
      // Timestamps
      created_at: now,
      updated_at: now,
    };

    // Save as draft initially
    await this.saveDraft(incident);

    return incident;
  }

  /**
   * Update incident report
   */
  async updateIncident(
    existingIncident: IncidentReport,
    updates: Partial<CreateIncidentInput>
  ): Promise<IncidentReport> {
    const updated: IncidentReport = {
      ...existingIncident,
      title: updates.title || existingIncident.title,
      description: updates.description || existingIncident.description,
      location_description: updates.location_description || existingIncident.location_description,
      immediate_action_taken: updates.immediate_action_taken || existingIncident.immediate_action_taken,
      involved_employees: updates.involved_employees || existingIncident.involved_employees,
      updated_at: new Date().toISOString(),
    };

    // Reassign severity if type changed
    if (updates.incident_type && updates.incident_type !== existingIncident.incident_type) {
      updated.incident_type = updates.incident_type;
      updated.severity = this.assignSeverity(updates.incident_type);
    }

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Add photo to incident
   */
  async addPhoto(
    incident: IncidentReport,
    photoUri: string,
    description?: string
  ): Promise<IncidentReport> {
    if (incident.photos.length >= this.validationRules.max_photos_count) {
      throw new Error(`Maximum ${this.validationRules.max_photos_count} photos allowed`);
    }

    const photo: DocumentAttachment = {
      id: this.generateAttachmentId(),
      local_uri: photoUri,
      filename: `incident_${incident.id}_${Date.now()}.jpg`,
      type: 'photo',
      uploaded: false,
      description,
      captured_at: new Date().toISOString(),
    };

    const updated: IncidentReport = {
      ...incident,
      photos: [...incident.photos, photo],
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Add document to incident
   */
  async addDocument(
    incident: IncidentReport,
    documentUri: string,
    filename: string,
    mimeType: string,
    description?: string
  ): Promise<IncidentReport> {
    const document: DocumentAttachment = {
      id: this.generateAttachmentId(),
      local_uri: documentUri,
      filename,
      type: 'document',
      mime_type: mimeType,
      uploaded: false,
      description,
      captured_at: new Date().toISOString(),
    };

    const updated: IncidentReport = {
      ...incident,
      documents: [...incident.documents, document],
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Remove attachment
   */
  async removeAttachment(
    incident: IncidentReport,
    attachmentId: string
  ): Promise<IncidentReport> {
    const updated: IncidentReport = {
      ...incident,
      photos: incident.photos.filter(p => p.id !== attachmentId),
      documents: incident.documents.filter(d => d.id !== attachmentId),
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Add involved employee
   */
  async addInvolvedEmployee(
    incident: IncidentReport,
    employee: InvolvedEmployee
  ): Promise<IncidentReport> {
    const updated: IncidentReport = {
      ...incident,
      involved_employees: [...incident.involved_employees, employee],
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Update incident severity
   */
  async updateSeverity(
    incident: IncidentReport,
    severity: IncidentSeverity
  ): Promise<IncidentReport> {
    const updated: IncidentReport = {
      ...incident,
      severity,
      follow_up_required: severity === 'high' || severity === 'critical',
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Update incident status
   */
  async updateStatus(
    incident: IncidentReport,
    status: IncidentStatus,
    resolutionNotes?: string,
    resolvedBy?: string
  ): Promise<IncidentReport> {
    const updated: IncidentReport = {
      ...incident,
      status,
      resolution_notes: resolutionNotes || incident.resolution_notes,
      updated_at: new Date().toISOString(),
    };

    if (status === 'resolved' || status === 'closed') {
      updated.resolved_by = resolvedBy;
      updated.resolved_at = new Date().toISOString();
    }

    // Don't save as draft if updating status (likely from operator)
    // This would be an API call in production
    console.log('[Incident] Status updated:', incident.id, status);

    return updated;
  }

  /**
   * Acknowledge incident (operator action)
   */
  async acknowledgeIncident(
    incident: IncidentReport,
    acknowledgedBy: string
  ): Promise<IncidentReport> {
    const updated: IncidentReport = {
      ...incident,
      status: 'acknowledged',
      acknowledged_by: acknowledgedBy,
      acknowledged_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('[Incident] Acknowledged by:', acknowledgedBy);

    return updated;
  }

  /**
   * Validate incident for submission
   */
  validateIncident(incident: IncidentReport): IncidentValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequired: string[] = [];

    // Required: Title
    if (!incident.title || incident.title.trim().length === 0) {
      errors.push('Incident title is required');
      missingRequired.push('title');
    }

    // Required: Description with minimum length
    if (!incident.description || incident.description.length < this.validationRules.min_description_length) {
      errors.push(`Description must be at least ${this.validationRules.min_description_length} characters`);
      missingRequired.push('description');
    }

    // Maximum description length
    if (incident.description && incident.description.length > this.validationRules.max_description_length) {
      errors.push(`Description exceeds maximum length (${this.validationRules.max_description_length})`);
    }

    // Required: Immediate action taken
    if (this.validationRules.require_immediate_action && !incident.immediate_action_taken) {
      errors.push('Immediate action taken is required');
      missingRequired.push('immediate_action_taken');
    }

    // Required: Photos (based on incident type)
    if (this.validationRules.require_photos) {
      if (incident.photos.length === 0) {
        errors.push('At least one photo is required');
        missingRequired.push('photos');
      }
    }

    // Warnings for critical incidents without photos
    if (incident.severity === 'critical' && incident.photos.length === 0) {
      warnings.push('Critical incidents should include photographic evidence');
    }

    // GPS coordinates
    if (this.validationRules.require_gps_coordinates && !incident.gps_coordinates) {
      warnings.push('GPS coordinates are recommended for accurate location tracking');
    }

    // Validate incident date
    const incidentDate = new Date(incident.incident_date);
    const now = new Date();
    if (incidentDate > now) {
      errors.push('Incident date cannot be in the future');
    }

    // Check if photos exceed count limit
    if (incident.photos.length > this.validationRules.max_photos_count) {
      errors.push(`Maximum ${this.validationRules.max_photos_count} photos allowed`);
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      missing_required: missingRequired,
      can_submit: errors.length === 0,
    };
  }

  /**
   * Submit incident report
   */
  async submitIncident(incident: IncidentReport): Promise<IncidentReport> {
    // Validate
    const validation = this.validateIncident(incident);
    if (!validation.is_valid) {
      throw new Error(`Cannot submit invalid incident: ${validation.errors.join(', ')}`);
    }

    const submitted: IncidentReport = {
      ...incident,
      status: 'reported',
      reported_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Remove from drafts
    await this.removeDraft(incident.id);

    // Save submission (or queue if offline)
    await this.saveSubmission(submitted);

    return submitted;
  }

  /**
   * Assign severity based on incident type
   */
  private assignSeverity(incidentType: IncidentType): IncidentSeverity {
    const severityMap: Record<IncidentType, IncidentSeverity> = {
      accident: 'critical',
      truck_breakdown: 'high',
      damaged_goods: 'medium',
      missing_goods: 'medium',
      rejected_delivery: 'medium',
      delivery_delay: 'low',
      route_problem: 'low',
      other: 'low',
    };

    return severityMap[incidentType];
  }

  /**
   * Save draft locally
   */
  async saveDraft(incident: IncidentReport): Promise<void> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      const drafts: Record<string, IncidentReport> = draftsJson ? JSON.parse(draftsJson) : {};

      drafts[incident.id] = incident;

      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      console.log('[Incident] Draft saved:', incident.id);
    } catch (error) {
      console.error('[Incident] Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  /**
   * Load draft
   */
  async loadDraft(incidentId: string): Promise<IncidentReport | null> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftsJson) return null;

      const drafts: Record<string, IncidentReport> = JSON.parse(draftsJson);
      return drafts[incidentId] || null;
    } catch (error) {
      console.error('[Incident] Failed to load draft:', error);
      return null;
    }
  }

  /**
   * Get all drafts
   */
  async getAllDrafts(): Promise<IncidentReport[]> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftsJson) return [];

      const drafts: Record<string, IncidentReport> = JSON.parse(draftsJson);
      return Object.values(drafts).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('[Incident] Failed to load drafts:', error);
      return [];
    }
  }

  /**
   * Remove draft
   */
  async removeDraft(incidentId: string): Promise<void> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftsJson) return;

      const drafts: Record<string, IncidentReport> = JSON.parse(draftsJson);
      delete drafts[incidentId];

      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      console.log('[Incident] Draft removed:', incidentId);
    } catch (error) {
      console.error('[Incident] Failed to remove draft:', error);
    }
  }

  /**
   * Capture photo from camera
   */
  async capturePhoto(): Promise<string | null> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      exif: true,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

    return null;
  }

  /**
   * Pick document
   */
  async pickDocument(): Promise<{ uri: string; name: string; mimeType: string } | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      return {
        uri: result.assets[0].uri,
        name: result.assets[0].name,
        mimeType: result.assets[0].mimeType || 'application/octet-stream',
      };
    }

    return null;
  }

  /**
   * Get current GPS coordinates
   */
  async getCurrentGPSCoordinates(): Promise<GPSCoordinates | undefined> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('[Incident] Location permission not granted');
        return undefined;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        altitude: location.coords.altitude || undefined,
        timestamp: new Date(location.timestamp).toISOString(),
      };
    } catch (error) {
      console.error('[Incident] Failed to get GPS coordinates:', error);
      return undefined;
    }
  }

  /**
   * Check if device is online
   */
  private async isOnline(): Promise<boolean> {
    // TODO: Implement actual network check
    return true;
  }

  /**
   * Save submission
   */
  private async saveSubmission(incident: IncidentReport): Promise<void> {
    // TODO: Implement actual API call or offline queue
    console.log('[Incident] Submission saved:', incident.id);
  }

  /**
   * Generate unique incident ID
   */
  private generateIncidentId(): string {
    return `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique attachment ID
   */
  private generateAttachmentId(): string {
    return `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const incidentReportingService = new IncidentReportingService();
