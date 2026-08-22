/**
 * POD Submission Form Component
 * 
 * Driver/Porter interface for submitting proof of delivery with:
 * - Receiver information
 * - Digital signature capture
 * - Photo uploads (receipt, products, damage)
 * - GPS tracking
 * - Item status management
 * - Draft saving
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react';
import { Ionicons } from '@expo/vector-icons';
import type {
  ProofOfDelivery,
  DeliveryItem,
  ItemStatus,
  PODValidation,
} from '../../types/delivery.types';
import { proofOfDeliveryService } from '../../services/delivery/ProofOfDeliveryService';
import { uploadQueueService } from '../../services/delivery/UploadQueueService';

interface PODSubmissionFormProps {
  tripId: string;
  stopId: string;
  driverId: string;
  porterId?: string;
  deliveryLocation: string;
  arrivalTime: string;
  items: DeliveryItem[];
  existingPOD?: ProofOfDelivery;
  onSaved?: (pod: ProofOfDelivery) => void;
  onSubmitted?: (pod: ProofOfDelivery) => void;
  onSignatureRequested?: () => void;
}

export const PODSubmissionForm: React.FC<PODSubmissionFormProps> = ({
  tripId,
  stopId,
  driverId,
  porterId,
  deliveryLocation,
  arrivalTime,
  items,
  existingPOD,
  onSaved,
  onSubmitted,
  onSignatureRequested,
}) => {
  // Form state
  const [pod, setPod] = useState<ProofOfDelivery | null>(existingPOD || null);
  const [receiverName, setReceiverName] = useState(existingPOD?.receiver_name || '');
  const [receiverTitle, setReceiverTitle] = useState(existingPOD?.receiver_title || '');
  const [receiverPhone, setReceiverPhone] = useState(existingPOD?.receiver_phone || '');
  const [deliveryNotes, setDeliveryNotes] = useState(existingPOD?.delivery_notes || '');

  // UI state
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<PODValidation | null>(null);
  const [showItemsList, setShowItemsList] = useState(true);
  const [capturingPhoto, setCapturingPhoto] = useState(false);

  /**
   * Initialize POD
   */
  useEffect(() => {
    if (!existingPOD && !pod) {
      initializePOD();
    }
  }, []);

  const initializePOD = async () => {
    try {
      setLoading(true);
      const newPOD = await proofOfDeliveryService.createPOD({
        trip_id: tripId,
        stop_id: stopId,
        driver_id: driverId,
        porter_id: porterId,
        receiver_name: '',
        arrival_time: arrivalTime,
        delivery_location: deliveryLocation,
        items,
      });
      setPod(newPOD);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize POD');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save draft
   */
  const handleSaveDraft = async () => {
    if (!pod) return;

    try {
      setLoading(true);

      const updated = await proofOfDeliveryService.updatePOD(pod, {
        receiver_name: receiverName,
        receiver_title: receiverTitle,
        receiver_phone: receiverPhone,
        delivery_notes: deliveryNotes,
        items: pod.items,
      });

      setPod(updated);

      if (onSaved) {
        onSaved(updated);
      }

      Alert.alert('Success', 'Draft saved successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Validate and submit POD
   */
  const handleSubmit = async () => {
    if (!pod) return;

    // Update with latest form data
    const updated = await proofOfDeliveryService.updatePOD(pod, {
      receiver_name: receiverName,
      receiver_title: receiverTitle,
      receiver_phone: receiverPhone,
      delivery_notes: deliveryNotes,
      items: pod.items,
    });

    // Validate
    const validationResult = proofOfDeliveryService.validatePOD(updated);
    setValidation(validationResult);

    if (!validationResult.is_valid) {
      Alert.alert(
        'Validation Errors',
        validationResult.errors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Show warnings if any
    if (validationResult.warnings.length > 0) {
      Alert.alert(
        'Submit POD',
        `Warnings:\n${validationResult.warnings.join('\n')}\n\nContinue submission?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => submitPOD(updated) },
        ]
      );
    } else {
      Alert.alert(
        'Submit POD',
        'Are you sure you want to submit this proof of delivery?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => submitPOD(updated) },
        ]
      );
    }
  };

  const submitPOD = async (updatedPOD: ProofOfDelivery) => {
    try {
      setLoading(true);

      // Queue photos for upload
      if (updatedPOD.receipt_photo) {
        await uploadQueueService.addToQueue(
          updatedPOD.receipt_photo.local_uri,
          'photo',
          'pod',
          updatedPOD.id,
          'high'
        );
      }

      for (const photo of updatedPOD.product_photos) {
        await uploadQueueService.addToQueue(
          photo.local_uri,
          'photo',
          'pod',
          updatedPOD.id,
          'normal'
        );
      }

      if (updatedPOD.signature) {
        await uploadQueueService.addToQueue(
          updatedPOD.signature.signature_data,
          'signature',
          'pod',
          updatedPOD.id,
          'high'
        );
      }

      // Submit POD
      const submitted = await proofOfDeliveryService.submitPOD(updatedPOD);
      setPod(submitted);

      if (onSubmitted) {
        onSubmitted(submitted);
      }

      Alert.alert('Success', 'Proof of delivery submitted successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Capture receipt photo
   */
  const handleCaptureReceipt = async () => {
    if (!pod) return;

    try {
      setCapturingPhoto(true);
      const photoUri = await proofOfDeliveryService.capturePhoto();

      if (photoUri) {
        const updated = await proofOfDeliveryService.addReceiptPhoto(pod, photoUri);
        setPod(updated);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to capture photo');
    } finally {
      setCapturingPhoto(false);
    }
  };

  /**
   * Add product photo
   */
  const handleAddProductPhoto = async () => {
    if (!pod) return;

    try {
      setCapturingPhoto(true);
      const photoUri = await proofOfDeliveryService.capturePhoto();

      if (photoUri) {
        const updated = await proofOfDeliveryService.addProductPhoto(pod, photoUri);
        setPod(updated);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add photo');
    } finally {
      setCapturingPhoto(false);
    }
  };

  /**
   * Remove photo
   */
  const handleRemovePhoto = async (photoId: string) => {
    if (!pod) return;

    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await proofOfDeliveryService.removePhoto(pod, photoId);
          setPod(updated);
        },
      },
    ]);
  };

  /**
   * Update item status
   */
  const handleUpdateItemStatus = async (itemId: string, status: ItemStatus) => {
    if (!pod) return;

    const updated = await proofOfDeliveryService.updateItemStatus(pod, itemId, status);
    setPod(updated);
  };

  /**
   * Request signature capture
   */
  const handleRequestSignature = () => {
    if (onSignatureRequested) {
      onSignatureRequested();
    }
  };

  if (loading && !pod) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Initializing POD...</Text>
      </View>
    );
  }

  if (!pod) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="document-text" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Proof of Delivery</Text>
        {pod.is_draft && (
          <View style={styles.draftBadge}>
            <Text style={styles.draftBadgeText}>DRAFT</Text>
          </View>
        )}
      </View>

      {/* Delivery Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{deliveryLocation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            Arrived: {new Date(arrivalTime).toLocaleString()}
          </Text>
        </View>
        {pod.gps_coordinates && (
          <View style={styles.infoRow}>
            <Ionicons name="navigate" size={16} color="#10B981" />
            <Text style={styles.infoText}>GPS Location Captured</Text>
          </View>
        )}
      </View>

      {/* Receiver Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receiver Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Receiver Name *</Text>
          <TextInput
            style={styles.input}
            value={receiverName}
            onChangeText={setReceiverName}
            placeholder="Enter receiver's full name"
            editable={pod.is_draft}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Title/Position</Text>
          <TextInput
            style={styles.input}
            value={receiverTitle}
            onChangeText={setReceiverTitle}
            placeholder="e.g., Warehouse Manager"
            editable={pod.is_draft}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={receiverPhone}
            onChangeText={setReceiverPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            editable={pod.is_draft}
          />
        </View>
      </View>

      {/* Receipt Photo */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Receipt Photo *</Text>
          {!pod.receipt_photo && pod.is_draft && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleCaptureReceipt}
              disabled={capturingPhoto}
            >
              <Ionicons name="camera" size={20} color="#3B82F6" />
              <Text style={styles.addPhotoButtonText}>Capture</Text>
            </TouchableOpacity>
          )}
        </View>

        {pod.receipt_photo ? (
          <View style={styles.photoCard}>
            <Image
              source={{ uri: pod.receipt_photo.local_uri }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            {pod.is_draft && (
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => handleRemovePhoto(pod.receipt_photo!.id)}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={48} color="#D1D5DB" />
            <Text style={styles.photoPlaceholderText}>No receipt photo captured</Text>
          </View>
        )}
      </View>

      {/* Signature */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Digital Signature</Text>
          {!pod.signature && pod.is_draft && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleRequestSignature}
            >
              <Ionicons name="create" size={20} color="#3B82F6" />
              <Text style={styles.addPhotoButtonText}>Capture</Text>
            </TouchableOpacity>
          )}
        </View>

        {pod.signature ? (
          <View style={styles.signatureCard}>
            <Image
              source={{ uri: pod.signature.signature_data }}
              style={styles.signatureImage}
              resizeMode="contain"
            />
            <Text style={styles.signatureText}>
              Signed by: {pod.signature.signer_name}
            </Text>
            <Text style={styles.signatureMeta}>
              {new Date(pod.signature.signed_at).toLocaleString()}
            </Text>
          </View>
        ) : (
          <View style={styles.signaturePlaceholder}>
            <Ionicons name="create-outline" size={48} color="#D1D5DB" />
            <Text style={styles.photoPlaceholderText}>
              No signature captured (if permitted)
            </Text>
          </View>
        )}
      </View>

      {/* Delivery Items */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setShowItemsList(!showItemsList)}
        >
          <Text style={styles.sectionTitle}>
            Delivery Items ({pod.items.length})
          </Text>
          <Ionicons
            name={showItemsList ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {showItemsList && (
          <>
            {/* Item Summary */}
            <View style={styles.itemSummary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Delivered:</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                  {pod.items_delivered}
                </Text>
              </View>
              {pod.items_missing > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Missing:</Text>
                  <Text style={[styles.summaryValue, { color: '#F59E0B' }]}>
                    {pod.items_missing}
                  </Text>
                </View>
              )}
              {pod.items_damaged > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Damaged:</Text>
                  <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                    {pod.items_damaged}
                  </Text>
                </View>
              )}
              {pod.items_rejected > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Rejected:</Text>
                  <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
                    {pod.items_rejected}
                  </Text>
                </View>
              )}
              {pod.items_returned > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Returned:</Text>
                  <Text style={[styles.summaryValue, { color: '#3B82F6' }]}>
                    {pod.items_returned}
                  </Text>
                </View>
              )}
            </View>

            {/* Items List */}
            {pod.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemQuantity}>
                  Quantity: {item.quantity_ordered}
                </Text>

                {pod.is_draft ? (
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        item.status === 'delivered' && styles.statusButtonActive,
                      ]}
                      onPress={() => handleUpdateItemStatus(item.id, 'delivered')}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          item.status === 'delivered' && styles.statusButtonTextActive,
                        ]}
                      >
                        Delivered
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        item.status === 'missing' && styles.statusButtonActive,
                      ]}
                      onPress={() => handleUpdateItemStatus(item.id, 'missing')}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          item.status === 'missing' && styles.statusButtonTextActive,
                        ]}
                      >
                        Missing
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        item.status === 'damaged' && styles.statusButtonActive,
                      ]}
                      onPress={() => handleUpdateItemStatus(item.id, 'damaged')}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          item.status === 'damaged' && styles.statusButtonTextActive,
                        ]}
                      >
                        Damaged
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                )}

                {item.notes && (
                  <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                )}
              </View>
            ))}
          </>
        )}
      </View>

      {/* Product Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Product Photos ({pod.product_photos.length})
          </Text>
          {pod.is_draft && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handleAddProductPhoto}
              disabled={capturingPhoto}
            >
              <Ionicons name="camera" size={20} color="#3B82F6" />
              <Text style={styles.addPhotoButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.photoGrid}>
          {pod.product_photos.map((photo) => (
            <View key={photo.id} style={styles.photoGridItem}>
              <Image
                source={{ uri: photo.local_uri }}
                style={styles.photoGridImage}
                resizeMode="cover"
              />
              {pod.is_draft && (
                <TouchableOpacity
                  style={styles.removePhotoButtonSmall}
                  onPress={() => handleRemovePhoto(photo.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Delivery Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          placeholder="Add any relevant notes about the delivery..."
          multiline
          numberOfLines={4}
          editable={pod.is_draft}
        />
        {pod.items_damaged > 0 && (
          <Text style={styles.helpText}>
            Please explain any damaged items
          </Text>
        )}
      </View>

      {/* Validation Errors */}
      {validation && validation.errors.length > 0 && (
        <View style={styles.errorSection}>
          <View style={styles.errorHeader}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.errorTitle}>Validation Errors</Text>
          </View>
          {validation.errors.map((error, index) => (
            <Text key={index} style={styles.errorText}>
              • {error}
            </Text>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      {pod.is_draft && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveDraftButton}
            onPress={handleSaveDraft}
            disabled={loading}
          >
            <Ionicons name="save-outline" size={20} color="#6B7280" />
            <Text style={styles.saveDraftButtonText}>Save Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit POD</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!pod.is_draft && (
        <View style={styles.submittedInfo}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          <Text style={styles.submittedText}>
            POD Submitted Successfully
          </Text>
          <Text style={styles.submittedMeta}>
            {new Date(pod.submitted_at!).toLocaleString()}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  draftBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  draftBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  addPhotoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
  },
  photoCard: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoImage: {
    width: '100%',
    height: 200,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  signatureCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  signatureImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    marginBottom: 8,
  },
  signatureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  signatureMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  signaturePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  itemSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  statusButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  itemNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButtonSmall: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  errorSection: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginLeft: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  saveDraftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  saveDraftButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  submittedInfo: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  submittedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginTop: 8,
  },
  submittedMeta: {
    fontSize: 13,
    color: '#047857',
    marginTop: 4,
  },
});
