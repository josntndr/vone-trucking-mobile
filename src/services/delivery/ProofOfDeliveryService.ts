/**
 * Proof of Delivery Service
 * 
 * Manages POD creation, draft saving, submission, validation,
 * photo uploads, signature capture, and GPS tracking.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import type {
  ProofOfDelivery,
  PhotoAttachment,
  DigitalSignature,
  DeliveryItem,
  GPSCoordinates,
  PODValidation,
  PODValidationRules,
  LocationVerification,
  DuplicateCheckResult,
} from '../../types/delivery.types';
import {
  DEFAULT_POD_RULES,
} from '../../types/delivery.types';

const DRAFT_STORAGE_KEY = '@vone_pod_drafts';
const DUPLICATE_CHECK_WINDOW_HOURS = 24;

interface CreatePODInput {
  trip_id: string;
  stop_id: string;
  driver_id: string;
  porter_id?: string;
  receiver_name: string;
  receiver_title?: string;
  receiver_phone?: string;
  receiver_email?: string;
  arrival_time: string;
  delivery_location: string;
  items: DeliveryItem[];
  delivery_notes?: string;
  special_instructions?: string;
}

export class ProofOfDeliveryService {
  private validationRules: PODValidationRules;

  constructor(validationRules?: Partial<PODValidationRules>) {
    this.validationRules = {
      ...DEFAULT_POD_RULES,
      ...validationRules,
    };
  }

  /**
   * Create new POD (draft)
   */
  async createPOD(input: CreatePODInput): Promise<ProofOfDelivery> {
    const podId = this.generatePODId();
    const now = new Date().toISOString();

    // Get current GPS coordinates
    const gpsCoordinates = await this.getCurrentGPSCoordinates();

    // Calculate item summaries
    const itemSummary = this.calculateItemSummary(input.items);

    const pod: ProofOfDelivery = {
      id: podId,
      trip_id: input.trip_id,
      stop_id: input.stop_id,
      driver_id: input.driver_id,
      porter_id: input.porter_id,
      
      // Receiver
      receiver_name: input.receiver_name,
      receiver_title: input.receiver_title,
      receiver_phone: input.receiver_phone,
      receiver_email: input.receiver_email,
      
      // Timing
      arrival_time: input.arrival_time,
      completion_time: now,
      
      // Location
      delivery_location: input.delivery_location,
      gps_coordinates: gpsCoordinates,
      location_verified: false,
      
      // Attachments
      product_photos: [],
      additional_photos: [],
      
      // Items
      items: input.items,
      delivery_notes: input.delivery_notes,
      special_instructions: input.special_instructions,
      
      // Item summaries
      ...itemSummary,
      
      // Status
      status: 'draft',
      is_draft: true,
      
      // Offline
      created_offline: !(await this.isOnline()),
      synced: false,
      sync_attempts: 0,
      
      // Timestamps
      created_at: now,
      updated_at: now,
      draft_saved_at: now,
    };

    // Save draft locally
    await this.saveDraft(pod);

    return pod;
  }

  /**
   * Update existing POD
   */
  async updatePOD(
    existingPOD: ProofOfDelivery,
    updates: Partial<CreatePODInput>
  ): Promise<ProofOfDelivery> {
    if (existingPOD.status !== 'draft' && existingPOD.status !== 'correction_required') {
      throw new Error('Cannot update POD that is not in draft or correction_required status');
    }

    const updated: ProofOfDelivery = {
      ...existingPOD,
      receiver_name: updates.receiver_name || existingPOD.receiver_name,
      receiver_title: updates.receiver_title || existingPOD.receiver_title,
      receiver_phone: updates.receiver_phone || existingPOD.receiver_phone,
      receiver_email: updates.receiver_email || existingPOD.receiver_email,
      delivery_location: updates.delivery_location || existingPOD.delivery_location,
      delivery_notes: updates.delivery_notes || existingPOD.delivery_notes,
      special_instructions: updates.special_instructions || existingPOD.special_instructions,
      items: updates.items || existingPOD.items,
      updated_at: new Date().toISOString(),
    };

    // Recalculate item summaries if items changed
    if (updates.items) {
      const itemSummary = this.calculateItemSummary(updates.items);
      Object.assign(updated, itemSummary);
    }

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Add receipt photo
   */
  async addReceiptPhoto(
    pod: ProofOfDelivery,
    photoUri: string
  ): Promise<ProofOfDelivery> {
    const photo: PhotoAttachment = {
      id: this.generatePhotoId(),
      local_uri: photoUri,
      filename: `receipt_${pod.id}_${Date.now()}.jpg`,
      type: 'receipt',
      uploaded: false,
      captured_at: new Date().toISOString(),
    };

    const updated: ProofOfDelivery = {
      ...pod,
      receipt_photo: photo,
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Add signature
   */
  async addSignature(
    pod: ProofOfDelivery,
    signatureData: string,
    signerName: string
  ): Promise<ProofOfDelivery> {
    const signature: DigitalSignature = {
      id: this.generateSignatureId(),
      signature_data: signatureData,
      signer_name: signerName,
      signed_at: new Date().toISOString(),
      uploaded: false,
    };

    const updated: ProofOfDelivery = {
      ...pod,
      signature,
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Add product photo
   */
  async addProductPhoto(
    pod: ProofOfDelivery,
    photoUri: string,
    itemId?: string
  ): Promise<ProofOfDelivery> {
    const photo: PhotoAttachment = {
      id: this.generatePhotoId(),
      local_uri: photoUri,
      filename: `product_${pod.id}_${Date.now()}.jpg`,
      type: 'product',
      uploaded: false,
      captured_at: new Date().toISOString(),
    };

    const updated: ProofOfDelivery = {
      ...pod,
      product_photos: [...pod.product_photos, photo],
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Remove photo
   */
  async removePhoto(
    pod: ProofOfDelivery,
    photoId: string
  ): Promise<ProofOfDelivery> {
    const updated: ProofOfDelivery = {
      ...pod,
      product_photos: pod.product_photos.filter(p => p.id !== photoId),
      additional_photos: pod.additional_photos.filter(p => p.id !== photoId),
      updated_at: new Date().toISOString(),
    };

    // Clear receipt if it matches
    if (pod.receipt_photo?.id === photoId) {
      updated.receipt_photo = undefined;
    }

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Update item status
   */
  async updateItemStatus(
    pod: ProofOfDelivery,
    itemId: string,
    status: DeliveryItem['status'],
    quantityDelivered?: number,
    notes?: string
  ): Promise<ProofOfDelivery> {
    const items = pod.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          quantity_delivered: quantityDelivered ?? item.quantity_delivered,
          notes: notes || item.notes,
        };
      }
      return item;
    });

    const itemSummary = this.calculateItemSummary(items);

    const updated: ProofOfDelivery = {
      ...pod,
      items,
      ...itemSummary,
      updated_at: new Date().toISOString(),
    };

    await this.saveDraft(updated);

    return updated;
  }

  /**
   * Verify GPS location
   */
  async verifyLocation(
    pod: ProofOfDelivery,
    stopGPSCoordinates: GPSCoordinates
  ): Promise<LocationVerification> {
    if (!pod.gps_coordinates) {
      return {
        verified: false,
        distance_from_stop: Infinity,
        within_acceptable_range: false,
        acceptable_range: this.validationRules.acceptable_location_range_meters,
        verification_time: new Date().toISOString(),
      };
    }

    const distance = this.calculateDistance(
      pod.gps_coordinates,
      stopGPSCoordinates
    );

    const within_range = distance <= this.validationRules.acceptable_location_range_meters;

    return {
      verified: within_range,
      distance_from_stop: distance,
      within_acceptable_range: within_range,
      acceptable_range: this.validationRules.acceptable_location_range_meters,
      verification_time: new Date().toISOString(),
    };
  }

  /**
   * Validate POD for submission
   */
  validatePOD(pod: ProofOfDelivery): PODValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequired: string[] = [];

    // Required: Receiver name
    if (!pod.receiver_name || pod.receiver_name.length < this.validationRules.min_receiver_name_length) {
      errors.push(`Receiver name must be at least ${this.validationRules.min_receiver_name_length} characters`);
      missingRequired.push('receiver_name');
    }

    // Required: Receipt photo
    if (this.validationRules.require_receipt_photo && !pod.receipt_photo) {
      errors.push('Receipt photo is required');
      missingRequired.push('receipt_photo');
    }

    // Required: Signature (if permitted)
    if (this.validationRules.require_signature && !pod.signature) {
      errors.push('Digital signature is required');
      missingRequired.push('signature');
    }

    // Required: Product photos
    if (this.validationRules.require_product_photos && pod.product_photos.length === 0) {
      warnings.push('Product photos are recommended');
    }

    // Required: GPS coordinates
    if (this.validationRules.require_gps_coordinates && !pod.gps_coordinates) {
      errors.push('GPS coordinates are required');
      missingRequired.push('gps_coordinates');
    }

    // Validate timing
    if (new Date(pod.arrival_time) > new Date(pod.completion_time)) {
      errors.push('Completion time cannot be before arrival time');
    }

    // Validate items
    if (pod.items.length === 0) {
      errors.push('At least one delivery item is required');
    }

    // Check for unprocessed items
    const unprocessedItems = pod.items.filter(item => 
      item.quantity_delivered === 0 && item.status === 'delivered'
    );
    if (unprocessedItems.length > 0) {
      warnings.push(`${unprocessedItems.length} items have zero quantity delivered`);
    }

    // Check delivery notes length
    if (pod.delivery_notes && pod.delivery_notes.length > this.validationRules.max_delivery_notes_length) {
      errors.push(`Delivery notes exceed maximum length (${this.validationRules.max_delivery_notes_length})`);
    }

    // Warnings for missing optional items
    if (pod.items_damaged > 0 && !pod.delivery_notes) {
      warnings.push('Damaged items should include delivery notes explaining the damage');
    }

    if (pod.items_rejected > 0 && !pod.delivery_notes) {
      warnings.push('Rejected items should include delivery notes explaining the rejection');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      missing_required: missingRequired,
      can_save_draft: true,
      can_submit: errors.length === 0,
    };
  }

  /**
   * Check for duplicate submission
   */
  async checkDuplicate(pod: ProofOfDelivery): Promise<DuplicateCheckResult> {
    try {
      // Get recent submissions for this stop
      const recentSubmissions = await this.getRecentPODs(
        pod.stop_id,
        DUPLICATE_CHECK_WINDOW_HOURS
      );

      // Check for exact match
      for (const existing of recentSubmissions) {
        if (existing.id === pod.id) continue;

        // Check similarity
        const similarity = this.calculateSimilarity(pod, existing);

        if (similarity > 0.9) {
          return {
            is_duplicate: true,
            duplicate_id: existing.id,
            similarity_score: similarity,
            reason: 'Very similar POD already submitted for this stop',
          };
        }
      }

      return {
        is_duplicate: false,
      };
    } catch (error) {
      console.error('[POD] Duplicate check failed:', error);
      // Allow submission if check fails
      return {
        is_duplicate: false,
      };
    }
  }

  /**
   * Submit POD
   */
  async submitPOD(pod: ProofOfDelivery): Promise<ProofOfDelivery> {
    // Validate
    const validation = this.validatePOD(pod);
    if (!validation.is_valid) {
      throw new Error(`Cannot submit invalid POD: ${validation.errors.join(', ')}`);
    }

    // Check for duplicates
    const duplicateCheck = await this.checkDuplicate(pod);
    if (duplicateCheck.is_duplicate) {
      throw new Error(`Duplicate POD detected: ${duplicateCheck.reason}`);
    }

    // Update GPS and completion time
    const gpsCoordinates = await this.getCurrentGPSCoordinates();

    const submitted: ProofOfDelivery = {
      ...pod,
      status: 'submitted',
      is_draft: false,
      completion_time: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      submitted_from_location: gpsCoordinates,
      updated_at: new Date().toISOString(),
    };

    // Remove from drafts
    await this.removeDraft(pod.id);

    // Save submission (or queue if offline)
    await this.saveSubmission(submitted);

    return submitted;
  }

  /**
   * Save draft locally
   */
  async saveDraft(pod: ProofOfDelivery): Promise<void> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      const drafts: Record<string, ProofOfDelivery> = draftsJson ? JSON.parse(draftsJson) : {};

      drafts[pod.id] = {
        ...pod,
        draft_saved_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      console.log('[POD] Draft saved:', pod.id);
    } catch (error) {
      console.error('[POD] Failed to save draft:', error);
      throw new Error('Failed to save draft');
    }
  }

  /**
   * Load draft
   */
  async loadDraft(podId: string): Promise<ProofOfDelivery | null> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftsJson) return null;

      const drafts: Record<string, ProofOfDelivery> = JSON.parse(draftsJson);
      return drafts[podId] || null;
    } catch (error) {
      console.error('[POD] Failed to load draft:', error);
      return null;
    }
  }

  /**
   * Get all drafts
   */
  async getAllDrafts(): Promise<ProofOfDelivery[]> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftsJson) return [];

      const drafts: Record<string, ProofOfDelivery> = JSON.parse(draftsJson);
      return Object.values(drafts).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } catch (error) {
      console.error('[POD] Failed to load drafts:', error);
      return [];
    }
  }

  /**
   * Remove draft
   */
  async removeDraft(podId: string): Promise<void> {
    try {
      const draftsJson = await AsyncStorage.getItem(DRAFT_STORAGE_KEY);
      if (!draftsJson) return;

      const drafts: Record<string, ProofOfDelivery> = JSON.parse(draftsJson);
      delete drafts[podId];

      await AsyncStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
      console.log('[POD] Draft removed:', podId);
    } catch (error) {
      console.error('[POD] Failed to remove draft:', error);
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
   * Pick photo from gallery
   */
  async pickPhoto(): Promise<string | null> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Gallery permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
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
        console.warn('[POD] Location permission not granted');
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
      console.error('[POD] Failed to get GPS coordinates:', error);
      return undefined;
    }
  }

  /**
   * Calculate distance between two GPS points (Haversine formula)
   */
  private calculateDistance(
    point1: GPSCoordinates,
    point2: GPSCoordinates
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Calculate item summary
   */
  private calculateItemSummary(items: DeliveryItem[]) {
    return {
      total_items: items.length,
      items_delivered: items.filter(i => i.status === 'delivered').length,
      items_missing: items.filter(i => i.status === 'missing').length,
      items_damaged: items.filter(i => i.status === 'damaged').length,
      items_returned: items.filter(i => i.status === 'returned').length,
      items_rejected: items.filter(i => i.status === 'rejected').length,
    };
  }

  /**
   * Calculate similarity between two PODs
   */
  private calculateSimilarity(pod1: ProofOfDelivery, pod2: ProofOfDelivery): number {
    let score = 0;
    let checks = 0;

    // Same stop
    if (pod1.stop_id === pod2.stop_id) {
      score += 0.3;
    }
    checks++;

    // Same receiver
    if (pod1.receiver_name.toLowerCase() === pod2.receiver_name.toLowerCase()) {
      score += 0.3;
    }
    checks++;

    // Similar completion time (within 1 hour)
    const timeDiff = Math.abs(
      new Date(pod1.completion_time).getTime() - new Date(pod2.completion_time).getTime()
    );
    if (timeDiff < 3600000) {
      score += 0.4;
    }
    checks++;

    return score;
  }

  /**
   * Check if device is online
   */
  private async isOnline(): Promise<boolean> {
    // TODO: Implement actual network check
    return true;
  }

  /**
   * Get recent PODs for stop
   */
  private async getRecentPODs(
    stopId: string,
    hoursAgo: number
  ): Promise<ProofOfDelivery[]> {
    // TODO: Implement actual API call
    // For now, return empty array
    return [];
  }

  /**
   * Save submission
   */
  private async saveSubmission(pod: ProofOfDelivery): Promise<void> {
    // TODO: Implement actual API call or offline queue
    console.log('[POD] Submission saved:', pod.id);
  }

  /**
   * Generate unique POD ID
   */
  private generatePODId(): string {
    return `pod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique photo ID
   */
  private generatePhotoId(): string {
    return `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique signature ID
   */
  private generateSignatureId(): string {
    return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const proofOfDeliveryService = new ProofOfDeliveryService();
