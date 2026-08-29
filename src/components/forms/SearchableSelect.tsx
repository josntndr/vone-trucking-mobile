/**
 * SearchableSelect Component
 * Mobile-friendly searchable dropdown using bottom sheet pattern
 * Contained within mobile app frame with opaque backgrounds
 * Uses PortalContext to render at app root level
 */

import React, { useState, useMemo, useEffect, useId } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks';
import { usePortal } from '../../contexts/PortalContext';

export interface SelectOption {
  code: string;
  label: string;
  name: string;
}

export interface SearchableSelectProps {
  label: string;
  value?: string; // The selected code
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  error,
  disabled = false,
  required = false,
  loading = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found',
  onSearch,
}) => {
  const theme = useTheme();
  const portal = usePortal();
  const portalId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected option to display its label
  const selectedOption = useMemo(
    () => options.find(opt => opt.code === value),
    [options, value]
  );

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter(
      opt =>
        opt.label.toLowerCase().includes(query) ||
        opt.name.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Register/unregister portal content when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      portal.registerPortal(portalId, renderOverlay());
    } else {
      portal.unregisterPortal(portalId);
    }
    return () => {
      portal.unregisterPortal(portalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchQuery, filteredOptions, value]);

  // Handle search with optional external search handler
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSelect = (option: SelectOption) => {
    onSelect(option);
    setIsOpen(false);
    Keyboard.dismiss();
  };

  const handleClose = () => {
    setIsOpen(false);
    Keyboard.dismiss();
  };

  const renderOption = ({ item }: { item: SelectOption }) => {
    const isSelected = item.code === value;

    return (
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[4],
            minHeight: 44,
          },
        ]}
        onPress={() => handleSelect(item)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Select ${item.label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          style={[
            styles.optionText,
            {
              color: isSelected ? theme.colors.primary : theme.colors.text,
              fontSize: theme.fontSizes.base,
              fontWeight: isSelected
                ? theme.fontWeights.medium
                : theme.fontWeights.normal,
            },
          ]}
          numberOfLines={2}
        >
          {item.label}
        </Text>
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={20}
            color={theme.colors.primary}
            style={{ marginLeft: theme.spacing[2] }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={[styles.emptyContainer, { padding: theme.spacing[8], backgroundColor: theme.colors.surface }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.emptyText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.base,
                marginTop: theme.spacing[4],
              },
            ]}
          >
            Loading options...
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.emptyContainer, { padding: theme.spacing[8], backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            styles.emptyText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.base,
              marginTop: theme.spacing[4],
            },
          ]}
        >
          {searchQuery
            ? `No options match "${searchQuery}"`
            : emptyMessage}
        </Text>
      </View>
    );
  };

  const renderOverlay = () => (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <View style={styles.modalOverlay}>
        {/* Backdrop - Dismiss on press */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Bottom Sheet Panel */}
        <View
          style={[
            styles.modalPanel,
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '75%',
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: theme.colors.surface,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
                paddingVertical: theme.spacing[4],
                paddingHorizontal: theme.spacing[4],
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: theme.fontWeights.semibold,
                },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close selector"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.colors.surface,
                paddingHorizontal: theme.spacing[4],
                paddingVertical: theme.spacing[3],
              },
            ]}
          >
            <View
              style={[
                styles.searchInputWrapper,
                {
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: theme.spacing[3],
                  paddingVertical: theme.spacing[2],
                },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={theme.colors.textSecondary}
                style={{ marginRight: theme.spacing[2] }}
                importantForAccessibility="no"
                accessible={false}
              />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                  styles.searchInput,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSizes.base,
                  },
                ]}
                autoFocus={Platform.OS === 'web'}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleSearch('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Options List - Single scrollable FlatList */}
          <FlatList
            data={filteredOptions}
            renderItem={renderOption}
            keyExtractor={item => item.code}
            style={[styles.optionsList, { backgroundColor: theme.colors.surface }]}
            contentContainerStyle={
              filteredOptions.length === 0 ? styles.emptyList : undefined
            }
            ListEmptyComponent={renderEmptyState}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={Platform.OS === 'android'}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text,
            fontSize: theme.fontSizes.sm,
            fontWeight: theme.fontWeights.medium,
            marginBottom: theme.spacing[2],
          },
        ]}
      >
        {label}
        {required && (
          <Text style={{ color: theme.colors.error }}> *</Text>
        )}
      </Text>

      {/* Select Button */}
      <TouchableOpacity
        style={[
          styles.selectButton,
          {
            backgroundColor: disabled
              ? theme.colors.backgroundSecondary
              : theme.colors.surface,
            borderWidth: 1,
            borderColor: error
              ? theme.colors.error
              : theme.colors.border,
            borderRadius: theme.borderRadius.md,
            paddingVertical: theme.spacing[3],
            paddingHorizontal: theme.spacing[4],
          },
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${
          selectedOption ? `Selected: ${selectedOption.label}` : placeholder
        }`}
        accessibilityHint="Opens selection menu"
        accessibilityState={{ disabled }}
      >
        <Text
          style={[
            styles.selectButtonText,
            {
              color: selectedOption
                ? theme.colors.text
                : theme.colors.textSecondary,
              fontSize: theme.fontSizes.base,
            },
          ]}
          numberOfLines={1}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {disabled ? (
          <Ionicons
            name="lock-closed"
            size={16}
            color={theme.colors.textSecondary}
          />
        ) : (
          <Ionicons
            name="chevron-down"
            size={18}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <Text
          style={[
            styles.errorText,
            {
              color: theme.colors.error,
              fontSize: theme.fontSizes.sm,
              marginTop: theme.spacing[1],
            },
          ]}
          accessible={true}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    // Dynamic styles applied inline
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  selectButtonText: {
    flex: 1,
  },
  errorText: {
    // Dynamic styles applied inline
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalPanel: {
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
    padding: 4,
  },
  searchContainer: {
    // Dynamic styles applied inline
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    height: 36,
  },
  optionsList: {
    flexGrow: 0,
  },
  emptyList: {
    flexGrow: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    textAlign: 'center',
  },
});
