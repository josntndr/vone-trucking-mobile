/**
 * AddressFormSection Component
 * Structured address form with proper Region/Province separation
 * Hierarchy: Country → Region → Province (optional for NCR) → City → Barangay
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Control, Controller, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { useTheme } from '../../hooks';
import { SearchableSelect, SelectOption } from './SearchableSelect';
import { Input } from '../ui/Input';
import {
  getRegions,
  getProvinces,
  getCities,
  getCityByCode,
  getBarangays,
  getSuggestedPostalCodes,
  formatAddress,
  regionHasProvinces,
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

  // Watch all address fields for dependent selectors and live preview
  const countryCode = 'PH'; // Fixed to Philippines
  const regionCode = watch('region_code');
  const provinceCode = watch('province_code');
  const cityCode = watch('city_code');
  const barangayCode = watch('barangay_code');
  const postalCode = watch('postal_code');
  const addressLine1 = watch('address_line_1');
  const addressLine2 = watch('address_line_2');

  // Location options state
  const [regionOptions, setRegionOptions] = useState<SelectOption[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<SelectOption[]>([]);
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<SelectOption[]>([]);

  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const previousRegionCode = useRef<string | undefined>(undefined);
  const previousProvinceCode = useRef<string | undefined>(undefined);
  const previousCityCode = useRef<string | undefined>(undefined);

  // Check if current region requires a province (all regions except NCR)
  const requiresProvince = useMemo(() => {
    return regionCode ? regionHasProvinces(regionCode) : true;
  }, [regionCode]);

  const provinceIsRequired = requiresProvince;
  const mustSelectProvinceBeforeCity = requiresProvince && !provinceCode;

  // Load regions on mount (Philippines only)
  useEffect(() => {
    setLoadingRegions(true);
    try {
      const regions = getRegions('PH');
      const options = regions.map(r => ({
        code: r.code,
        label: r.name,
        name: r.name,
      }));
      setRegionOptions(options);
    } catch (error) {
      console.error('Error loading regions:', error);
      setRegionOptions([]);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (regionCode) {
      if (!regionHasProvinces(regionCode)) {
        // NCR - no provinces
        setProvinceOptions([]);
        // Clear province fields
        setValue('province', '', { shouldValidate: true, shouldDirty: true });
        setValue('province_code', '', { shouldValidate: true, shouldDirty: true });
      } else {
        // Other regions - load provinces
        setLoadingProvinces(true);
        try {
          const provinces = getProvinces(regionCode);
          const options = provinces.map(p => ({
            code: p.code,
            label: p.name,
            name: p.name,
          }));
          setProvinceOptions(options);
        } catch (error) {
          console.error('Error loading provinces:', error);
          setProvinceOptions([]);
        } finally {
          setLoadingProvinces(false);
        }
      }
    } else {
      setProvinceOptions([]);
    }
  }, [regionCode, setValue]);

  // Load cities when region or province changes
  useEffect(() => {
    if (regionCode) {
      setLoadingCities(true);
      try {
        const cities = getCities({
          regionCode,
          provinceCode: provinceCode || undefined,
        });
        const options = cities.map(c => ({
          code: c.code,
          label: `${c.name} (${c.type === 'municipality' ? 'Municipality' : 'City'})`,
          name: c.name,
        }));
        setCityOptions(options);
      } catch (error) {
        console.error('Error loading cities:', error);
        setCityOptions([]);
      } finally {
        setLoadingCities(false);
      }
    } else {
      setCityOptions([]);
    }
  }, [regionCode, provinceCode]);

  // Load barangays when city changes
  useEffect(() => {
    if (cityCode) {
      setLoadingBarangays(true);
      try {
        const barangays = getBarangays(cityCode);
        const options = barangays.map(b => ({
          code: b.code,
          label: b.name,
          name: b.name,
        }));
        setBarangayOptions(options);
        
        // Suggest postal code(s)
        const suggested = getSuggestedPostalCodes(cityCode);
        if (suggested && suggested.length > 0 && !postalCode) {
          setValue('postal_code', suggested[0], { shouldValidate: true, shouldDirty: true });
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
    if (previousRegionCode.current === undefined) {
      previousRegionCode.current = regionCode;
      return;
    }

    if (previousRegionCode.current === regionCode) {
      return;
    }

    if (regionCode) {
      // Region changed, clear province and below
      if (!regionHasProvinces(regionCode)) {
        // NCR - clear province immediately
        setValue('province', '', { shouldValidate: true, shouldDirty: true });
        setValue('province_code', '', { shouldValidate: true, shouldDirty: true });
      }
      setValue('city', '', { shouldValidate: true, shouldDirty: true });
      setValue('city_code', '', { shouldValidate: true, shouldDirty: true });
      setValue('barangay', '', { shouldValidate: true, shouldDirty: true });
      setValue('barangay_code', '', { shouldValidate: true, shouldDirty: true });
      setValue('postal_code', '', { shouldValidate: true, shouldDirty: true });
    }
    previousRegionCode.current = regionCode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionCode]);

  useEffect(() => {
    if (previousProvinceCode.current === undefined) {
      previousProvinceCode.current = provinceCode;
      return;
    }

    if (previousProvinceCode.current === provinceCode) {
      return;
    }

    if (provinceCode) {
      // Province changed, clear city and below
      setValue('city', '');
      setValue('city_code', '');
      setValue('barangay', '');
      setValue('barangay_code', '');
      setValue('postal_code', '');
    }
    previousProvinceCode.current = provinceCode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode]);

  useEffect(() => {
    if (previousCityCode.current === undefined) {
      previousCityCode.current = cityCode;
      return;
    }

    if (previousCityCode.current === cityCode) {
      return;
    }

    if (cityCode) {
      // City changed, clear barangay and postal code
      setValue('barangay', '');
      setValue('barangay_code', '');
    }
    previousCityCode.current = cityCode;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityCode]);

  // Get names for preview
  const regionName = useMemo(() => {
    const region = regionOptions.find(r => r.code === regionCode);
    return region?.name || '';
  }, [regionCode, regionOptions]);

  const provinceName = useMemo(() => {
    const province = provinceOptions.find(p => p.code === provinceCode);
    return province?.name || '';
  }, [provinceCode, provinceOptions]);

  const cityName = useMemo(() => {
    const city = cityOptions.find(c => c.code === cityCode);
    return city?.name || '';
  }, [cityCode, cityOptions]);

  const barangayName = useMemo(() => {
    const barangay = barangayOptions.find(b => b.code === barangayCode);
    return barangay?.name || '';
  }, [barangayCode, barangayOptions]);

  // Generate formatted address preview
  const formattedPreview = useMemo(() => {
    if (!addressLine1 || !barangayCode || !cityCode || !regionCode || !postalCode) {
      return null;
    }

    try {
      return formatAddress({
        countryCode: 'PH',
        countryName: 'Philippines',
        regionCode,
        regionName,
        provinceCode: requiresProvince ? provinceCode : undefined,
        provinceName: requiresProvince ? provinceName : undefined,
        cityCode,
        cityName,
        barangayCode,
        barangayName,
        postalCode,
        addressLine1,
        addressLine2,
      });
    } catch (error) {
      return null;
    }
  }, [addressLine1, addressLine2, barangayCode, barangayName, cityCode, cityName, provinceCode, provinceName, regionCode, regionName, postalCode, requiresProvince]);

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
          Enter the employee's detailed Philippine address
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
          <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} />
        </View>
      </View>

      {/* Region (New field - separate from Province) */}
      <Controller
        control={control}
        name="region_code"
        render={({ field: { onChange, value } }) => (
          <SearchableSelect
            label="Region"
            value={value}
            options={regionOptions}
            onSelect={(option) => {
              onChange(option.code);
              setValue('region', option.name, { shouldValidate: true, shouldDirty: true });
            }}
            placeholder="Select region"
            error={errors.region_code?.message || errors.region?.message}
            disabled={disabled}
            required
            loading={loadingRegions}
            searchPlaceholder="Search regions..."
            emptyMessage="No regions found"
          />
        )}
      />

      {/* Province (Separate field - optional for NCR) */}
      {requiresProvince ? (
        <Controller
          control={control}
          name="province_code"
          render={({ field: { onChange, value } }) => (
            <SearchableSelect
              label="Province"
              value={value}
              options={provinceOptions}
              onSelect={(option) => {
                onChange(option.code);
                setValue('province', option.name, { shouldValidate: true, shouldDirty: true });
              }}
              placeholder={regionCode ? "Select province" : "Select region first"}
              error={errors.province_code?.message || errors.province?.message}
              disabled={disabled || !regionCode}
              required={provinceIsRequired}
              loading={loadingProvinces}
              searchPlaceholder="Search provinces..."
              emptyMessage={regionCode ? "No provinces found" : "Select a region first"}
            />
          )}
        />
      ) : regionCode ? (
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
            Province
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
              },
            ]}
          >
            <Text
              style={[
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.base,
                  fontStyle: 'italic',
                },
              ]}
            >
              Not applicable for {regionName}
            </Text>
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
            {regionName} does not have provinces
          </Text>
        </View>
      ) : null}

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
              setValue('city', option.name, { shouldValidate: true, shouldDirty: true });
            }}
            placeholder={
              !regionCode
                ? "Select region first"
                : mustSelectProvinceBeforeCity
                ? "Select province first"
                : "Select city or municipality"
            }
            error={errors.city_code?.message || errors.city?.message}
            disabled={disabled || !regionCode || mustSelectProvinceBeforeCity}
            required
            loading={loadingCities}
            searchPlaceholder="Search cities..."
            emptyMessage={
              !regionCode
                ? "Select a region first"
                : mustSelectProvinceBeforeCity
                ? "Select a province first"
                : "No cities or municipalities found"
            }
          />
        )}
      />

      {/* Barangay (Fixed spelling) */}
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
              setValue('barangay', option.name, { shouldValidate: true, shouldDirty: true });
            }}
            placeholder={cityCode ? "Select barangay" : "Select city first"}
            error={errors.barangay_code?.message || errors.barangay?.message}
            disabled={disabled || !cityCode}
            required
            loading={loadingBarangays}
            searchPlaceholder="Search barangays..."
            emptyMessage={cityCode ? "Barangay data could not be loaded. Please retry." : "Select a city first"}
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
