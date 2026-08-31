/**
 * TripCard Component
 * Modern card for displaying trip details with route visualizer, badges, and status
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import StatusChip, { StatusType } from './StatusChip';
import { formatPhilippineDate, formatPhilippineTime } from '../../utils/philippines';

interface TripCardProps {
  tripNumber: string;
  origin?: string;
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
  origin = 'Warehouse Depot',
  destination,
  callTime,
  truckNumber,
  driverName,
  status,
  statusLabel,
  onPress,
  style,
}: TripCardProps) {
  const { colors, shadows } = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: '#FFFFFF',
          ...shadows.sm,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.tripBadge}>
          <MaterialCommunityIcons 
            name="truck-outline" 
            size={16} 
            color="#0EA5E9" 
          />
          <Text style={styles.tripNumber}>
            {tripNumber}
          </Text>
        </View>

        <StatusChip status={status} label={statusLabel} size="sm" />
      </View>

      {/* Destination / Route */}
      <View style={styles.routeSection}>
        <View style={styles.routeIconCol}>
          <View style={styles.originDot} />
          <View style={styles.routeLine} />
          <View style={styles.destinationDot} />
        </View>

        <View style={styles.routeTextCol}>
          <Text style={styles.originText} numberOfLines={1}>
            {origin}
          </Text>
          <Text style={styles.destinationText} numberOfLines={1}>
            {destination}
          </Text>
        </View>
      </View>

      {/* Footer Details Pills */}
      <View style={styles.footer}>
        {callTime && (
          <View style={styles.infoPill}>
            <MaterialCommunityIcons 
              name="clock-outline" 
              size={13} 
              color="#64748B" 
            />
            <Text style={styles.infoText}>
              {typeof callTime === 'string' 
                ? callTime 
                : `${formatPhilippineDate(callTime)} ${formatPhilippineTime(callTime)}`
              }
            </Text>
          </View>
        )}

        {truckNumber && (
          <View style={styles.infoPill}>
            <MaterialCommunityIcons 
              name="car-outline" 
              size={13} 
              color="#64748B" 
            />
            <Text style={styles.infoText}>
              {truckNumber}
            </Text>
          </View>
        )}

        {driverName && (
          <View style={styles.infoPill}>
            <MaterialCommunityIcons 
              name="account-outline" 
              size={13} 
              color="#64748B" 
            />
            <Text style={styles.infoText}>
              {driverName}
            </Text>
          </View>
        )}

        {onPress && (
          <View style={styles.chevronWrap}>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={18} 
              color="#94A3B8" 
            />
          </View>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tripNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F1E36',
    letterSpacing: 0.2,
  },
  routeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  routeIconCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
  },
  originDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  destinationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  routeTextCol: {
    flex: 1,
    gap: 4,
  },
  originText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  destinationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
  },
  chevronWrap: {
    marginLeft: 'auto',
  },
});

