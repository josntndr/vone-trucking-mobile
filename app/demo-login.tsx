/**
 * Demo Login Screen
 * LOCAL DEVELOPMENT ONLY - Role selection for testing without Supabase
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { demoSignIn, getDemoUsers } from '../src/services/demo/demoAuth.service';

export default function DemoLoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const demoUsers = getDemoUsers();

  const handleRoleSelect = async (role: 'operator' | 'driver' | 'porter') => {
    try {
      setLoading(true);
      const result = await demoSignIn(role);

      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      // Navigate based on role
      if (role === 'operator') {
        router.replace('/(operator)');
      } else if (role === 'driver') {
        router.replace('/(driver)');
      } else {
        router.replace('/(porter)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'operator':
        return 'account-tie';
      case 'driver':
        return 'steering';
      case 'porter':
        return 'account-hard-hat';
      default:
        return 'account';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A237E" />
        <Text style={styles.loadingText}>Signing in...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="truck-fast" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Vone Trucking</Text>
          <Text style={styles.subtitle}>Fleet Management System</Text>
        </View>

        {/* Demo Mode Banner */}
        <View style={styles.demoBanner}>
          <MaterialCommunityIcons name="information" size={20} color="#0277BD" />
          <View style={styles.demoTextContainer}>
            <Text style={styles.demoTitle}>Local Demo Mode</Text>
            <Text style={styles.demoText}>
              Choose a role to explore the app with simulated data.
              No backend connection required.
            </Text>
          </View>
        </View>

        {/* Role Selection Cards */}
        <View style={styles.rolesContainer}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          
          {demoUsers.map((item) => (
            <TouchableOpacity
              key={item.role}
              style={styles.roleCard}
              onPress={() => handleRoleSelect(item.role)}
              activeOpacity={0.7}
            >
              <View style={styles.roleIconContainer}>
                <MaterialCommunityIcons
                  name={getRoleIcon(item.role) as any}
                  size={32}
                  color="#1A237E"
                />
              </View>
              
              <View style={styles.roleInfo}>
                <Text style={styles.roleTitle}>{item.title}</Text>
                <Text style={styles.roleDescription}>{item.description}</Text>
                
                <View style={styles.roleDetails}>
                  <Text style={styles.roleDetailText}>
                    {item.user.profile.first_name} {item.user.profile.last_name}
                  </Text>
                  <Text style={styles.roleDetailSubtext}>
                    {item.user.profile.employee_number}
                  </Text>
                </View>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#333" />
            <Text style={styles.infoTitle}>What's Available</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoItemText}>Full UI navigation and layouts</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoItemText}>Realistic demo data</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoItemText}>All role-based features</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.infoItemText}>Offline-capable design</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#FF9800" />
              <Text style={styles.infoItemText}>Data is simulated and resets on reload</Text>
            </View>
          </View>
        </View>

        {/* Production Note */}
        <View style={styles.productionNote}>
          <Text style={styles.productionText}>
            To enable production authentication, configure Supabase in your .env file
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Demo Mode • Version 1.0.0</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  demoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E1F5FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#0277BD',
  },
  demoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#01579B',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 13,
    color: '#0277BD',
    lineHeight: 18,
  },
  rolesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  roleCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8EAF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  roleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleDetailText: {
    fontSize: 12,
    color: '#999',
  },
  roleDetailSubtext: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoItemText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  productionNote: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#F57C00',
  },
  productionText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
});

