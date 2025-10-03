import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { SafetyAPI } from './api';

export class LocationService {
  static async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates
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

  static async shareLocationViaSMS(contacts?: string[]) {
    try {
      const location = await this.getCurrentLocation();
      
      // Get emergency contacts if not provided
      let emergencyContacts = contacts;
      if (!emergencyContacts) {
        const { data: contactsData } = await SafetyAPI.getEmergencyContacts();
        emergencyContacts = contactsData?.map(c => c.phone_number) || [];
      }

      if (emergencyContacts.length === 0) {
        throw new Error('No emergency contacts found. Please add contacts in Settings.');
      }

      // Create Google Maps link
      const mapsLink = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
      
      // Get user's emergency message
      const { data: profile } = await SafetyAPI.getUserProfile();
      const emergencyMessage = profile?.emergency_message || 'I feel unsafe. My location:';
      
      const message = `${emergencyMessage} ${mapsLink}\n\nAddress: ${location.address}\nTime: ${new Date().toLocaleString()}`;

      // Log the incident
      await SafetyAPI.logSafetyIncident({
        incident_type: 'location_share',
        location_lat: location.latitude,
        location_lng: location.longitude,
        location_address: location.address,
        timestamp: location.timestamp,
        notes: `Shared with ${emergencyContacts.length} contacts`,
      });

      // Send SMS
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(emergencyContacts, message);
        return { success: true, message: 'Location shared successfully' };
      } else {
        throw new Error('SMS not available on this device');
      }
    } catch (error) {
      throw new Error(`Failed to share location: ${error}`);
    }
  }

  static async getLocationString() {
    try {
      const location = await this.getCurrentLocation();
      return `${location.address} (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`;
    } catch (error) {
      return 'Location unavailable';
    }
  }
}
