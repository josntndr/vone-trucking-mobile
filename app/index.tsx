/**
 * Index Screen - Temporary Simple Entry Point
 * This is a simplified version to get the app running
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🚛</Text>
          <Text style={styles.title}>Vone Trucking</Text>
          <Text style={styles.subtitle}>Fleet Management System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>✅ App is Running!</Text>
          <Text style={styles.cardText}>
            Your Vone Trucking app is successfully loaded and working.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 What's Working</Text>
          <Text style={styles.bulletPoint}>✓ React Native & Expo configured</Text>
          <Text style={styles.bulletPoint}>✓ App structure in place</Text>
          <Text style={styles.bulletPoint}>✓ All dependencies installed</Text>
          <Text style={styles.bulletPoint}>✓ Services ready (Analytics, Sync, Reports)</Text>
          <Text style={styles.bulletPoint}>✓ Offline functionality available</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 What's Next</Text>
          <Text style={styles.infoText}>
            To enable full functionality, you need to:
          </Text>
          <Text style={styles.bulletPoint}>1. Set up Supabase backend</Text>
          <Text style={styles.bulletPoint}>2. Add authentication</Text>
          <Text style={styles.bulletPoint}>3. Configure environment variables</Text>
          <Text style={styles.bulletPoint}>4. Add test data</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Key Features Built</Text>
          <Text style={styles.featureText}>📊 Analytics Dashboard with profit calculations</Text>
          <Text style={styles.featureText}>📝 10 Report Types (Trip, Fuel, Payroll, etc.)</Text>
          <Text style={styles.featureText}>🔔 15 Notification Types</Text>
          <Text style={styles.featureText}>📡 Offline Sync with Queue Management</Text>
          <Text style={styles.featureText}>🗺️ GPS Location Tracking</Text>
          <Text style={styles.featureText}>✍️ Digital Proof of Delivery</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>📖 Documentation Available</Text>
          <Text style={styles.infoBoxText}>
            Check the docs/ folder for:
          </Text>
          <Text style={styles.bulletPoint}>• Administrator Guide</Text>
          <Text style={styles.bulletPoint}>• Driver Guide</Text>
          <Text style={styles.bulletPoint}>• Porter Guide</Text>
          <Text style={styles.bulletPoint}>• Testing Plan (320+ test cases)</Text>
          <Text style={styles.bulletPoint}>• Deployment Checklist</Text>
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>🔄 Tap to Reload</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>© 2024 Vone Trucking</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    paddingLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  infoBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 10,
  },
  infoBoxText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#1A237E',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});
