/**
 * Incident Review Card Component
 * 
 * Operator interface for reviewing incident reports with:
 * - View all incident details
 * - Photo/document gallery viewer
 * - GPS location map
 * - Involved employees list
 * - Status updates (acknowledge/investigating/resolved)
 * - Resolution tracking
 * - Follow-up assignments
 * - Export options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
  IncidentReport,
  IncidentStatus,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_STATUS_LABELS,
} from '../../types/delivery.types';
import { incidentReportingService } from '../../services/delivery/IncidentReportingService';

interface IncidentReviewCardProps {
  incident: IncidentReport;
  operatorId: string;
  operatorName: string;
  onStatusUpdated?: (incident: IncidentReport) => void;
  onExport?: (incident: IncidentReport, format: 'pdf' | 'json') => void;
}

export const IncidentReviewCard: React.FC<IncidentReviewCardProps> = ({
  incident,
  operatorId,
  operatorName,
  onStatusUpdated,
  onExport,
}) => {
  // UI state
  const [expandedSections, setExpandedSections] = useState({
    details: true,
    photos: true,
    employees: true,
    timeline: false,
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoUri, setSelectedPhotoUri] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident.status);
  const [resolutionNotes, setResolutionNotes] = useState(incident.resolution_notes || '');
  const [followUpNotes, setFollowUpNotes] = useState(incident.follow_up_notes || '');
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
   * Acknowledge incident
   */
  const handleAcknowledge = async () => {
    Alert.alert(
      'Acknowledge Incident',
      'Mark this incident as acknowledged?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: async () => {
            setLoading(true);
            try {
              const acknowledged = await incidentReportingService.acknowledgeIncident(
                incident,
                operatorId
              );

              if (onStatusUpdated) {
                onStatusUpdated(acknowledged);
              }

              Alert.alert('Success', 'Incident acknowledged');
            } catch (error) {
              Alert.alert('Error', 'Failed to acknowledge incident');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Update status
   */
  const handleUpdateStatus = async () => {
    if (selectedStatus === incident.status) {
      Alert.alert('Error', 'Please select a different status');
      return;
    }

    setLoading(true);
    try {
      const updated = await incidentReportingService.updateStatus(
        incident,
        selectedStatus,
        undefined,
        operatorId
      );

      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }

      setShowStatusModal(false);
      Alert.alert('Success', `Status updated to ${INCIDENT_STATUS_LABELS[selectedStatus]}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark as resolved
   */
  const handleMarkResolved = async () => {
    if (!resolutionNotes.trim()) {
      Alert.alert('Error', 'Please provide resolution notes');
      return;
    }

    Alert.alert(
      'Mark as Resolved',
      'Mark this incident as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            setLoading(true);
            try {
              const resolved = await incidentReportingService.updateStatus(
                incident,
                'resolved',
                resolutionNotes,
                operatorId
              );

              if (onStatusUpdated) {
                onStatusUpdated(resolved);
              }

              setShowResolutionModal(false);
              Alert.alert('Success', 'Incident marked as resolved');
            } catch (error) {
              Alert.alert('Error', 'Failed to resolve incident');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Export incident
   */
  const handleExport = (format: 'pdf' | 'json') => {
    if (onExport) {
      onExport(incident, format);
    }
  };

  /**
   * Get severity color
   */
  const getSeverityColor = () => {
    return INCIDENT_SEVERITY_COLORS[incident.severity];
  };

  /**
   * Get status color
   */
  const getStatusColor = () => {
    const colors: Record<IncidentStatus, string> = {
      reported: '#6B7280',
      acknowledged: '#3B82F6',
      investigating: '#F59E0B',
      in_progress: '#8B5CF6',
      resolved: '#10B981',
      closed: '#6B7280',
    };
    return colors[incident.status];
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
          <Ionicons name="warning" size={24} color="#1F2937" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {INCIDENT_TYPE_LABELS[incident.incident_type]}
            </Text>
            <Text style={styles.headerSubtitle}>
              Reported {formatDate(incident.reported_at)}
            </Text>
          </View>
        </View>
        <View style={styles.badges}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor() },
            ]}
          >
            <Text style={styles.badgeText}>
              {INCIDENT_SEVERITY_LABELS[incident.severity].toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() },
            ]}
          >
            <Text style={styles.badgeText}>
              {INCIDENT_STATUS_LABELS[incident.status].toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      {incident.status === 'reported' && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleAcknowledge}
            disabled={loading}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#3B82F6" />
            <Text style={styles.quickActionText}>Acknowledge</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setShowStatusModal(true)}
          >
            <Ionicons name="refresh-outline" size={20} color="#8B5CF6" />
            <Text style={styles.quickActionText}>Update Status</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Incident Title */}
      <View style={styles.section}>
        <Text style={styles.incidentTitle}>{incident.title}</Text>
      </View>

      {/* Reporter Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Reporter Information</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reported by:</Text>
            <Text style={styles.infoValue}>{incident.reported_by}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Report date:</Text>
            <Text style={styles.infoValue}>{formatDate(incident.reported_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Incident date:</Text>
            <Text style={styles.infoValue}>{formatDate(incident.incident_date)}</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection('details')}
        >
          <Ionicons name="document-text" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <Ionicons
            name={expandedSections.details ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>

        {expandedSections.details && (
          <>
            <View style={styles.detailsCard}>
              <Text style={styles.detailsLabel}>Description</Text>
              <Text style={styles.detailsText}>{incident.description}</Text>
            </View>

            {incident.location_description && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsLabel}>Location</Text>
                <Text style={styles.detailsText}>{incident.location_description}</Text>
              </View>
            )}

            {incident.gps_coordinates && (
              <View style={styles.gpsCard}>
                <Ionicons name="navigate" size={16} color="#10B981" />
                <Text style={styles.gpsText}>
                  {incident.gps_coordinates.latitude.toFixed(6)}, {incident.gps_coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            )}

            {incident.immediate_action_taken && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsLabel}>Immediate Action Taken</Text>
                <Text style={styles.detailsText}>{incident.immediate_action_taken}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Photos */}
      {incident.photos.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('photos')}
          >
            <Ionicons name="images" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>
              Photos ({incident.photos.length})
            </Text>
            <Ionicons
              name={expandedSections.photos ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSections.photos && (
            <View style={styles.photoGrid}>
              {incident.photos.map((photo) => (
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
                  {photo.description && (
                    <View style={styles.photoDescription}>
                      <Text style={styles.photoDescriptionText} numberOfLines={2}>
                        {photo.description}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Involved Employees */}
      {incident.involved_employees.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => toggleSection('employees')}
          >
            <Ionicons name="people" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>
              Involved Employees ({incident.involved_employees.length})
            </Text>
            <Ionicons
              name={expandedSections.employees ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {expandedSections.employees && (
            <View style={styles.employeesList}>
              {incident.involved_employees.map((employee, index) => (
                <View key={index} style={styles.employeeCard}>
                  <View style={styles.employeeHeader}>
                    <Ionicons name="person-circle" size={32} color="#6B7280" />
                    <View style={styles.employeeInfo}>
                      <Text style={styles.employeeName}>{employee.name}</Text>
                      <Text style={styles.employeeRole}>
                        {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      </Text>
                    </View>
                  </View>
                  {employee.involvement_description && (
                    <Text style={styles.employeeInvolvement}>
                      {employee.involvement_description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Related Information */}
      {(incident.trip_id || incident.truck_id || incident.stop_id) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Related Information</Text>
          </View>
          <View style={styles.infoGrid}>
            {incident.trip_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trip ID:</Text>
                <Text style={styles.infoValue}>{incident.trip_id}</Text>
              </View>
            )}
            {incident.truck_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Truck ID:</Text>
                <Text style={styles.infoValue}>{incident.truck_id}</Text>
              </View>
            )}
            {incident.stop_id && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Stop ID:</Text>
                <Text style={styles.infoValue}>{incident.stop_id}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Resolution */}
      {(incident.resolution_notes || incident.resolved_at) && (
        <View style={styles.resolutionSection}>
          <View style={styles.resolutionHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.resolutionTitle}>Resolution</Text>
          </View>
          {incident.resolution_notes && (
            <Text style={styles.resolutionText}>{incident.resolution_notes}</Text>
          )}
          {incident.resolved_at && (
            <View style={styles.resolutionMeta}>
              <Text style={styles.resolutionMetaText}>
                Resolved by {incident.resolved_by} on {formatDate(incident.resolved_at)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Follow-up */}
      {incident.follow_up_required && (
        <View style={styles.followUpSection}>
          <View style={styles.followUpHeader}>
            <Ionicons name="flag" size={20} color="#F59E0B" />
            <Text style={styles.followUpTitle}>Follow-up Required</Text>
          </View>
          {incident.follow_up_notes && (
            <Text style={styles.followUpText}>{incident.follow_up_notes}</Text>
          )}
          {incident.follow_up_assigned_to && (
            <View style={styles.followUpMeta}>
              <Text style={styles.followUpMetaText}>
                Assigned to: {incident.follow_up_assigned_to}
              </Text>
            </View>
          )}
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
                <Text style={styles.timelineLabel}>Incident Occurred</Text>
                <Text style={styles.timelineValue}>{formatDate(incident.incident_date)}</Text>
              </View>
            </View>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Reported</Text>
                <Text style={styles.timelineValue}>{formatDate(incident.reported_at)}</Text>
                <Text style={styles.timelineSubtext}>By: {incident.reported_by}</Text>
              </View>
            </View>
            {incident.acknowledged_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Acknowledged</Text>
                  <Text style={styles.timelineValue}>{formatDate(incident.acknowledged_at)}</Text>
                  <Text style={styles.timelineSubtext}>By: {incident.acknowledged_by}</Text>
                </View>
              </View>
            )}
            {incident.resolved_at && (
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, styles.timelineDotResolved]} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Resolved</Text>
                  <Text style={styles.timelineValue}>{formatDate(incident.resolved_at)}</Text>
                  <Text style={styles.timelineSubtext}>By: {incident.resolved_by}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
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

        {incident.status !== 'resolved' && incident.status !== 'closed' && (
          <>
            <TouchableOpacity
              style={styles.updateStatusButton}
              onPress={() => setShowStatusModal(true)}
            >
              <Ionicons name="refresh" size={20} color="#8B5CF6" />
              <Text style={styles.updateStatusButtonText}>Update Status</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resolveButton}
              onPress={() => setShowResolutionModal(true)}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.resolveButtonText}>Mark Resolved</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Photo Modal */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
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
      </Modal>

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.statusModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Status</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.statusOptions}>
              {(['acknowledged', 'investigating', 'in_progress', 'resolved', 'closed'] as const).map(
                (status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      selectedStatus === status && styles.statusOptionActive,
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selectedStatus === status && styles.statusOptionTextActive,
                      ]}
                    >
                      {INCIDENT_STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowStatusModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleUpdateStatus}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Resolution Modal */}
      <Modal
        visible={showResolutionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResolutionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resolutionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark as Resolved</Text>
              <TouchableOpacity onPress={() => setShowResolutionModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Resolution Notes (required)</Text>
            <TextInput
              style={styles.textArea}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
              placeholder="Describe how the incident was resolved..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowResolutionModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleMarkResolved}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Mark Resolved</Text>
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
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
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
  badges: {
    gap: 6,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  incidentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 28,
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
  infoGrid: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
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
    textAlign: 'right',
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  gpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  gpsText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoGridItem: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  photoDescription: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 6,
  },
  photoDescriptionText: {
    fontSize: 11,
    color: '#FFFFFF',
  },
  employeesList: {
    gap: 12,
  },
  employeeCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeInfo: {
    marginLeft: 12,
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  employeeRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  employeeInvolvement: {
    fontSize: 14,
    color: '#374151',
    marginTop: 10,
    fontStyle: 'italic',
  },
  resolutionSection: {
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  resolutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resolutionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    marginLeft: 6,
  },
  resolutionText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
    marginBottom: 8,
  },
  resolutionMeta: {
    marginTop: 4,
  },
  resolutionMetaText: {
    fontSize: 12,
    color: '#047857',
  },
  followUpSection: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  followUpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 6,
  },
  followUpText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 8,
  },
  followUpMeta: {
    marginTop: 4,
  },
  followUpMetaText: {
    fontSize: 12,
    color: '#92400E',
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
  timelineDotResolved: {
    backgroundColor: '#10B981',
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
  updateStatusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
  },
  updateStatusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  resolveButtonText: {
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
  statusModal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  resolutionModal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusOptions: {
    gap: 8,
    marginBottom: 16,
  },
  statusOption: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  statusOptionActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  statusOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
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
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
