/**
 * Incident Report Form Component
 * 
 * Driver interface for reporting incidents with:
 * - Incident type selection (8 types)
 * - Description and details
 * - Photo/document uploads
 * - GPS tracking
 * - Involved employees
 * - Immediate action taken
 * - Auto severity assignment
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  IncidentReport,
  IncidentType,
  IncidentSeverity,
  InvolvedEmployee,
  IncidentValidation,
  INCIDENT_TYPE_LABELS,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_SEVERITY_COLORS,
} from '../../types/delivery.types';
import { incidentReportingService } from '../../services/delivery/IncidentReportingService';
import { uploadQueueService } from '../../services/delivery/UploadQueueService';

interface IncidentReportFormProps {
  reportedBy: string;
  reportedByName: string;
  tripId?: string;
  truckId?: string;
  stopId?: string;
  existingIncident?: IncidentReport;
  onSaved?: (incident: IncidentReport) => void;
  onSubmitted?: (incident: IncidentReport) => void;
}

const INCIDENT_TYPES: IncidentType[] = [
  'delivery_delay',
  'truck_breakdown',
  'accident',
  'damaged_goods',
  'missing_goods',
  'rejected_delivery',
  'route_problem',
  'other',
];

export const IncidentReportForm: React.FC<IncidentReportFormProps> = ({
  reportedBy,
  reportedByName,
  tripId,
  truckId,
  stopId,
  existingIncident,
  onSaved,
  onSubmitted,
}) => {
  // Form state
  const [incident, setIncident] = useState<IncidentReport | null>(existingIncident || null);
  const [selectedType, setSelectedType] = useState<IncidentType>(
    existingIncident?.incident_type || 'other'
  );
  const [title, setTitle] = useState(existingIncident?.title || '');
  const [description, setDescription] = useState(existingIncident?.description || '');
  const [incidentDate, setIncidentDate] = useState(
    existingIncident?.incident_date || new Date().toISOString()
  );
  const [locationDescription, setLocationDescription] = useState(
    existingIncident?.location_description || ''
  );
  const [immediateAction, setImmediateAction] = useState(
    existingIncident?.immediate_action_taken || ''
  );

  // UI state
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<IncidentValidation | null>(null);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [showInvolvedEmployees, setShowInvolvedEmployees] = useState(false);

  // Involved employees state
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState<InvolvedEmployee['role']>('driver');

  /**
   * Initialize incident
   */
  useEffect(() => {
    if (!existingIncident && !incident) {
      initializeIncident();
    }
  }, []);

  const initializeIncident = async () => {
    try {
      setLoading(true);
      const newIncident = await incidentReportingService.createIncident({
        incident_type: selectedType,
        title: '',
        description: '',
        incident_date: new Date().toISOString(),
        reported_by: reportedBy,
        trip_id: tripId,
        truck_id: truckId,
        stop_id: stopId,
      });
      setIncident(newIncident);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize incident report');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update incident type
   */
  const handleTypeChange = async (type: IncidentType) => {
    setSelectedType(type);

    if (incident) {
      try {
        const updated = await incidentReportingService.updateIncident(incident, {
          incident_type: type,
        });
        setIncident(updated);
      } catch (error) {
        Alert.alert('Error', 'Failed to update incident type');
      }
    }
  };

  /**
   * Save draft
   */
  const handleSaveDraft = async () => {
    if (!incident) return;

    try {
      setLoading(true);

      const updated = await incidentReportingService.updateIncident(incident, {
        incident_type: selectedType,
        title,
        description,
        location_description: locationDescription,
        immediate_action_taken: immediateAction,
      });

      setIncident(updated);

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
   * Validate and submit
   */
  const handleSubmit = async () => {
    if (!incident) return;

    // Update with latest form data
    const updated = await incidentReportingService.updateIncident(incident, {
      incident_type: selectedType,
      title,
      description,
      location_description: locationDescription,
      immediate_action_taken: immediateAction,
    });

    // Validate
    const validationResult = incidentReportingService.validateIncident(updated);
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
        'Submit Incident Report',
        `Warnings:\n${validationResult.warnings.join('\n')}\n\nContinue submission?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => submitIncident(updated) },
        ]
      );
    } else {
      Alert.alert(
        'Submit Incident Report',
        'Are you sure you want to submit this incident report?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Submit', onPress: () => submitIncident(updated) },
        ]
      );
    }
  };

  const submitIncident = async (updatedIncident: IncidentReport) => {
    try {
      setLoading(true);

      // Queue photos for upload
      for (const photo of updatedIncident.photos) {
        await uploadQueueService.addToQueue(
          photo.local_uri,
          'photo',
          'incident',
          updatedIncident.id,
          updatedIncident.severity === 'critical' ? 'high' : 'normal'
        );
      }

      // Queue documents for upload
      for (const doc of updatedIncident.documents) {
        await uploadQueueService.addToQueue(
          doc.local_uri,
          'document',
          'incident',
          updatedIncident.id,
          'normal'
        );
      }

      // Submit incident
      const submitted = await incidentReportingService.submitIncident(updatedIncident);
      setIncident(submitted);

      if (onSubmitted) {
        onSubmitted(submitted);
      }

      Alert.alert('Success', 'Incident report submitted successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Capture photo
   */
  const handleCapturePhoto = async () => {
    if (!incident) return;

    try {
      setCapturingPhoto(true);
      const photoUri = await incidentReportingService.capturePhoto();

      if (photoUri) {
        const updated = await incidentReportingService.addPhoto(incident, photoUri);
        setIncident(updated);
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to capture photo');
    } finally {
      setCapturingPhoto(false);
    }
  };

  /**
   * Remove attachment
   */
  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!incident) return;

    Alert.alert('Remove Attachment', 'Are you sure you want to remove this attachment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await incidentReportingService.removeAttachment(incident, attachmentId);
          setIncident(updated);
        },
      },
    ]);
  };

  /**
   * Add involved employee
   */
  const handleAddEmployee = async () => {
    if (!incident || !newEmployeeName.trim()) {
      Alert.alert('Error', 'Please enter employee name');
      return;
    }

    const employee: InvolvedEmployee = {
      employee_id: `emp_${Date.now()}`,
      name: newEmployeeName.trim(),
      role: newEmployeeRole,
    };

    try {
      const updated = await incidentReportingService.addInvolvedEmployee(incident, employee);
      setIncident(updated);
      setNewEmployeeName('');
      setShowInvolvedEmployees(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add employee');
    }
  };

  /**
   * Get severity color
   */
  const getSeverityColor = (severity: IncidentSeverity): string => {
    return INCIDENT_SEVERITY_COLORS[severity];
  };

  if (loading && !incident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Initializing incident report...</Text>
      </View>
    );
  }

  if (!incident) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="warning" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Incident Report</Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(incident.severity) },
          ]}
        >
          <Text style={styles.severityBadgeText}>
            {INCIDENT_SEVERITY_LABELS[incident.severity].toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Reporter Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reporter Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{reportedByName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {new Date(incident.reported_at).toLocaleString()}
          </Text>
        </View>
        {incident.gps_coordinates && (
          <View style={styles.infoRow}>
            <Ionicons name="navigate" size={16} color="#10B981" />
            <Text style={styles.infoText}>GPS Location Captured</Text>
          </View>
        )}
      </View>

      {/* Incident Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incident Type *</Text>
        <View style={styles.typeGrid}>
          {INCIDENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                selectedType === type && styles.typeButtonActive,
              ]}
              onPress={() => handleTypeChange(type)}
              disabled={incident.status !== 'reported'}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  selectedType === type && styles.typeButtonTextActive,
                ]}
              >
                {INCIDENT_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Incident Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Brief title describing the incident"
          editable={incident.status === 'reported'}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed description of what happened..."
          multiline
          numberOfLines={6}
          editable={incident.status === 'reported'}
        />
        <Text style={styles.helpText}>
          Minimum 20 characters required
        </Text>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Description</Text>
        <TextInput
          style={styles.input}
          value={locationDescription}
          onChangeText={setLocationDescription}
          placeholder="e.g., Highway 1 near exit 15"
          editable={incident.status === 'reported'}
        />
      </View>

      {/* Immediate Action */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Immediate Action Taken *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={immediateAction}
          onChangeText={setImmediateAction}
          placeholder="What actions were taken immediately after the incident?"
          multiline
          numberOfLines={4}
          editable={incident.status === 'reported'}
        />
      </View>

      {/* Photos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Photos ({incident.photos.length})
          </Text>
          {incident.status === 'reported' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCapturePhoto}
              disabled={capturingPhoto}
            >
              <Ionicons name="camera" size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {incident.photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {incident.photos.map((photo) => (
              <View key={photo.id} style={styles.photoGridItem}>
                <Image
                  source={{ uri: photo.local_uri }}
                  style={styles.photoGridImage}
                  resizeMode="cover"
                />
                {incident.status === 'reported' && (
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemoveAttachment(photo.id)}
                  >
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera-outline" size={48} color="#D1D5DB" />
            <Text style={styles.photoPlaceholderText}>
              No photos added
            </Text>
            {incident.severity === 'critical' && (
              <Text style={styles.warningText}>
                Photos recommended for critical incidents
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Involved Employees */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Involved Employees ({incident.involved_employees.length})
          </Text>
          {incident.status === 'reported' && !showInvolvedEmployees && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowInvolvedEmployees(true)}
            >
              <Ionicons name="person-add" size={20} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>

        {incident.involved_employees.map((employee, index) => (
          <View key={index} style={styles.employeeCard}>
            <View style={styles.employeeInfo}>
              <Ionicons name="person-circle" size={24} color="#6B7280" />
              <View style={styles.employeeDetails}>
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

        {showInvolvedEmployees && (
          <View style={styles.addEmployeeForm}>
            <Text style={styles.inputLabel}>Employee Name</Text>
            <TextInput
              style={styles.input}
              value={newEmployeeName}
              onChangeText={setNewEmployeeName}
              placeholder="Enter employee name"
            />

            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleButtons}>
              {(['driver', 'porter', 'supervisor', 'other'] as const).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    newEmployeeRole === role && styles.roleButtonActive,
                  ]}
                  onPress={() => setNewEmployeeRole(role)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      newEmployeeRole === role && styles.roleButtonTextActive,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowInvolvedEmployees(false);
                  setNewEmployeeName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAddEmployee}
              >
                <Text style={styles.confirmButtonText}>Add Employee</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {incident.involved_employees.length === 0 && !showInvolvedEmployees && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No employees added
            </Text>
          </View>
        )}
      </View>

      {/* Context Info */}
      {(tripId || truckId || stopId) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Information</Text>
          {tripId && (
            <View style={styles.infoRow}>
              <Ionicons name="git-branch" size={16} color="#6B7280" />
              <Text style={styles.infoText}>Trip ID: {tripId}</Text>
            </View>
          )}
          {truckId && (
            <View style={styles.infoRow}>
              <Ionicons name="car" size={16} color="#6B7280" />
              <Text style={styles.infoText}>Truck ID: {truckId}</Text>
            </View>
          )}
          {stopId && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.infoText}>Stop ID: {stopId}</Text>
            </View>
          )}
        </View>
      )}

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
      {incident.status === 'reported' && (
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
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {incident.status !== 'reported' && (
        <View style={styles.submittedInfo}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          <Text style={styles.submittedText}>
            Incident Report Submitted
          </Text>
          <Text style={styles.submittedMeta}>
            Status: {incident.status.toUpperCase()}
          </Text>
          {incident.acknowledged_by && (
            <Text style={styles.submittedMeta}>
              Acknowledged by: {incident.acknowledged_by}
            </Text>
          )}
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
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
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
    marginBottom: 12,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minWidth: '48%',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 4,
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
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
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
  employeeCard: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    marginBottom: 8,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeDetails: {
    marginLeft: 8,
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  employeeRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  employeeInvolvement: {
    fontSize: 13,
    color: '#374151',
    marginTop: 8,
    fontStyle: 'italic',
  },
  addEmployeeForm: {
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  roleButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  roleButtonTextActive: {
    color: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
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
    backgroundColor: '#EF4444',
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
