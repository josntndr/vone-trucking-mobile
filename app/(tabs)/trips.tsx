/**
 * Trips Screen
 * List of trips (placeholder for future implementation)
 */

import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, EmptyState } from '../../src/components';
import { useTheme } from '../../src/hooks';

export default function TripsScreen() {
  const theme = useTheme();

  return (
    <Screen padding={4}>
      <View style={styles.container}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text.primary,
              fontSize: theme.fontSizes['2xl'],
              fontWeight: theme.fontWeights.bold,
              marginBottom: theme.spacing[6],
            },
          ]}
        >
          Trips
        </Text>

        <EmptyState
          icon={<MaterialCommunityIcons name="truck-delivery-outline" size={64} color={theme.colors.text.tertiary} />}
          title="No Trips Yet"
          description="Your trips will appear here once the feature is implemented."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {},
});

