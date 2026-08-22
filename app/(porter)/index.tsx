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
import StatusChip from '../../src/components/common/StatusChip';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import StatCard from '../../src/components/common/StatCard';
import AlertCard from '../../src/components/common/AlertCard';

// Demo current assignment data
const DEMO_CURRENT_ASSIGNMENT = {
  id: '1',
  tripNumber: 'VT-2024-001',
  status: 'loading' as const, // loading, in-transit, unloading, completed
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
  const { colors, typography, spacing, borderRadius } = useTheme();
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
      case 'loading':
        return {
          label: 'Complete Loading',
          icon: 'check-circle' as const,
          color: colors.success,
          onPress: () => {},
        };
      case 'in-transit':
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: colors.primary,
          onPress: () => {},
        };
      case 'unloading':
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
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
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
                    fontSize: typography.fontSize.sm,
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
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
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
                    fontSize: typography.fontSize.sm,
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
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
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
                    fontSize: typography.fontSize.sm,
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
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
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
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
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
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
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
                    fontSize: typography.fontSize.sm,
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
                      fontSize: typography.fontSize.xs,
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
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
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
                      fontSize: typography.fontSize.xs,
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
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
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
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
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
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
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
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
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
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
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
                      fontSize: typography.fontSize.base,
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { padding: spacing[4] }]}>
          <View>
            <Text
              style={[
                styles.greeting,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              Welcome back
            </Text>
            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                },
              ]}
            >
              {user?.user_metadata?.first_name || 'Porter'}
            </Text>
          </View>
        </View>

        {/* Current Assignment Section */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[3],
              },
            ]}
          >
            Current Assignment
          </Text>
          {renderCurrentAssignment()}
        </View>

        {/* Quick Stats */}
        {hasActiveAssignment && (
          <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[3],
                },
              ]}
            >
              This Week
            </Text>
            <View style={[styles.statsRow, { gap: spacing[3] }]}>
              <StatCard label="Completed" value={10} icon="check-circle" variant="success" />
              <StatCard label="Total Trips" value={15} icon="dolly" variant="primary" />
            </View>
          </View>
        )}

        {/* Upcoming Assignments */}
        <View style={[styles.section, { paddingHorizontal: spacing[4], paddingBottom: spacing[8] }]}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                },
              ]}
            >
              Upcoming Trips
            </Text>
            <TouchableOpacity onPress={() => router.push('/(porter)/trips')}>
              <Text style={[styles.viewAllText, { color: colors.primary, fontSize: typography.fontSize.sm }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: spacing[3] }}>
            {DEMO_UPCOMING_ASSIGNMENTS.map((assignment, index) => (
              <View
                key={assignment.id}
                style={[
                  styles.upcomingCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.base,
                    padding: spacing[3],
                    marginBottom: index < DEMO_UPCOMING_ASSIGNMENTS.length - 1 ? spacing[2] : 0,
                  },
                ]}
              >
                <View style={styles.upcomingHeader}>
                  <View style={styles.upcomingLeft}>
                    <MaterialCommunityIcons name="calendar" size={18} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.upcomingDate,
                        {
                          color: colors.text,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          marginLeft: spacing[2],
                        },
                      ]}
                    >
                      {assignment.date} • {assignment.callTime}
                    </Text>
                  </View>
                  <StatusChip status="scheduled" label="Scheduled" size="sm" />
                </View>
                <Text
                  style={[
                    styles.upcomingTripNumber,
                    {
                      color: colors.primary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      marginTop: spacing[2],
                    },
                  ]}
                >
                  {assignment.tripNumber}
                </Text>
                <View style={[styles.upcomingDestination, { marginTop: spacing[1] }]}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.upcomingDestinationText,
                      {
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm,
                        marginLeft: spacing[1],
                      },
                    ]}
                  >
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {},
  greeting: {},
  name: {},
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {},
  viewAllText: {},
  assignmentCard: {},
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripNumber: {},
  detailsSection: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {},
  detailValue: {},
  progressSection: {},
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {},
  progressValue: {},
  progressBar: {
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressPercentage: {},
  routeSection: {},
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeContent: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {},
  routeLocation: {},
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {},
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {},
  checklistCard: {},
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checklistTitle: {},
  checklistBadge: {},
  checklistBadgeText: {},
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistItemLabel: {},
  statsRow: {
    flexDirection: 'row',
  },
  upcomingCard: {},
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingDate: {},
  upcomingTripNumber: {},
  upcomingDestination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDestinationText: {},
});
