/**
 * Truck Problem Report Screen
 * Report mechanical or technical issues with the truck
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
  submitTruckProblemReport,
  getCurrentLocation,
} from '../../../src/services/api/driver-porter.service';
import { TruckProblemType, TruckProblemSeverity } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TruckProblemReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;
  const truckId = params.truckId as string;

  const [problemType, setProblemType] = useState<TruckProblemType | null>(null);
  const [severity, setSeverity] = useState<TruckProblemSeverity>(TruckProblemSeverity.MODERATE);
  const [description, setDescription] = useState('');
  const [canContinue, setCanContinue] = useState(true);
  const [odometerReading, setOdometerReading] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const problemTypes = [
    { value: TruckProblemType.ENGINE, label: 'Engine', icon: 'engine' },
    { value: TruckProblemType.BRAKES, label: 'Brakes', icon: 'car-brake-alert' },
    { value: TruckProblemType.TIRES, label: 'Tires', icon: 'car-tire-alert' },
    { value: TruckProblemType.LIGHTS, label: 'Lights', icon: 'car-light-alert' },
    { value: TruckProblemType.STEERING, label: 'Steering', icon: 'steering' },
    { value: TruckProblemType.SUSPENSION, label: 'Suspension', icon: 'car-settings' },
    { value: TruckProblemType.ELECTRICAL, label: 'Electrical', icon: 'flash-alert' },
    { value: TruckProblemType.FUEL, label: 'Fuel System', icon: 'gas-station' },
    { value: TruckProblemType.COOLING, label: 'Cooling', icon: 'coolant-temperature' },
    { value: TruckProblemType.OTHER, label: 'Other', icon: 'wrench' },
  ];

  const severityLevels = [
    { value: TruckProblemSeverity.MINOR, label: 'Minor', description: 'Can wait', color: colors.success },
    { value: TruckProblemSeverity.MODERATE, label: 'Moderate', description: 'Need attention', color: colors.warning },
    { value: TruckProblemSeverity.SEVERE, label: 'Severe', description: 'Urgent', color: colors.error },
    { value: TruckProblemSeverity.CRITICAL, label: 'Critical', description: 'Cannot drive', color: '#D32F2F' },
  ];

  const handleSubmit = async () => {
    if (!problemType) {
      Alert.alert('Select Problem', 'Please select the type of problem');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Description Required', 'Please describe the problem');
      return;
    }

    Alert.alert(
      'Submit Truck Problem Report',
      'Submit this report? The operator will be notified immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              const locationResponse = await getCurrentLocation();

              const response = await submitTruckProblemReport({
                trip_id: tripId || undefined,
                truck_id: truckId,
                reported_by: 'current_user_id',
                reported_by_name: 'Current Driver',
                problem_type: problemType,
                severity,
                description: description.trim(),
                can_continue_trip: canContinue,
                location: locationResponse.data,
                photos: [],
                odometer_reading: odometerReading ? parseInt(odometerReading) : undefined,
              });

              if (response.error) {
                Alert.alert('Error', response.error);
              } else {
                Alert.alert(
                  'Report Submitted',
                  'Truck problem report has been submitted. The operator will contact you shortly.',
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to submit truck problem report');
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
        <MaterialCommunityIcons name="wrench" size={48} color={colors.error} />
        <Text style={[styles.title, { color: colors.text }]}>Truck Problem</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Report any mechanical or technical issues with the truck
        </Text>
      </View>

      {/* Problem Type */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Type of Problem <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.typeGrid}>
          {problemTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    problemType === type.value ? colors.errorLight : colors.surface,
                  borderColor:
                    problemType === type.value ? colors.error : colors.border,
                },
              ]}
              onPress={() => setProblemType(type.value)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={type.icon as any}
                size={28}
                color={problemType === type.value ? colors.error : colors.textSecondary}
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color: problemType === type.value ? colors.error : colors.text,
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
        <View style={styles.severityList}>
          {severityLevels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.severityItem,
                {
                  backgroundColor:
                    severity === level.value ? level.color + '20' : colors.surface,
                  borderColor:
                    severity === level.value ? level.color : colors.border,
                },
              ]}
              onPress={() => setSeverity(level.value)}
            >
              <View style={styles.severityContent}>
                <Text
                  style={[
                    styles.severityLabel,
                    {
                      color: severity === level.value ? level.color : colors.text,
                    },
                  ]}
                >
                  {level.label}
                </Text>
                <Text
                  style={[
                    styles.severityDescription,
                    {
                      color: severity === level.value ? level.color : colors.textSecondary,
                    },
                  ]}
                >
                  {level.description}
                </Text>
              </View>
              {severity === level.value && (
                <MaterialCommunityIcons name="check-circle" size={24} color={level.color} />
              )}
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
          Describe the problem, symptoms, and when it started
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
          placeholder="Describe the problem in detail..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </Card>

      {/* Can Continue */}
      <Card style={styles.card}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <Text style={[styles.switchLabel, { color: colors.text }]}>
              Can Continue Trip?
            </Text>
            <Text style={[styles.switchHint, { color: colors.textSecondary }]}>
              Is it safe to continue driving?
            </Text>
          </View>
          <Switch
            value={canContinue}
            onValueChange={setCanContinue}
            trackColor={{ false: colors.errorLight, true: colors.successLight }}
            thumbColor={canContinue ? colors.success : colors.error}
          />
        </View>

        {!canContinue && (
          <View style={styles.warningBox}>
            <MaterialCommunityIcons name="alert" size={20} color={colors.error} />
            <Text style={[styles.warningText, { color: colors.error }]}>
              The operator will be notified urgently. Do not continue driving if unsafe.
            </Text>
          </View>
        )}
      </Card>

      {/* Odometer Reading */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Current Odometer Reading (Optional)
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
          value={odometerReading}
          onChangeText={setOdometerReading}
          placeholder="Enter current odometer reading (km)"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </Card>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        fullWidth
        size="lg"
        disabled={submitting || !problemType || !description.trim()}
        style={{ backgroundColor: colors.error }}
        icon={
          submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
          )
        }
      >
        {submitting ? 'Submitting...' : 'Submit Problem Report'}
      </Button>

      <View style={styles.footer}>
        <MaterialCommunityIcons name="information" size={16} color={colors.textSecondary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          The operator will be notified and will arrange for inspection or repair
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
    gap: 8,
  },
  typeButton: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  severityList: {
    gap: 8,
  },
  severityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  severityContent: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  severityDescription: {
    fontSize: 13,
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
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
  },
});

