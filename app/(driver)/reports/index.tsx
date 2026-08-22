/**
 * Driver Reports Home Screen
 * Quick access to all reporting functions
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function DriverReportsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const reports = [
    {
      title: 'Delay Report',
      description: 'Report traffic, loading delays, or other issues',
      icon: 'clock-alert',
      color: colors.warning,
      route: '/(driver)/reports/delay',
    },
    {
      title: 'Incident Report',
      description: 'Report accidents, theft, damage, or injuries',
      icon: 'alert-circle',
      color: colors.error,
      route: '/(driver)/reports/incident',
    },
    {
      title: 'Truck Problem',
      description: 'Report mechanical or technical issues',
      icon: 'wrench',
      color: colors.error,
      route: '/(driver)/reports/truck-problem',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Report an Issue</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select the type of issue you want to report
      </Text>

      {reports.map((report, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(report.route as any)}
          activeOpacity={0.7}
        >
          <Card style={styles.reportCard}>
            <View style={[styles.iconContainer, { backgroundColor: report.color + '20' }]}>
              <MaterialCommunityIcons
                name={report.icon as any}
                size={40}
                color={report.color}
              />
            </View>
            <View style={styles.reportInfo}>
              <Text style={[styles.reportTitle, { color: colors.text }]}>
                {report.title}
              </Text>
              <Text style={[styles.reportDescription, { color: colors.textSecondary }]}>
                {report.description}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </Card>
        </TouchableOpacity>
      ))}

      <Card style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          All reports are sent to the operator immediately. For emergencies, call the
          operator directly.
        </Text>
      </Card>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

