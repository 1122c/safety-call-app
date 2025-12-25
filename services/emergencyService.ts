import * as Linking from 'expo-linking';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { SafetyAPI } from './api';

export class EmergencyService {
  // Get emergency number based on country (defaults to 911 for US)
  // For testing: Change this to a test number (like a friend's number) to avoid calling 911
  private static getEmergencyNumber(): string {
    // In production, detect country and use appropriate number
    // For now, defaulting to 911 (US/Canada)
    
    // FOR TESTING: Uncomment and set to a test number to avoid calling 911
    // return '5551234567'; // Replace with your test number
    
    return '911'; // US/Canada emergency number
  }

  static async handleEmergency() {
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      
      // Get emergency contacts
      const { data: contactsData } = await SafetyAPI.getEmergencyContacts();
      const emergencyContacts = contactsData?.map(c => c.phone_number) || [];

      // Create emergency message
      const { data: profile } = await SafetyAPI.getUserProfile();
      const emergencyMessage = profile?.emergency_message || 'EMERGENCY: I need help immediately. My location:';
      
      const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      const message = `${emergencyMessage} ${mapsLink}\n\nAddress: ${location.address}\nTime: ${new Date().toLocaleString()}`;

      // Log the incident first (non-blocking)
      try {
        await SafetyAPI.logSafetyIncident({
          incident_type: 'emergency_call',
          location_lat: location.latitude,
          location_lng: location.longitude,
          location_address: location.address,
          timestamp: location.timestamp,
          notes: `Emergency activated. Contacted ${emergencyContacts.length} contacts`,
        });
      } catch (logError) {
        console.warn('Failed to log emergency incident:', logError);
      }

      // Send SMS to emergency contacts (if any)
      if (emergencyContacts.length > 0) {
        try {
          const isAvailable = await SMS.isAvailableAsync();
          if (isAvailable) {
            await SMS.sendSMSAsync(emergencyContacts, message);
          }
        } catch (smsError) {
          console.warn('Failed to send emergency SMS:', smsError);
          // Don't fail the whole operation if SMS fails
        }
      }

      // Call emergency services
      const emergencyNumber = this.getEmergencyNumber();
      const phoneUrl = `tel:${emergencyNumber}`;
      
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        throw new Error('Cannot make phone calls on this device');
      }

      return { success: true, message: 'Emergency services called' };
    } catch (error: any) {
      throw new Error(`Failed to handle emergency: ${error.message || error}`);
    }
  }

  private static async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? 
          `${address[0].street || ''} ${address[0].city || ''} ${address[0].region || ''}`.trim() :
          'Unknown location',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get location: ${error}`);
    }
  }

  // Test mode - simulates emergency without actually calling
  static async testEmergency() {
    try {
      const location = await this.getCurrentLocation();
      const { data: contactsData } = await SafetyAPI.getEmergencyContacts();
      const emergencyContacts = contactsData?.map(c => c.phone_number) || [];

      return {
        success: true,
        message: 'TEST MODE: Emergency would be activated',
        details: {
          wouldCall: this.getEmergencyNumber(),
          wouldContact: emergencyContacts.length,
          location: location.address,
        },
      };
    } catch (error: any) {
      throw new Error(`Test failed: ${error.message || error}`);
    }
  }
}

