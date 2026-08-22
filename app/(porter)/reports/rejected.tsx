/**
 * Porter Rejected Product Report Screen
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
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { submitProductDiscrepancy } from '../../../src/services/api/driver-porter.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const rejectionReasons = [
  { id: 'wrong_item', label: 'Wrong Item', icon: 'swap-horizontal' },
  { id: 'damaged', label: 'Damaged', icon: 'package-variant-closed-minus' },
  { id: 'expired', label: 'Expired', icon: 'clock-alert' },
  { id: 'incomplete', label: 'Incomplete Order', icon: 'package-variant-closed-remove' },
  { id: 'no_order', label: 'No Order Placed', icon: 'close-circle' },
  { id: 'other', label: 'Other Reason', icon: 'dots-horizontal' },
];

export default function RejectedProductReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [quantityRejected, setQuantityRejected] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleTakePhoto = () => {
    // TODO: Implement camera/photo picker
    Alert.alert('Photo Upload', 'Camera integration pending');
    
    // Mock photo URL for now
    const mockPhotoUrl = `https://example.com/photos/${Date.now()}.jpg`;
    setPhotoUrls([...photoUrls, mockPhotoUrl]);
  };

  const handleSubmit = async () => {
    if (!productName.trim()) {
      Alert.alert('Missing Information', 'Please enter the product name');
      return;
    }

    if (!quantityRejected || parseInt(quantityRejected) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (!rejectionReason) {
      Alert.alert('Missing Information', 'Please select the rejection reason');
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Missing Information', 'Please enter the customer name');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe what happened');
      return;
    }

    if (photoUrls.length === 0) {
      Alert.alert(
        'No Photos',
        'Photos are required for rejected items. Please take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirm Rejection',
      'This will record that the customer rejected these items. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: submitReport },
      ]
    );
  };

  const submitReport = async () => {
    setSubmitting(true);
    try {
      const response = await submitProductDiscrepancy({
        trip_id: 'current-trip-id', // TODO: Get from context
        discrepancy_type: 'returned',
        product_name: productName.trim(),
        expected_quantity: 0,
        actual_quantity: 0,
        quantity_difference: parseInt(quantityRejected),
        description: `Rejected by ${customerName.trim()} - ${rejectionReason}: ${description.trim()}`,
        photo_urls: photoUrls,
      });

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert(
          'Report Submitted',
          'Rejected product report has been submitted successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Info Banner */}
      <Card style={[styles.banner, { backgroundColor: colors.errorLight }]}>
        <MaterialCommunityIcons name="arrow-u-left-top" size={24} color={colors.error} />
        <Text style={[styles.bannerText, { color: colors.error }]}>
          Report items that were refused or returned by the customer
        </Text>
      </Card>

      {/* Product Name */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Product Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={productName}
          onChangeText={setProductName}
          placeholder="Enter product name"
          placeholderTextColor={colors.textSecondary}
        />
      </Card>

      {/* Quantity Rejected */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Quantity Rejected <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={quantityRejected}
          onChangeText={setQuantityRejected}
          placeholder="Enter quantity"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </Card>

      {/* Rejection Reason */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Rejection Reason <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.reasonGrid}>
          {rejectionReasons.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              style={[
                styles.reasonButton,
                {
                  backgroundColor: rejectionReason === reason.id ? colors.errorLight : colors.surface,
                  borderColor: rejectionReason === reason.id ? colors.error : colors.border,
                },
              ]}
              onPress={() => setRejectionReason(reason.id)}
            >
              <MaterialCommunityIcons
                name={reason.icon as any}
                size={28}
                color={rejectionReason === reason.id ? colors.error : colors.textSecondary}
              />
              <Text
                style={[
                  styles.reasonText,
                  { color: rejectionReason === reason.id ? colors.error : colors.text },
                ]}
              >
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Customer Name */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Customer Name <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Name of person who rejected the items
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter customer name"
          placeholderTextColor={colors.textSecondary}
        />
      </Card>

      {/* Description */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Description <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Describe what happened and any customer comments
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the situation..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </Card>

      {/* Photos */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Photos ({photoUrls.length}) <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Required: Take photos of rejected items and customer signature if available
        </Text>
        <TouchableOpacity
          style={[styles.photoButton, { borderColor: colors.error }]}
          onPress={handleTakePhoto}
        >
          <MaterialCommunityIcons name="camera" size={40} color={colors.error} />
          <Text style={[styles.photoButtonText, { color: colors.error }]}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: submitting ? colors.border : colors.error },
        ]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="send" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </>
        )}
      </TouchableOpacity>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reasonButton: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  textArea: {
    padding: 16,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 120,
  },
  photoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});

