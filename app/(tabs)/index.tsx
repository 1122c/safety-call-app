import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { LocationService } from '../../services/locationService';
import { EmergencyService } from '../../services/emergencyService';

export default function HomeScreen() {
  const [sharingLocation, setSharingLocation] = useState(false);
  const [emergencyLoading, setEmergencyLoading] = useState(false);

  const handleShareLocation = async () => {
    setSharingLocation(true);
    try {
      const result = await LocationService.shareLocationViaSMS();
      Alert.alert(
        'Location Shared',
        result.message || 'Your location has been shared with your emergency contacts.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      let errorMessage = error.message || 'Failed to share location';
      
      // Provide helpful error messages
      if (errorMessage.includes('No emergency contacts')) {
        errorMessage = 'No emergency contacts found. Please add contacts in Settings first.';
        Alert.alert(
          'No Contacts',
          errorMessage,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Settings',
              onPress: () => router.push('/(tabs)/settings'),
            },
          ]
        );
        return;
      } else if (errorMessage.includes('permission')) {
        errorMessage = 'Location permission is required. Please enable it in your device settings.';
      } else if (errorMessage.includes('SMS not available')) {
        errorMessage = 'SMS is not available on this device.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSharingLocation(false);
    }
  };

  const handleEmergency = () => {
    // For testing: Set this to true to test without calling 911
    const TEST_MODE = __DEV__; // Automatically true in development mode
    
    if (TEST_MODE) {
      Alert.alert(
        'Emergency Services (TEST MODE)',
        'This is a test. In production, this would call 911 and send your location to emergency contacts. What would you like to do?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Test (No Call)',
            onPress: async () => {
              setEmergencyLoading(true);
              try {
                const result = await EmergencyService.testEmergency();
                Alert.alert(
                  'Test Emergency',
                  `TEST MODE: Emergency would be activated\n\nWould call: ${result.details.wouldCall}\nWould contact: ${result.details.wouldContact} contact(s)\nLocation: ${result.details.location}`,
                  [{ text: 'OK' }]
                );
              } catch (error: any) {
                Alert.alert('Test Error', error.message || 'Test failed');
              } finally {
                setEmergencyLoading(false);
              }
            },
          },
          {
            text: 'Call 911 (Real)',
            style: 'destructive',
            onPress: async () => {
              setEmergencyLoading(true);
              try {
                await EmergencyService.handleEmergency();
                Alert.alert(
                  'Emergency Activated',
                  'Emergency services have been called. Your location has been shared with your contacts.',
                  [{ text: 'OK' }]
                );
              } catch (error: any) {
                let errorMessage = error.message || 'Failed to activate emergency services';
                
                if (errorMessage.includes('permission')) {
                  errorMessage = 'Location permission is required. Please enable it in your device settings.';
                } else if (errorMessage.includes('phone')) {
                  errorMessage = 'Cannot make phone calls on this device.';
                }
                
                Alert.alert('Error', errorMessage);
              } finally {
                setEmergencyLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      // Production mode - direct confirmation
      Alert.alert(
        'Emergency Services',
        'This will call 911 and send your location to your emergency contacts. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Call 911',
            style: 'destructive',
            onPress: async () => {
              setEmergencyLoading(true);
              try {
                await EmergencyService.handleEmergency();
                Alert.alert(
                  'Emergency Activated',
                  'Emergency services have been called. Your location has been shared with your contacts.',
                  [{ text: 'OK' }]
                );
              } catch (error: any) {
                let errorMessage = error.message || 'Failed to activate emergency services';
                
                if (errorMessage.includes('permission')) {
                  errorMessage = 'Location permission is required. Please enable it in your device settings.';
                } else if (errorMessage.includes('phone')) {
                  errorMessage = 'Cannot make phone calls on this device.';
                }
                
                Alert.alert('Error', errorMessage);
              } finally {
                setEmergencyLoading(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Call</Text>
        <Text style={styles.subtitle}>Your discreet safety companion</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/fake-call')}
        >
          <Text style={styles.buttonText}>📞 Start Fake Call</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.secondaryButton, sharingLocation && styles.buttonDisabled]}
          onPress={handleShareLocation}
          disabled={sharingLocation}
        >
          {sharingLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#e91e63" size="small" />
              <Text style={[styles.secondaryButtonText, { marginLeft: 8 }]}>Sharing...</Text>
            </View>
          ) : (
            <Text style={styles.secondaryButtonText}>📍 Share Location</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.emergencyButton, emergencyLoading && styles.buttonDisabled]}
          onPress={handleEmergency}
          disabled={emergencyLoading}
        >
          {emergencyLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[styles.emergencyButtonText, { marginLeft: 8 }]}>Activating...</Text>
            </View>
          ) : (
            <Text style={styles.emergencyButtonText}>⚠️ Emergency</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#e91e63',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e91e63',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyButton: {
    backgroundColor: '#f44336',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d32f2f',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
