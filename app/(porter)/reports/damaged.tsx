/**
 * Porter Damaged Product Report Screen
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

const damageTypes = [
  { id: 'broken', label: 'Broken', icon: 'package-variant-closed-minus' },
  { id: 'crushed', label: 'Crushed', icon: 'package-down' },
  { id: 'torn', label: 'Torn/Ripped', icon: 'texture-box' },
  { id: 'wet', label: 'Water Damaged', icon: 'water' },
  { id: 'contaminated', label: 'Contaminated', icon: 'alert-circle' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
];

export default function DamagedProductReportScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [productName, setProductName] = useState('');
  const [quantityDamaged, setQuantityDamaged] = useState('');
  const [damageType, setDamageType] = useState('');
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

    if (!quantityDamaged || parseInt(quantityDamaged) <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (!damageType) {
      Alert.alert('Missing Information', 'Please select the type of damage');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe the damage');
      return;
    }

    if (photoUrls.length === 0) {
      Alert.alert(
        'No Photos',
        'Photos are highly recommended for damaged items. Continue without photos?',
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
      const response = await submitProductDiscrepancy({
        trip_id: 'current-trip-id', // TODO: Get from context
        discrepancy_type: 'damaged',
        product_name: productName.trim(),
        expected_quantity: 0,
        actual_quantity: 0,
        quantity_difference: parseInt(quantityDamaged),
        description: `${damageType}: ${description.trim()}`,
        photo_urls: photoUrls,
      });

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert(
          'Report Submitted',
          'Damaged product report has been submitted successfully',
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
        <MaterialCommunityIcons name="alert-octagon" size={24} color={colors.error} />
        <Text style={[styles.bannerText, { color: colors.error }]}>
          Report items that arrived or were delivered in damaged condition
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

      {/* Quantity Damaged */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Quantity Damaged <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={quantityDamaged}
          onChangeText={setQuantityDamaged}
          placeholder="Enter quantity"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />
      </Card>

      {/* Damage Type */}
      <Card style={styles.card}>
        <Text style={[styles.label, { color: colors.text }]}>
          Type of Damage <Text style={{ color: colors.error }}>*</Text>
        </Text>
        <View style={styles.damageTypeGrid}>
          {damageTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.damageTypeButton,
                {
                  backgroundColor: damageType === type.id ? colors.errorLight : colors.surface,
                  borderColor: damageType === type.id ? colors.error : colors.border,
                },
              ]}
              onPress={() => setDamageType(type.id)}
            >
              <MaterialCommunityIcons
                name={type.icon as any}
                size={28}
                color={damageType === type.id ? colors.error : colors.textSecondary}
              />
              <Text
                style={[
                  styles.damageTypeText,
                  { color: damageType === type.id ? colors.error : colors.text },
                ]}
              >
                {type.label}
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
          Describe the damage in detail. When and how was it discovered?
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the damage..."
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
          Take clear photos showing the damaged product from multiple angles
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
  damageTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  damageTypeButton: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
  },
  damageTypeText: {
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

