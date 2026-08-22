/**
 * POD Review Card Component
 * 
 * Operator interface for reviewing proof of delivery submissions with:
 * - View all submission details
 * - Photo gallery viewer
 * - Signature verification
 * - GPS location map
 * - Item status review
 * - Approve submission
 * - Return for correction with comments
 * - Export/download options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  ProofOfDelivery,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_COLORS,
} from '../../types/delivery.types';

interface PODReviewCardProps {
  pod: ProofOfDelivery;
  operatorId: string;
  operatorName: string;
  onApproved?: (pod: ProofOfDelivery) => void;
  onReturnForCorrection?: (pod: ProofOfDelivery, comments: string) => void;
  onExport?: (pod: ProofOfDelivery, format: 'pdf' | 'json') => void;
}

export const PODReviewCard: React.FC<PODReviewCardProps> = ({
  pod,
  operatorId,
  operatorName,
  onApproved,
  onReturnForCorrection,
  onExport,
}) => {
  // UI state
  const [expandedSections, setExpandedSections] = useState({
    receiver: true,
    items: true,
    photos: true,
    signature: true,
    timeline: false,
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionComments, setCorrectionComments] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Toggle section expansion
   */
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /**
   * View photo in modal
   */
  const handleViewPhoto = (uri: string) => {
    setSelectedPhotoUri(uri);
    setShowPhotoModal(true);
  };

  /**
   * Approve POD
   */
  const handleApprove = () => {
    Alert.alert(
      'Approve POD',
      'Are you sure you want to approve this proof of delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: API call to approve
              const approved: ProofOfDelivery = {
                ...pod,
                status: 'approved',
                reviewed_by: operatorId,
                reviewed_at: new Date().toISOString(),
              };

              if (onApproved) {
                onApproved(approved);
              }

              Alert.alert('Success', 'POD approved successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to approve POD');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Return for correction
   */
  const handleReturnForCorrection = () => {
    if (!correctionComments.trim()) {
      Alert.alert('Error', 'Please provide correction comments');
      return;
    }

    Alert.alert(
      'Return for Correction',
      'Send this POD back to the driver for correction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // TODO: API call to return for correction
              const returned: ProofOfDelivery = {
                ...pod,
                status: 'correction_required',
                reviewed_by: operatorId,
                reviewed_at: new Date().toISOString(),
                correction_comments: correctionComments,
              };

              if (onReturnForCorrection) {
                onReturnForCorrection(returned, correctionComments);
              }

              setShowCorrectionModal(false);
              setCorrectionComments('');
              Alert.alert('Success', 'POD returned for correction');
            } catch (error) {
              Alert.alert('Error', 'Failed to return POD');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Export POD
   */
  const handleExport = (format: 'pdf' | 'json') => {
    if (onExport) {
      onExport(pod, format);
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = () => {
    switch (pod.status) {
      case 'submitted':
        return '#3B82F6';
      case 'under_review':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'correction_required':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="document-text" size={24} color="#1F2937" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>POD #{pod.id.slice(-8)}</Text>
            <Text style={styles.headerSubtitle}>
              Submitted {formatDate(pod.submitted_at || pod.created_at)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusBadgeText}>
            {pod.status.toUpperCase().replace('_', ' ')}
          </Text>
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.metricValue}>{pod.items_delivered}</Text>
          <Text style={styles.metricLabel}>Delivered</Text>
        </View>
        {pod.items_missing > 0 && (
          <View style={styles.metricCard}>
            <Ionicons name="alert-circle" size={24} color="#F59E0B" />
            <Text style={styles.metricValue}>{pod.items_missing}</Text>
            <Text style={styles.metricLabel}>Missing</Text>
          </View>
        )}
        {pod.items_damaged > 0 && (
          <View style={styles.metricCard}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <Text style={styles.metricValue}>{pod.items_damaged}</Text>
            <Text style={styles.metricLabel}>Damaged</Text>
          </View>
        )}
        {pod.items_rejected > 0 && (
          <View style={styles.metricCard}>
            <Ionicons name="close-circle" size={24} color="#DC2626" />
            <Text style={styles.metricValue}>{pod.items_rejected}</Text>
            <Text style={styles.metricLabel}>Rejected</Text>
          </View>
        )}
      </View>

      {/* Delivery Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Delivery Location</Text>
        </View>
        <Text style={styles.locationText}>{pod.delivery_location}</Text>
        {pod.gps_coordinates && (
          <View style={styles.gpsInfo}>
            <Ionicons name="navigate" size={16} color="#10B981" />
            <Text style={styles.gpsText}>
              {pod.gps_coordinates.latitude.toFixed(6)}, {pod.gps_coordinates.longitude.toFixed(6)}
            </Text>
            {pod.location_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#059669" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Receiver Information */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('receiver')}
        >
          <Ionicons name="person" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Receiver Information</Text>
          <Ionicons
            name={expandedSections.receiver ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {expandedSections.receiver && (
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{pod.receiver_name}</Text>
            </View>
            {pod.receiver_title && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Title</Text>
                <Text style={styles.infoValue}>{pod.receiver_title}</Text>
              </View>
            )}
            {pod.receiver_phone && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{pod.receiver_phone}</Text>
              </View>
            )}
            {pod.receiver_email && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{pod.receiver_email}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Delivery Items */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('items')}
        >
          <Ionicons name="list" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>
            Delivery Items ({pod.items.length})
          </Text>
          <Ionicons
            name={expandedSections.items ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {expandedSections.items && (
          <View style={styles.itemsList}>
            {pod.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.product_name}</Text>
                  <View
                    style={[
                      styles.itemStatusBadge,
                      { backgroundColor: ITEM_STATUS_COLORS[item.status] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.itemStatusText,
                        { color: ITEM_STATUS_COLORS[item.status] },
                      ]}
                    >
                      {ITEM_STATUS_LABELS[item.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemQuantity}>
                  Delivered: {item.quantity_delivered} / {item.quantity_ordered}
                </Text>
                {item.notes && (
                  <Text style={styles.itemNotes}>Note: {item.notes}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Receipt Photo */}
      {pod.receipt_photo && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Receipt Photo</Text>
          </View>
          <TouchableOpacity
            style={styles.receiptPhotoContainer}
            onPress={() => handleViewPhoto(pod.receipt_photo!.local_uri)}
          >
            <Image
              source={{ uri: pod.receipt_photo.local_uri }}
              style={styles.receiptPhoto}
              resizeMode="cover"
            />
            <View style={styles.viewPhotoOverlay}>
              <Ionicons name="expand" size={24} color="#FFFFFF" />
              <Text style={styles.viewPhotoText}>Tap to view full size</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Photos */}
      {pod.product_photos.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('photos')}
          >
            <Ionicons name="images" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>
              Product Photos ({pod.product_photos.length})
            </Text>
            <Ionicons
              name={expandedSections.photos ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSections.photos && (
            <View style={styles.photoGrid}>
              {pod.product_photos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoGridItem}
                  onPress={() => handleViewPhoto(photo.local_uri)}
                >
                  <Image
                    source={{ uri: photo.local_uri }}
                    style={styles.photoGridImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Digital Signature */}
      {pod.signature && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('signature')}
          >
            <Ionicons name="create" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Digital Signature</Text>
            <Ionicons
              name={expandedSections.signature ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSections.signature && (
            <View style={styles.signatureCard}>
              <Image
                source={{ uri: pod.signature.signature_data }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
              <View style={styles.signatureInfo}>
                <Text style={styles.signatureLabel}>Signed by:</Text>
                <Text style={styles.signatureValue}>{pod.signature.signer_name}</Text>
              </View>
              <View style={styles.signatureInfo}>
                <Text style={styles.signatureLabel}>Signed at:</Text>
                <Text style={styles.signatureValue}>
                  {formatDate(pod.signature.signed_at)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Delivery Notes */}
      {pod.delivery_notes && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Delivery Notes</Text>
          </View>
          <Text style={styles.notesText}>{pod.delivery_notes}</Text>
        </View>
      )}

      {/* Timeline */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('timeline')}
        >
          <Ionicons name="time" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Timeline</Text>
          <Ionicons
            name={expandedSections.timeline ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {expandedSections.timeline && (
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Arrival</Text>
                <Text style={styles.timelineValue}>{formatDate(pod.arrival_time)}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Completion</Text>
                <Text style={styles.timelineValue}>{formatDate(pod.completion_time)}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Submitted</Text>
                <Text style={styles.timelineValue}>
                  {formatDate(pod.submitted_at || pod.created_at)}
                </Text>
              </View>
            </View>
            {pod.reviewed_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Reviewed</Text>
                  <Text style={styles.timelineValue}>{formatDate(pod.reviewed_at)}</Text>
                  <Text style={styles.timelineSubtext}>By: {pod.reviewed_by}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Correction Comments */}
      {pod.correction_comments && (
        <View style={styles.correctionSection}>
          <View style={styles.correctionHeader}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={styles.correctionTitle}>Correction Required</Text>
          </View>
          <Text style={styles.correctionText}>{pod.correction_comments}</Text>
        </View>
      )}

      {/* Action Buttons */}
      {pod.status === 'submitted' || pod.status === 'under_review' ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() =>
              Alert.alert('Export Format', 'Choose export format:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'PDF', onPress: () => handleExport('pdf') },
                { text: 'JSON', onPress: () => handleExport('json') },
              ])
            }
          >
            <Ionicons name="download-outline" size={20} color="#6B7280" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => setShowCorrectionModal(true)}
            disabled={loading}
          >
            <Ionicons name="return-down-back" size={20} color="#EF4444" />
            <Text style={styles.returnButtonText}>Return for Correction</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.approveButton}
            onPress={handleApprove}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.approveButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() =>
              Alert.alert('Export Format', 'Choose export format:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'PDF', onPress: () => handleExport('pdf') },
                { text: 'JSON', onPress: () => handleExport('json') },
              ])
            }
          >
            <Ionicons name="download-outline" size={20} color="#6B7280" />
            <Text style={styles.exportButtonText}>Export Record</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Photo Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPhotoModal(false)}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            {selectedPhotoUri && (
              <Image
                source={{ uri: selectedPhotoUri }}
                style={styles.modalPhoto}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Correction Modal */}
      <Modal
        visible={showCorrectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCorrectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.correctionModal}>
            <View style={styles.correctionModalHeader}>
              <Text style={styles.correctionModalTitle}>Return for Correction</Text>
              <TouchableOpacity onPress={() => setShowCorrectionModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.correctionModalLabel}>
              Correction Comments (required)
            </Text>
            <TextInput
              style={styles.correctionInput}
              value={correctionComments}
              onChangeText={setCorrectionComments}
              placeholder="Explain what needs to be corrected..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.correctionModalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCorrectionModal(false);
                  setCorrectionComments('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleReturnForCorrection}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Return POD</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metricsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
  },
  gpsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 6,
  },
  gpsText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
    fontFamily: 'monospace',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 2,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 2,
  },
  itemsList: {
    gap: 8,
  },
  itemCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  itemStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  itemStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemNotes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  receiptPhotoContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  receiptPhoto: {
    width: '100%',
    height: 250,
  },
  viewPhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewPhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  signatureCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  signatureImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    marginBottom: 12,
  },
  signatureInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  signatureValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D1D5DB',
    marginTop: 4,
    marginRight: 12,
  },
  timelineDotActive: {
    backgroundColor: '#3B82F6',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  timelineValue: {
    fontSize: 14,
    color: '#1F2937',
  },
  timelineSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  correctionSection: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  correctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  correctionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginLeft: 6,
  },
  correctionText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  returnButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  returnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 6,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  approveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 1,
  },
  modalPhoto: {
    width: '100%',
    height: '80%',
  },
  correctionModal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  correctionModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  correctionModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  correctionModalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  correctionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 16,
  },
  correctionModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

// Missing TextInput import
import { TextInput } from 'react-native';
