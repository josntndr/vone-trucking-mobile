/**
 * TripCard Component
 * Reusable card for displaying trip information
 * Shows essential trip details with status indicator
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import StatusChip, { StatusType } from './StatusChip';
import { formatPhilippineDate, formatPhilippineTime } from '../../utils/philippines';

interface TripCardProps {
  tripNumber: string;
  destination: string;
  callTime?: Date | string;
  truckNumber?: string;
  driverName?: string;
  status: StatusType;
  statusLabel: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function TripCard({
  tripNumber,
  destination,
  callTime,
  truckNumber,
  driverName,
  status,
  statusLabel,
  onPress,
  style,
}: TripCardProps) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing[4],
          ...shadows.base,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons 
            name="truck-delivery" 
            size={20} 
            color={colors.primary} 
          />
          <Text
            style={[
              styles.tripNumber,
              {
                color: colors.primary,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
              },
            ]}
          >
            {tripNumber}
          </Text>
        </View>
        <StatusChip status={status} label={statusLabel} size="sm" />
      </View>

      {/* Destination */}
      <View style={[styles.row, { marginTop: spacing[3] }]}>
        <MaterialCommunityIcons 
          name="map-marker" 
          size={16} 
          color={colors.textSecondary} 
        />
        <Text
          style={[
            styles.destination,
            {
              color: colors.text,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
            },
          ]}
          numberOfLines={1}
        >
          {destination}
        </Text>
      </View>

      {/* Details Grid */}
      <View style={[styles.detailsGrid, { marginTop: spacing[3], gap: spacing[2] }]}>
        {callTime && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={14} 
              color={colors.textSecondary} 
            />
            <Text
              style={[
                styles.detailText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              {typeof callTime === 'string' 
                ? callTime 
                : `${formatPhilippineDate(callTime)} ${formatPhilippineTime(callTime)}`
              }
            </Text>
          </View>
        )}

        {truckNumber && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="truck" 
              size={14} 
              color={colors.textSecondary} 
            />
            <Text
              style={[
                styles.detailText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              {truckNumber}
            </Text>
          </View>
        )}

        {driverName && (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons 
              name="account" 
              size={14} 
              color={colors.textSecondary} 
            />
            <Text
              style={[
                styles.detailText,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              {driverName}
            </Text>
          </View>
        )}
      </View>

      {/* Chevron for touchable cards */}
      {onPress && (
        <View style={styles.chevron}>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={20} 
            color={colors.textTertiary} 
          />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tripNumber: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  destination: {
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  detailText: {},
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
  },
});
