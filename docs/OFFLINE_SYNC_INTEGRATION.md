# Offline Sync Integration Guide

This guide explains how to integrate offline synchronization into existing screens and workflows.

## Overview

The offline sync system provides:
- Automatic queuing of data changes when offline
- Photo/receipt upload queue with retry logic
- Duplicate detection using SHA256 fingerprints
- Conflict resolution strategies
- Priority-based sync queue
- Network state awareness
- Auto-sync on app foreground and network reconnection

## Quick Start

### 1. Initialize Sync Service

In your app initialization (e.g., `App.tsx`):

```typescript
import { offlineSyncService } from './services/sync';

// Initialize when user logs in
await offlineSyncService.initialize(currentUser.id);

// Cleanup on logout
offlineSyncService.cleanup();
```

### 2. Queue Data for Sync

Use the custom hooks in your screens:

```typescript
import { useTripSync } from '../hooks/useOfflineSync';

const MyTripScreen = () => {
  const { createTrip, updateTrip } = useTripSync(currentUser.id);
  
  const handleSaveTrip = async (tripData: any) => {
    try {
      // Save to local storage first
      await saveTripLocally(tripData);
      
      // Queue for sync
      await createTrip(tripData);
      
      Alert.alert('Success', 'Trip saved and queued for sync');
    } catch (error) {
      Alert.alert('Error', 'Failed to save trip');
    }
  };
};
```

### 3. Display Sync Status

Add the sync status indicator to your screen header:

```typescript
import { SyncStatusIndicator } from '../components/sync';

<View style={styles.header}>
  <Text>Dashboard</Text>
  <SyncStatusIndicator onPress={() => navigation.navigate('SyncQueue')} />
</View>
```

## Hooks Reference

### useOfflineSync()

Main hook for sync operations:

```typescript
const {
  syncStatus,        // Current sync status
  isLoading,         // Loading state
  queueForSync,      // Queue data for sync
  queuePhotoUpload,  // Queue photo for upload
  syncNow,           // Trigger manual sync
  getPendingItems,   // Get pending items
  getFailedItems,    // Get failed items
  retryFailedItem,   // Retry a failed item
  refresh,           // Refresh sync status
} = useOfflineSync();
```

### useTripSync(userId)

Specialized hook for trip data:

```typescript
const { createTrip, updateTrip } = useTripSync(userId);

// Create trip
await createTrip({
  id: 'trip_123',
  destination: 'Nairobi',
  // ... trip data
});

// Update trip
await updateTrip('trip_123', {
  status: 'in_progress',
  // ... updated data
});
```

### useFuelSync(userId)

For fuel records:

```typescript
const { createFuelRecord } = useFuelSync(userId);

await createFuelRecord({
  id: 'fuel_123',
  litres: 50,
  cost: 6500,
  // ... fuel data
});
```

### useDeliverySync(userId)

For proof of delivery:

```typescript
const { 
  createProofOfDelivery, 
  uploadDeliveryPhoto, 
  uploadSignature 
} = useDeliverySync(userId);

// Create POD
await createProofOfDelivery({
  id: 'pod_123',
  trip_id: 'trip_123',
  // ... POD data
});

// Upload photos
await uploadDeliveryPhoto('file:///path/to/photo.jpg', 'pod_123');
await uploadSignature('file:///path/to/signature.jpg', 'pod_123');
```

### useLocationSync(userId)

For location updates:

```typescript
const { updateLocation } = useLocationSync(userId);

await updateLocation({
  id: 'loc_123',
  latitude: -1.286389,
  longitude: 36.817223,
  timestamp: new Date().toISOString(),
});
```

### useExpenseSync(userId)

For expenses with receipts:

```typescript
const { createExpense, uploadReceipt } = useExpenseSync(userId);

await createExpense({
  id: 'expense_123',
  type: 'parking',
  amount: 500,
  // ... expense data
});

await uploadReceipt('file:///path/to/receipt.jpg', 'expense_123');
```

## Priority Levels

Items are synced in priority order (higher first):

- **Priority 10**: Critical data (not used by default)
- **Priority 9**: Proof of delivery
- **Priority 8**: Trip creation
- **Priority 7**: Trip updates
- **Priority 6**: Fuel records, Expenses
- **Priority 5**: Default priority
- **Priority 4**: Location updates
- **Priority 1-3**: Low priority background data

## Conflict Resolution

The system uses different strategies based on entity type:

| Entity Type | Strategy | Description |
|-------------|----------|-------------|
| `trip` | Server wins | Trip assignments are controlled by operator |
| `location_update` | Local wins | Device location is authoritative |
| `fuel_record` | Merge | Merge notes and validation issues |
| `payroll` | Manual | Requires operator review |

## Configuration

Update sync configuration via AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  enabled: true,
  auto_sync_interval_minutes: 15,
  sync_on_app_foreground: true,
  sync_on_network_change: true,
  max_sync_attempts: 3,
  batch_size: 20,
  wifi_only: false, // Set true to sync only on WiFi
  retry_delay_seconds: 30,
  exponential_backoff: true,
};

