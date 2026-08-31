/**
 * Porter Earnings Screen
 * Financial services, payslips, cash advances, and history for porters/helpers
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/common/Card';
import { formatPhilippinePeso } from '../../../src/utils/philippines';

const COLORS = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  primary: '#0EA5E9',
  teal: '#0EA5E9',
  orange: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
  white: '#FFFFFF',
};

export default function PorterEarningsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const earningActions = [
    {
      title: 'Payslips',
      description: 'View salary breakdown, allowances, and incentives',
      icon: 'file-document-outline',
      iconColor: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      route: '/(porter)/profile/payslips',
    },
    {
      title: 'Cash Advance',
      description: 'Request emergency funds or track advance status',
      icon: 'cash-multiple',
      iconColor: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      route: '/(porter)/profile/cash-advance',
    },
    {
      title: 'Trip History',
      description: 'View past completed trips and helper records',
      icon: 'history',
      iconColor: '#38BDF8',
      bgColor: 'rgba(56, 189, 248, 0.15)',
      route: '/(porter)/profile/history',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Hero Earnings Card */}
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroSub}>ESTIMATED HELPER EARNINGS</Text>
          <View style={styles.monthPill}>
            <Text style={styles.monthPillText}>August 2026</Text>
          </View>
        </View>

        <Text style={styles.heroAmount}>
          {formatPhilippinePeso(18600)}
        </Text>

        <View style={styles.divider} />

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>22</Text>
            <Text style={styles.metricLabel}>Assigned Trips</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: COLORS.warning }]}>₱1,500</Text>
            <Text style={styles.metricLabel}>Cash Advance</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: COLORS.success }]}>₱850</Text>
            <Text style={styles.metricLabel}>Trip Incentives</Text>
          </View>
        </View>
      </Card>

      {/* Financial Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FINANCIAL SERVICES</Text>

        <View style={styles.actionsList}>
          {earningActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
            >
              <Card style={styles.actionCard}>
                <View style={[styles.actionIconContainer, { backgroundColor: action.bgColor }]}>
                  <MaterialCommunityIcons
                    name={action.icon as any}
                    size={26}
                    color={action.iconColor}
                  />
                </View>
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  monthPill: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  monthPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
