/**
 * Porter / Helper Reports Home Screen
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/common/Card';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  primary: '#0EA5E9',
  orange: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
  white: '#FFFFFF',
};

export default function PorterReportsScreen() {
  const router = useRouter();

  const reports = [
    {
      title: 'Damaged Product',
      description: 'Report broken boxes, dented items, or water damage',
      icon: 'package-variant-closed-remove',
      color: COLORS.error,
      bg: 'rgba(239, 68, 68, 0.15)',
      route: '/(porter)/reports/damaged',
    },
    {
      title: 'Missing Cargo',
      description: 'Report missing items from manifest or count discrepancy',
      icon: 'file-question',
      color: COLORS.orange,
      bg: 'rgba(245, 158, 11, 0.15)',
      route: '/(porter)/reports/missing',
    },
    {
      title: 'Rejected Shipment',
      description: 'Report items refused by recipient or return-to-origin',
      icon: 'close-octagon',
      color: COLORS.info,
      bg: 'rgba(56, 189, 248, 0.15)',
      route: '/(porter)/reports/rejected',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Report Cargo Issue</Text>
      <Text style={styles.subtitle}>Select the incident category to submit a report</Text>

      <View style={styles.list}>
        {reports.map((report, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(report.route as any)}
            activeOpacity={0.75}
          >
            <Card style={styles.reportCard}>
              <View style={[styles.iconContainer, { backgroundColor: report.bg }]}>
                <MaterialCommunityIcons
                  name={report.icon as any}
                  size={28}
                  color={report.color}
                />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDescription}>{report.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.infoCard}>
        <Ionicons name="information-circle" size={22} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Cargo discrepancy reports are immediately synchronized with the dispatcher and trip log.
        </Text>
      </Card>
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
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  list: {
    gap: 12,
    marginBottom: 16,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  reportDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