await AsyncStorage.setItem('@vone_sync_config', JSON.stringify(config));
```

## Storage Keys

The sync service uses these AsyncStorage keys:

- `@vone_sync_queue` - Main sync queue
- `@vone_photo_queue` - Photo upload queue
- `@vone_sync_status` - Current sync status
- `@vone_sync_config` - Sync configuration
- `@vone_duplicate_detection` - Duplicate detection records

## Duplicate Detection

The system automatically prevents duplicate submissions:

- Uses SHA256 hash of critical fields
- Checks for exact matches in last 24 hours
- Throws error if duplicate detected

```typescript
try {
  await createTrip(tripData);
} catch (error) {
  if (error.message === 'Duplicate item detected') {
    Alert.alert('Already Saved', 'This trip has already been queued for sync');
  }
}
```

## Manual Sync

Trigger manual sync from anywhere:

```typescript
import { offlineSyncService } from '../services/sync';

const result = await offlineSyncService.syncNow();

console.log(`Synced: ${result.synced_count}`);
console.log(`Failed: ${result.failed_count}`);
console.log(`Conflicts: ${result.conflict_count}`);
```

## Sync Queue Screen

Add the sync queue screen to your navigation:

```typescript
import { SyncQueueScreen } from '../screens/sync';

// In your navigator
<Stack.Screen 
  name="SyncQueue" 
  component={SyncQueueScreen}
  options={{ title: 'Sync Queue' }}
/>
```

This screen allows operators to:
- View pending and failed items
- Manually trigger sync
- Retry failed items
- Clear synced items
- Monitor sync status

## Best Practices

1. **Save Locally First**: Always save data to AsyncStorage before queuing for sync
2. **Use Priorities**: Set appropriate priority based on data criticality
3. **Handle Duplicates**: Catch duplicate errors gracefully
4. **Show Sync Status**: Display sync indicator in relevant screens
5. **Test Offline**: Test all workflows in airplane mode
6. **Monitor Queue**: Alert operators when failed items pile up

## Production Integration

For production, replace the mock sync methods in `OfflineSyncService.ts`:

### syncItem()

```typescript
private async syncItem(item: SyncQueueItem): Promise<boolean> {
  const endpoint = this.getEndpoint(item.entity_type, item.operation);
  
  const response = await fetch(endpoint, {
    method: this.getMethod(item.operation),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getAuthToken()}`,
    },
    body: JSON.stringify(item.data),
  });
  
  return response.ok;
}
```

### uploadPhoto()

```typescript
private async uploadPhoto(localUri: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('photo', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as any);
  
  const response = await fetch('https://api.example.com/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getAuthToken()}`,
    },
    body: formData,
  });
  
  if (response.ok) {
    const result = await response.json();
    return result.url;
  }
  
  return null;
}
```

## Troubleshooting

### Items Not Syncing

1. Check network connectivity
2. Verify sync is enabled in configuration
3. Check for failed items in sync queue
4. Review error messages in queue items

### High Battery Usage

1. Increase `auto_sync_interval_minutes`
2. Enable `wifi_only` mode
3. Disable `sync_on_app_foreground` if too aggressive

### Duplicate Detection Issues

1. Check duplicate detection records in AsyncStorage
2. Verify fingerprint generation includes all critical fields
3. Clear old detection records if needed

## Example: Complete Trip Workflow

```typescript
const CompleteTripScreen = () => {
  const { updateTrip } = useTripSync(currentUser.id);
  const { createProofOfDelivery, uploadDeliveryPhoto, uploadSignature } = useDeliverySync(currentUser.id);
  const { syncStatus } = useOfflineSync();
  
  const handleCompleteTrip = async () => {
    try {
      // 1. Update trip status locally
      const updatedTrip = { ...trip, status: 'completed' };
      await saveTripLocally(updatedTrip);
      
      // 2. Queue trip update
      await updateTrip(trip.id, updatedTrip);
      
      // 3. Create proof of delivery
      const pod = {
        id: generateId(),
        trip_id: trip.id,
        recipient_name: recipientName,
        delivery_time: new Date().toISOString(),
      };
      await savePODLocally(pod);
      await createProofOfDelivery(pod);
      
      // 4. Upload photos
      if (deliveryPhoto) {
        await uploadDeliveryPhoto(deliveryPhoto.uri, pod.id);
      }
      if (signature) {
        await uploadSignature(signature.uri, pod.id);
      }
      
      // 5. Show status
      if (syncStatus.is_online) {
        Alert.alert('Success', 'Trip completed and syncing...');
      } else {
        Alert.alert(
          'Saved Offline', 
          `Trip completed. ${syncStatus.pending_items_count} items will sync when online.`
        );
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete trip');
    }
  };
  
  return (
    <View>
      {/* UI components */}
      <SyncStatusIndicator />
      <Button title="Complete Trip" onPress={handleCompleteTrip} />
    </View>
  );
};
```

## Testing

Test the offline sync system:

1. **Normal Operation**: Complete workflows while online
2. **Offline Mode**: Enable airplane mode, complete workflows, verify queuing
3. **Reconnection**: Disable airplane mode, verify auto-sync
4. **Failed Sync**: Simulate server errors, verify retry logic
5. **Duplicate Prevention**: Submit same data twice, verify duplicate detection
6. **App Foreground**: Background app, foreground app, verify auto-sync
7. **Network Switch**: Switch between WiFi and cellular, verify sync behavior

## Support

For issues or questions about offline sync:
- Check error messages in sync queue
- Review console logs with `[Sync]` prefix
- Inspect AsyncStorage for sync data
- Test in production-like network conditions
