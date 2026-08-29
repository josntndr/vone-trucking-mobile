/**
 * AddressFormSection Component
 * Structured address form with dependent Country → Province → City → Barangay selectors
 * and real-time formatted address preview
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Control, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useTheme } from '../../hooks';
import { SearchableSelect, SelectOption } from './SearchableSelect';
import { Input } from '../ui/Input';
import {
  getCountries,
  getProvinces,
  getCities,
  getBarangays,
  getSuggestedPostalCode,
  formatAddressWithLine2,
} from '../../services/location.service';

export interface AddressFormSectionProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors?: any;
  disabled?: boolean;
}

export const AddressFormSection: React.FC<AddressFormSectionProps> = ({
  control,
  watch,
  setValue,
  errors = {},
  disabled = false,
}) => {
  const theme = useTheme();

  // Watch all address fields for live preview
  const countryCode = 'PH'; // Fixed to Philippines
  const provinceCode = watch('province_code');
  const cityCode = watch('city_code');
  const barangayCode = watch('barangay_code');
  const postalCode = watch('postal_code');
  const addressLine1 = watch('address_line_1');
  const addressLine2 = watch('address_line_2');

  // Location options state
  const [provinceOptions, setProvinceOptions] = useState<SelectOption[]>([]);
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<SelectOption[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Load provinces on mount (Philippines only)
  useEffect(() => {
    setLoadingProvinces(true);
    try {
      const provinces = getProvinces('PH');
      setProvinceOptions(provinces);
    } catch (error) {
      console.error('Error loading provinces:', error);
      setProvinceOptions([]);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (provinceCode) {
      setLoadingCities(true);
      try {
        const cities = getCities(provinceCode);
        setCityOptions(cities);
      } catch (error) {
        console.error('Error loading cities:', error);
        setCityOptions([]);
      } finally {
        setLoadingCities(false);
      }
    } else {
      setCityOptions([]);
      setBarangayOptions([]);
    }
  }, [provinceCode]);

  // Load barangays when city changes
  useEffect(() => {
    if (cityCode) {
      setLoadingBarangays(true);
      try {
        const barangays = getBarangays(cityCode);
        setBarangayOptions(barangays);
        
        // Suggest postal code
        const suggested = getSuggestedPostalCode(cityCode);
        if (suggested && !postalCode) {
          setValue('postal_code', suggested);
        }
      } catch (error) {
        console.error('Error loading barangays:', error);
        setBarangayOptions([]);
      } finally {
        setLoadingBarangays(false);
      }
    } else {
      setBarangayOptions([]);
    }
  }, [cityCode, setValue, postalCode]);

  // Clear dependent fields when parent changes
  useEffect(() => {
    if (provinceCode) {
      // Province changed, clear city and below
      setValue('city', '');
      setValue('city_code', '');
      setValue('barangay', '');
      setValue('barangay_code', '');
      setValue('postal_code', '');
    }
  }, [provinceCode, setValue]);

  useEffect(() => {
    if (cityCode) {
      // City changed, clear barangay and postal code
      setValue('barangay', '');
      setValue('barangay_code', '');
    }
  }, [cityCode, setValue]);

  // Generate formatted address preview
  const formattedPreview = useMemo(() => {
    if (!addressLine1 || !barangayCode || !cityCode || !provinceCode || !postalCode) {
      return null;
    }

    try {
      return formatAddressWithLine2({
        addressLine1,
        addressLine2,
        barangayCode,
        cityCode,
        provinceCode,
        postalCode,
        countryCode: 'PH', // Fixed to Philippines
      });
    } catch (error) {
      return null;
    }
  }, [addressLine1, addressLine2, barangayCode, cityCode, provinceCode, postalCode]);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={[styles.sectionHeader, { marginBottom: theme.spacing[4] }]}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text,
              fontSize: theme.fontSizes.lg,
              fontWeight: theme.fontWeights.semibold,
            },
          ]}
        >
          Complete Address
        </Text>
        <Text
          style={[
            styles.sectionSubtitle,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          Enter the employee's detailed address in the Philippines
        </Text>
      </View>

      {/* Country (Fixed to Philippines - Read-only display) */}
      <View style={{ marginBottom: theme.spacing[4] }}>
        <Text
          style={[
            {
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              marginBottom: theme.spacing[2],
            },
          ]}
        >
          Country
        </Text>
        <View
          style={[
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.md,
              paddingVertical: theme.spacing[3],
              paddingHorizontal: theme.spacing[4],
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <Text
            style={[
              {
                flex: 1,
                color: theme.colors.text,
                fontSize: theme.fontSizes.base,
              },
            ]}
          >
            Philippines
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 18 }}>🇵🇭</Text>
        </View>
        <Text
          style={[
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.xs,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          All employee addresses must be in the Philippines
        </Text>
      </View>

      {/* Province/Region */}
      <Controller
        control={control}
        name="province_code"
        render={({ field: { onChange, value } }) => (
          <SearchableSelect
            label="Province/Region"
            value={value}
            options={provinceOptions}
            onSelect={(option) => {
              onChange(option.code);
              setValue('province', option.name);
            }}
            placeholder="Select province or region"
            error={errors.province_code?.message || errors.province?.message}
            disabled={disabled}
            required
            loading={loadingProvinces}
            searchPlaceholder="Search provinces..."
            emptyMessage="No provinces found"
          />
        )}
      />

      {/* City/Municipality */}
      <Controller
        control={control}
        name="city_code"
        render={({ field: { onChange, value } }) => (
          <SearchableSelect
            label="City/Municipality"
            value={value}
            options={cityOptions}
            onSelect={(option) => {
              onChange(option.code);
              setValue('city', option.name);
            }}
            placeholder={provinceCode ? "Select city or municipality" : "Select province first"}
            error={errors.city_code?.message || errors.city?.message}
            disabled={disabled || !provinceCode}
            required
            loading={loadingCities}
            searchPlaceholder="Search cities..."
            emptyMessage={provinceCode ? "No cities found" : "Select a province first"}
          />
        )}
      />

      {/* Barangay */}
      <Controller
        control={control}
        name="barangay_code"
        render={({ field: { onChange, value } }) => (
          <SearchableSelect
            label="Barangay"
            value={value}
            options={barangayOptions}
            onSelect={(option) => {
              onChange(option.code);
              setValue('barangay', option.name);
            }}
            placeholder={cityCode ? "Select barangay" : "Select city first"}
            error={errors.barangay_code?.message || errors.barangay?.message}
            disabled={disabled || !cityCode}
            required
            loading={loadingBarangays}
            searchPlaceholder="Search barangays..."
            emptyMessage={cityCode ? "No barangays found for this city" : "Select a city first"}
          />
        )}
      />

      {/* Postal Code */}
      <Controller
        control={control}
        name="postal_code"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Postal Code"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="e.g., 4103"
            error={errors.postal_code?.message}
            editable={!disabled}
            required
            keyboardType="number-pad"
            maxLength={4}
            containerStyle={{ marginBottom: theme.spacing[4] }}
          />
        )}
      />

      {/* Address Line 1 */}
      <Controller
        control={control}
        name="address_line_1"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="House/Unit, Building, Street, or Subdivision"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="e.g., Block 3 Lot 15, Treelane 3 Subdivision"
            error={errors.address_line_1?.message}
            editable={!disabled}
            required
            multiline
            numberOfLines={2}
            containerStyle={{ marginBottom: theme.spacing[4] }}
          />
        )}
      />

      {/* Address Line 2 (Optional) */}
      <Controller
        control={control}
        name="address_line_2"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Apartment, Floor, Landmark, or Additional Directions"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Optional: Near SM Imus, 2nd Floor"
            error={errors.address_line_2?.message}
            editable={!disabled}
            multiline
            numberOfLines={2}
            containerStyle={{ marginBottom: theme.spacing[4] }}
          />
        )}
      />

      {/* Complete Address Preview */}
      {formattedPreview && (
        <View
          style={[
            styles.previewContainer,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing[4],
              marginTop: theme.spacing[2],
            },
          ]}
        >
          <Text
            style={[
              styles.previewLabel,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.xs,
                fontWeight: theme.fontWeights.semibold,
                textTransform: 'uppercase',
                marginBottom: theme.spacing[2],
              },
            ]}
          >
            Complete Address Preview
          </Text>
          <Text
            style={[
              styles.previewText,
              {
                color: theme.colors.text,
                fontSize: theme.fontSizes.base,
                lineHeight: theme.fontSizes.base * 1.5,
              },
            ]}
          >
            {formattedPreview}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Dynamic spacing applied via theme
  },
  sectionHeader: {
    // Dynamic spacing applied inline
  },
  sectionTitle: {
    // Dynamic styles applied inline
  },
  sectionSubtitle: {
    // Dynamic styles applied inline
  },
  previewContainer: {
    // Dynamic styles applied inline
  },
  previewLabel: {
    // Dynamic styles applied inline
  },
  previewText: {
    // Dynamic styles applied inline
  },
});
