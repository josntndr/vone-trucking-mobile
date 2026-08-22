/**
 * Incident Report Screen
 * Report accidents, theft, damage, injuries
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  submitIncidentReport,
  getCurrentLocation,
} from '../../../src/services/api/driver-porter.service';
import { IncidentType, IncidentSeverity } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function IncidentReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;

  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity>(IncidentSeverity.MEDIUM);
  const [description, setDescription] = useState('');
  const [injuriesReported, setInjuriesReported] = useState(false);
  const [policeNotified, setPoliceNotified] = useState(false);
  const [policeReportNumber, setPoliceReportNumber] = useState('');
  const [otherParties, setOtherParties] = useState(false);
  const [otherPartiesDetails, setOtherPartiesDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const incidentTypes = [
    { value: IncidentType.ACCIDENT, label: 'Accident', icon: 'car-crash', color: colors.error },
    { value: IncidentType.THEFT, label: 'Theft', icon: 'shield-alert', color: colors.error },
    { value: IncidentType.DAMAGE, label: 'Damage', icon: 'package-variant-closed-remove', color: colors.warning },
    { value: IncidentType.INJURY, label: 'Injury', icon: 'medical-bag', color: colors.error },
    { value: IncidentType.NEAR_MISS, label: 'Near Miss', icon: 'alert-outline', color: colors.warning },
    { value: IncidentType.OTHER, label: 'Other', icon: 'dots-horizontal', color: colors.textSecondary },
  ];

  const severityLevels = [
    { value: IncidentSeverity.LOW, label: 'Low', color: colors.success },
    { value: IncidentSeverity.MEDIUM, label: 'Medium', color: colors.warning },
    { value: IncidentSeverity.HIGH, label: 'High', color: colors.error },
    { value: IncidentSeverity.CRITICAL, label: 'Critical', color: '#D32F2F' },
  ];

  const handleSubmit = async () => {
    if (!incidentType) {
      Alert.alert('Select Type', 'Please select the type of incident');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Description Required', 'Please provide a description of the incident');
      return;
    }

    if (policeNotified && !policeReportNumber.trim()) {
      Alert.alert('Police Report Number', 'Please enter the police report number');
      return;
    }

    if (otherParties && !otherPartiesDetails.trim()) {
      Alert.alert('Other Parties Details', 'Please provide details about other parties involved');
      return;
    }

    Alert.alert(
      'Submit Incident Report',
      'This is a serious report. Are you sure you want to submit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: async () => {
            setSubmitting(true);
            try {
              const locationResponse = await getCurrentLocation();

              const response = await submitIncidentReport({
                trip_id: tripId,
                reported_by: 'current_user_id',
                reported_by_name: 'Current Driver',
                incident_type: incidentType,
                severity,
                description: description.trim(),
                location: locationResponse.data,
                photos: [],
                injuries_reported: injuriesReported,
                police_notified: policeNotified,
                police_report_number: policeReportNumber.trim() || undefined,
                other_parties_involved: otherParties,
                other_parties_details: otherPartiesDetails.trim() || undefined,
              });

              if (response.error) {
                Alert.alert('Error', response.error);
              } else {
                Alert.alert(
                  'Report Submitted',
                  'Incident report has been submitted. The operator will contact you shortly.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to submit incident report');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.title, { color: colors.text }]}>Report Incident</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Report any accidents, injuries, theft, or damage immediately
        </Text>
      </View>

      {/* Incident Type */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Type of Incident <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.typeGrid}>
          {incidentTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    incidentType === type.value ? type.color + '20' : colors.surface,
                  borderColor:
                    incidentType === type.value ? type.color : colors.border,
                },
              ]}
              onPress={() => setIncidentType(type.value)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={type.icon as any}
                size={32}
                color={incidentType === type.value ? type.color : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color: incidentType === type.value ? type.color : colors.text,
                  },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Severity */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Severity <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.severityOptions}>
          {severityLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.severityButton,
                {
                  backgroundColor:
                    severity === level.value ? level.color : colors.surface,
                  borderColor:
                    severity === level.value ? level.color : colors.border,
                },
              ]}
              onPress={() => setSeverity(level.value)}
            >
              <Text
                style={[
                  styles.severityText,
                  {
                    color: severity === level.value ? '#fff' : colors.text,
                  },
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Description */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Description <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Describe what happened, when, and where
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Provide detailed description of the incident..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </Card>

      {/* Injuries */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Injuries Reported
            </Text>
            <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
              Were there any injuries?
            </Text>
          </View>
          <Switch
            value={injuriesReported}
            onValueChange={setInjuriesReported}
            trackColor={{ false: colors.border, true: colors.errorLight }}
            thumbColor={injuriesReported ? colors.error : colors.surface}
          />
        </View>
      </Card>

      {/* Police */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Police Notified
            </Text>
            <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
              Was the police called?
            </Text>
          </View>
          <Switch
            value={policeNotified}
            onValueChange={setPoliceNotified}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={policeNotified ? colors.primary : colors.surface}
          />
        </View>

        {policeNotified && (
          <View style={styles.conditionalField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Police Report Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={policeReportNumber}
              onChangeText={setPoliceReportNumber}
              placeholder="Enter police report number"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}
      </Card>

      {/* Other Parties */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Other Parties Involved
            </Text>
            <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
              Were other vehicles/people involved?
            </Text>
          </View>
          <Switch
            value={otherParties}
            onValueChange={setOtherParties}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={otherParties ? colors.primary : colors.surface}
          />
        </View>

        {otherParties && (
          <View style={styles.conditionalField}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Details of Other Parties
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={otherPartiesDetails}
              onChangeText={setOtherPartiesDetails}
              placeholder="Names, contact info, vehicle details..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        )}
      </Card>

      {/* Submit Button */}
      <Button
        title={submitting ? 'Submitting...' : 'Submit Incident Report'}
        onPress={handleSubmit}
        fullWidth
        size="large"
        disabled={submitting || !incidentType || !description.trim()}
        style={{ backgroundColor: colors.error }}
        icon={
          submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="alert-circle" size={24} color="#fff" />
          )
        }
      />

      <View style={styles.footer}>
        <MaterialCommunityIcons name="information" size={16} color={colors.error} />
        <Text style={[styles.footerText, { color: colors.error }]}>
          This is a serious report. The operator will be notified immediately and may call you.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    width: '48%',
    aspectRatio: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  severityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchHint: {
    fontSize: 13,
  },
  conditionalField: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
});

