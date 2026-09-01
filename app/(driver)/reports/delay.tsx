/**
 * Delay Report Screen
 * Report delays with reason, estimated time, photos
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  submitDelayReport,
  getCurrentLocation,
  uploadPhoto,
} from '../../../src/services/api/driver-porter.service';
import { DelayReason } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DelayReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;

  const [selectedReason, setSelectedReason] = useState<DelayReason | null>(null);
  const [estimatedDelay, setEstimatedDelay] = useState('30');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    { value: DelayReason.TRAFFIC, label: 'Heavy Traffic', icon: 'traffic-cone' },
    { value: DelayReason.VEHICLE_PROBLEM, label: 'Vehicle Problem', icon: 'car-brake-alert' },
    { value: DelayReason.WEATHER, label: 'Bad Weather', icon: 'weather-lightning-rainy' },
    { value: DelayReason.LOADING_DELAY, label: 'Loading Delay', icon: 'dolly' },
    { value: DelayReason.CUSTOMER_REQUEST, label: 'Customer Request', icon: 'account-clock' },
    { value: DelayReason.ROAD_CLOSURE, label: 'Road Closure', icon: 'road-variant' },
    { value: DelayReason.OTHER, label: 'Other', icon: 'dots-horizontal' },
  ];

  const delayOptions = [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3+ hours' },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for the delay');
      return;
    }

    if (!estimatedDelay) {
      Alert.alert('Estimated Delay', 'Please select estimated delay duration');
      return;
    }

    Alert.alert(
      'Submit Delay Report',
      'Submit this delay report? The operator will be notified immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            setSubmitting(true);
            try {
              const locationResponse = await getCurrentLocation();

              const response = await submitDelayReport({
                trip_id: tripId,
                reported_by: 'current_user_id', // TODO: Get from auth
                reported_by_name: 'Current Driver', // TODO: Get from profile
                delay_reason: selectedReason,
                estimated_delay_minutes: parseInt(estimatedDelay),
                description: description || 'No additional details provided',
                location: locationResponse.data,
                photos: [], // TODO: Add photo upload
              });

              if (response.error) {
                Alert.alert('Error', response.error);
              } else {
                Alert.alert('Success', 'Delay report submitted', [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to submit delay report');
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
        <MaterialCommunityIcons name="clock-alert" size={48} color={colors.warning} />
        <Text style={[styles.title, { color: colors.text }]}>Report Delay</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Let the operator know about delays as soon as possible
        </Text>
      </View>

      {/* Delay Reason */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Reason for Delay <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.reasonGrid}>
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonButton,
                {
                  backgroundColor:
                    selectedReason === reason.value ? colors.warning + '20' : colors.surface,
                  borderColor:
                    selectedReason === reason.value ? colors.warning : colors.border,
                },
              ]}
              onPress={() => setSelectedReason(reason.value)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={reason.icon as any}
                size={32}
                color={selectedReason === reason.value ? colors.warning : colors.textSecondary}
              />
              <Text
                style={[
                  styles.reasonText,
                  {
                    color:
                      selectedReason === reason.value ? colors.warning : colors.text,
                  },
                ]}
              >
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Estimated Delay */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Estimated Delay <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.delayOptions}>
          {delayOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.delayButton,
                {
                  backgroundColor:
                    estimatedDelay === option.value ? colors.primary : colors.surface,
                  borderColor:
                    estimatedDelay === option.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setEstimatedDelay(option.value)}
            >
              <Text
                style={[
                  styles.delayButtonText,
                  {
                    color: estimatedDelay === option.value ? '#fff' : colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Additional Details */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Additional Details (Optional)
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
          placeholder="Provide any additional information about the delay..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </Card>

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        fullWidth
        size="lg"
        disabled={submitting || !selectedReason}
        icon={
          submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
          )
        }
      >
        {submitting ? 'Submitting...' : 'Submit Delay Report'}
      </Button>

      <View style={styles.footer}>
        <MaterialCommunityIcons name="information" size={16} color={colors.textSecondary} />
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          The operator will be notified immediately and may contact you for updates
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
    marginBottom: 12,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reasonButton: {
    width: '48%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  delayOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  delayButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: '30%',
    alignItems: 'center',
  },
  delayButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  textArea: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 120,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    gap: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});

