/**
 * Porter Home Screen
 * Current assignment focus with loading/unloading checklist
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/hooks';
import { TripStatus } from '../../src/types/driver-porter.types';
import StatusChip from '../../src/components/common/StatusChip';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import StatCard from '../../src/components/common/StatCard';
import AlertCard from '../../src/components/common/AlertCard';

// Demo current assignment data
const DEMO_CURRENT_ASSIGNMENT = {
  id: '1',
  tripNumber: 'VT-2024-001',
  status: TripStatus.LOADING, // loading, in-transit, unloading, completed
  truckNumber: 'ABC-1234',
  driverName: 'Juan Dela Cruz',
  callTime: '06:00 AM',
  pickup: 'Metro Manila Warehouse',
  pickupAddress: '123 Quezon Ave, Quezon City',
  delivery: 'SM Megamall',
  deliveryAddress: '456 EDSA, Mandaluyong City',
  loadingProgress: 65, // percentage
  itemsCount: 120,
  itemsLoaded: 78,
};

const DEMO_CHECKLIST = [
  { id: '1', label: 'Inspect truck condition', completed: true },
  { id: '2', label: 'Verify cargo manifest', completed: true },
  { id: '3', label: 'Load items carefully', completed: false },
  { id: '4', label: 'Secure cargo properly', completed: false },
  { id: '5', label: 'Final inspection', completed: false },
];

const DEMO_UPCOMING_ASSIGNMENTS = [
  {
    id: '2',
    tripNumber: 'VT-2024-002',
    date: 'Tomorrow',
    callTime: '05:00 AM',
    destination: 'Robinson\'s Galleria',
  },
];

export default function PorterHome() {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius  } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveAssignment, setHasActiveAssignment] = useState(true); // Toggle for demo
  const [checklist, setChecklist] = useState(DEMO_CHECKLIST);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const getPrimaryAction = () => {
    const status = DEMO_CURRENT_ASSIGNMENT.status;
    
    switch (status) {
      case TripStatus.LOADING:
        return {
          label: 'Complete Loading',
          icon: 'check-circle' as const,
          color: colors.success,
          onPress: () => {},
        };
      case TripStatus.IN_TRANSIT:
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: colors.primary,
          onPress: () => {},
        };
      case TripStatus.UNLOADING:
        return {
          label: 'Complete Unloading',
          icon: 'check-circle' as const,
          color: colors.success,
          onPress: () => {},
        };
      default:
        return {
          label: 'Acknowledge Assignment',
          icon: 'check-circle-outline' as const,
          color: colors.primary,
          onPress: () => {},
        };
    }
  };

  const renderCurrentAssignment = () => {
    if (!hasActiveAssignment) {
      return (
        <EmptyStateCard
          iconName="dolly"
          title="No Active Assignment"
          description="You don't have any assignments in progress. Check your upcoming trips or contact the operator."
          actionLabel="View My Trips"
          onActionPress={() => router.push('/(porter)/trips')}
        />
      );
    }

    const primaryAction = getPrimaryAction();
    const completedItems = checklist.filter(item => item.completed).length;
    const totalItems = checklist.length;
    const checklistProgress = Math.round((completedItems / totalItems) * 100);

    return (
      <View>
        {/* Current Assignment Card */}
        <View
          style={[
            styles.assignmentCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.md,
              padding: spacing[4],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.assignmentHeader}>
            <View style={styles.assignmentHeaderLeft}>
              <MaterialCommunityIcons name="dolly" size={24} color={colors.primary} />
              <Text
                style={[
                  styles.tripNumber,
                  {
                    color: colors.primary,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                {DEMO_CURRENT_ASSIGNMENT.tripNumber}
              </Text>
            </View>
            <StatusChip
              status="in-progress"
              label={DEMO_CURRENT_ASSIGNMENT.status === 'loading' ? 'Loading' : 'In Transit'}
              size="md"
            />
          </View>

          {/* Assignment Details */}
          <View style={[styles.detailsSection, { marginTop: spacing[4] }]}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Call Time:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.medium,
                    marginLeft: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_ASSIGNMENT.callTime}
              </Text>
            </View>

            <View style={[styles.detailRow, { marginTop: spacing[2] }]}>
              <MaterialCommunityIcons name="truck" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Truck:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.medium,
                    marginLeft: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_ASSIGNMENT.truckNumber}
              </Text>
            </View>

            <View style={[styles.detailRow, { marginTop: spacing[2] }]}>
              <MaterialCommunityIcons name="steering" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Driver:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.medium,
                    marginLeft: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_ASSIGNMENT.driverName}
              </Text>
            </View>
          </View>

          {/* Loading Progress */}
          {DEMO_CURRENT_ASSIGNMENT.status === 'loading' && (
            <View style={[styles.progressSection, { marginTop: spacing[4] }]}>
              <View style={styles.progressHeader}>
                <Text
                  style={[
                    styles.progressTitle,
                    {
                      color: colors.text,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                    },
                  ]}
                >
                  Loading Progress
                </Text>
                <Text
                  style={[
                    styles.progressValue,
                    {
                      color: colors.primary,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.bold,
                    },
                  ]}
                >
                  {DEMO_CURRENT_ASSIGNMENT.itemsLoaded}/{DEMO_CURRENT_ASSIGNMENT.itemsCount}
                </Text>
              </View>
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: colors.borderLight,
                    borderRadius: borderRadius.base,
                    marginTop: spacing[2],
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.base,
                      width: `${DEMO_CURRENT_ASSIGNMENT.loadingProgress}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressPercentage,
                  {
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    marginTop: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_ASSIGNMENT.loadingProgress}% Complete
              </Text>
            </View>
          )}

          {/* Route */}
          <View style={[styles.routeSection, { marginTop: spacing[4] }]}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <View style={styles.routeContent}>
                <Text
                  style={[
                    styles.routeLabel,
                    {
                      color: colors.textSecondary,
                      fontSize: fontSizes.xs,
                    },
                  ]}
                >
                  Pickup
                </Text>
                <Text
                  style={[
                    styles.routeLocation,
                    {
                      color: colors.text,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                    },
                  ]}
                >
                  {DEMO_CURRENT_ASSIGNMENT.pickup}
                </Text>
              </View>
            </View>

            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <View style={styles.routeContent}>
                <Text
                  style={[
                    styles.routeLabel,
                    {
                      color: colors.textSecondary,
                      fontSize: fontSizes.xs,
                    },
                  ]}
                >
                  Delivery
                </Text>
                <Text
                  style={[
                    styles.routeLocation,
                    {
                      color: colors.text,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                    },
                  ]}
                >
                  {DEMO_CURRENT_ASSIGNMENT.delivery}
                </Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: primaryAction.color,
                borderRadius: borderRadius.md,
                marginTop: spacing[4],
                padding: spacing[4],
              },
            ]}
            onPress={primaryAction.onPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={primaryAction.icon} size={24} color={colors.textInverse} />
            <Text
              style={[
                styles.primaryButtonText,
                {
                  color: colors.textInverse,
                  fontSize: fontSizes.lg,
                  fontWeight: fontWeights.semibold,
                  marginLeft: spacing[2],
                },
              ]}
            >
              {primaryAction.label}
            </Text>
          </TouchableOpacity>

          {/* Secondary Action */}
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                backgroundColor: colors.surfaceElevated,
                borderRadius: borderRadius.base,
                marginTop: spacing[2],
                padding: spacing[3],
              },
            ]}
            onPress={() => router.push('/(porter)/reports')}
          >
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: colors.text,
                  fontSize: fontSizes.base,
                  fontWeight: fontWeights.medium,
                  marginLeft: spacing[2],
                },
              ]}
            >
              Report Product Issue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Checklist */}
        <View
          style={[
            styles.checklistCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.md,
              padding: spacing[4],
              marginTop: spacing[3],
            },
          ]}
        >
          <View style={styles.checklistHeader}>
            <Text
              style={[
                styles.checklistTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.base,
                  fontWeight: fontWeights.semibold,
                },
              ]}
            >
              {DEMO_CURRENT_ASSIGNMENT.status === 'loading' ? 'Loading' : 'Unloading'} Checklist
            </Text>
            <View style={[styles.checklistBadge, { backgroundColor: colors.primary + '20', paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: borderRadius.base }]}>
              <Text
                style={[
                  styles.checklistBadgeText,
                  {
                    color: colors.primary,
                    fontSize: fontSizes.xs,
                    fontWeight: fontWeights.medium,
                  },
                ]}
              >
                {completedItems}/{totalItems}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing[3] }}>
            {checklist.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.checklistItem,
                  {
                    paddingVertical: spacing[3],
                    borderBottomWidth: index < checklist.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => toggleChecklistItem(item.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      width: 24,
                      height: 24,
                      borderRadius: borderRadius.base,
                      borderWidth: 2,
                      borderColor: item.completed ? colors.success : colors.border,
                      backgroundColor: item.completed ? colors.success : 'transparent',
                    },
                  ]}
                >
                  {item.completed && (
                    <MaterialCommunityIcons name="check" size={16} color={colors.textInverse} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checklistItemLabel,
                    {
                      color: item.completed ? colors.textSecondary : colors.text,
                      fontSize: fontSizes.base,
                      marginLeft: spacing[3],
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0EA5E9']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>
                {user?.user_metadata?.first_name || 'Pedro Santos'}
              </Text>
            </View>
            <View style={styles.porterStatusBadge}>
              <View style={styles.porterDot} />
              <Text style={styles.porterStatusText}>Active Helper</Text>
            </View>
          </View>
        </View>

        {/* Current Assignment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>CURRENT ASSIGNMENT</Text>
          </View>
          {renderCurrentAssignment()}
        </View>

        {/* Today's Overview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Assigned Trips"
              value="2"
              icon="dolly"
              variant="teal"
            />
            <StatCard
              label="Items Handled"
              value="120"
              icon="package-variant"
              variant="success"
              trend="up"
              trendValue="100%"
            />
          </View>
        </View>

        {/* Upcoming Assignments Section */}
        <View style={[styles.section, { paddingBottom: 28 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>UPCOMING TRIPS</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(porter)/trips')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 8, marginTop: 4 }}>
            {DEMO_UPCOMING_ASSIGNMENTS.map((assignment) => (
              <View key={assignment.id} style={styles.upcomingCard}>
                <View style={styles.upcomingHeader}>
                  <View style={styles.upcomingLeft}>
                    <MaterialCommunityIcons name="calendar" size={16} color="#64748B" />
                    <Text style={styles.upcomingDate}>
                      {assignment.date} • {assignment.callTime}
                    </Text>
                  </View>
                  <StatusChip status="scheduled" label="Scheduled" size="sm" />
                </View>
                <Text style={styles.upcomingTripNumber}>
                  {assignment.tripNumber}
                </Text>
                <View style={styles.upcomingDestination}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#64748B" />
                  <Text style={styles.upcomingDestinationText}>
                    {assignment.destination}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  name: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  porterStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 6,
  },
  porterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0EA5E9',
  },
  porterStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  viewAllText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '700',
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tripNumber: {
    color: '#0F1E36',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 4,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  detailValue: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  progressSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressTitle: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  progressValue: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0EA5E9',
    borderRadius: 4,
  },
  progressPercentage: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  routeSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  routeLocation: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  checklistTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  checklistBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  checklistBadgeText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '700',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  checklistItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checklistItemLabel: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  checklistItemLabelCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  upcomingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upcomingDate: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  upcomingTripNumber: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  upcomingDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  upcomingDestinationText: {
    color: '#64748B',
    fontSize: 12,
  },
});

