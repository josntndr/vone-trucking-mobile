/**
 * Porter Missing Product Report Screen
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
import { DiscrepancyType, ProductDiscrepancySubmission } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function MissingProductReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [quantityMissing, setQuantityMissing] = useState('');
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

    if (!quantityMissing || parseInt(quantityMissing) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe when/how the item was found missing');
      return;
    }

    if (photoUrls.length === 0) {
      Alert.alert(
        'No Photos',
        'It\'s recommended to take photos. Continue without photos?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: submitReport },
        ]
      );
    } else {
      submitReport();
    }
  };

  const submitReport = async () => {
    setSubmitting(true);
    try {
      const payload: ProductDiscrepancySubmission = {
        trip_id: 'current-trip-id', // TODO: Get from context
        discrepancy_type: DiscrepancyType.MISSING,
        product_name: productName.trim(),
        product_description: description.trim(),
        expected_quantity: parseInt(quantityMissing),
        actual_quantity: 0,
        quantity_difference: parseInt(quantityMissing),
        quantity: parseInt(quantityMissing),
        description: description.trim(),
        photo_urls: photoUrls,
        photos: photoUrls,
      };
      
      const response = await submitProductDiscrepancy(payload as any);

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert(
          'Report Submitted',
          'Missing product report has been submitted successfully',
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
      <Card style={[styles.banner, { backgroundColor: colors.warningLight }]}>
        <MaterialCommunityIcons name="alert" size={24} color={colors.warning} />
        <Text style={[styles.bannerText, { color: colors.warning }]}>
          Report items that are missing from the manifest or delivery
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

      {/* Quantity Missing */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Quantity Missing <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={quantityMissing}
          onChangeText={setQuantityMissing}
          placeholder="Enter quantity"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </Card>

      {/* Description */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Description <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          When and how was the item discovered missing?
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
          Photos ({photoUrls.length})
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Take photos of the manifest, cargo area, or other relevant evidence
        </Text>
        <TouchableOpacity
          style={[styles.photoButton, { borderColor: colors.primary }]}
          onPress={handleTakePhoto}
        >
          <MaterialCommunityIcons name="camera" size={40} color={colors.primary} />
          <Text style={[styles.photoButtonText, { color: colors.primary }]}>
            Take Photo
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: submitting ? colors.border : colors.warning },
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

