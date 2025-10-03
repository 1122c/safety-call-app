import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function FakeCallScreen() {
  const router = useRouter();
  const [callState, setCallState] = useState<'incoming' | 'active' | 'ended'>('incoming');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Start vibration pattern for incoming call
    if (callState === 'incoming') {
      const vibratePattern = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 1000);
      
      return () => clearInterval(vibratePattern);
    }
  }, [callState]);

  useEffect(() => {
    // Call duration timer
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const answerCall = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCallState('active');
  };

  const declineCall = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    router.back();
  };

  const endCall = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState === 'incoming') {
    return (
      <View style={styles.container}>
        <View style={styles.incomingContainer}>
          <Text style={styles.incomingText}>Incoming call</Text>
          
          <View style={styles.callerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>MJ</Text>
            </View>
            <Text style={styles.callerName}>Michael Johnson</Text>
            <Text style={styles.callerNumber}>Mobile +1 (555) 123-4567</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.declineButton]}
              onPress={declineCall}
            >
              <Text style={styles.actionIcon}>✕</Text>
              <Text style={styles.actionText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={answerCall}
            >
              <Text style={styles.actionIcon}>✓</Text>
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.activeContainer}>
        <View style={styles.activeHeader}>
          <Text style={styles.duration}>{formatDuration(callDuration)}</Text>
          <Text style={styles.activeCallerName}>Michael Johnson</Text>
          <Text style={styles.activeStatus}>Mobile • On speaker</Text>
        </View>

        <View style={styles.scriptContainer}>
          <Text style={styles.scriptLabel}>Conversation Script:</Text>
          <View style={styles.scriptBox}>
            <Text style={styles.scriptText}>
              "Hey, I'm almost there. I can see the building now. Just parking the car."
            </Text>
          </View>
          <Text style={styles.yourLine}>Your response:</Text>
          <Text style={styles.responseText}>
            "Great! I'm waiting right by the entrance."
          </Text>
        </View>

        <View style={styles.callActions}>
          <TouchableOpacity style={styles.callActionButton}>
            <Text style={styles.callActionIcon}>🔇</Text>
            <Text style={styles.callActionText}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.callActionButton, styles.endCallButton]}
            onPress={endCall}
          >
            <Text style={styles.callActionIcon}>📞</Text>
            <Text style={styles.callActionText}>End</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.callActionButton}>
            <Text style={styles.callActionIcon}>🔊</Text>
            <Text style={styles.callActionText}>Speaker</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  incomingContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 60,
  },
  incomingText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  callerInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  callerName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
  },
  callerNumber: {
    color: '#999',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 60,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#f44336',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
  },
  actionIcon: {
    fontSize: 32,
    color: '#fff',
    marginBottom: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  activeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  activeHeader: {
    alignItems: 'center',
  },
  duration: {
    color: '#4caf50',
    fontSize: 18,
    marginBottom: 8,
  },
  activeCallerName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    marginBottom: 4,
  },
  activeStatus: {
    color: '#999',
    fontSize: 14,
  },
  scriptContainer: {
    paddingHorizontal: 30,
  },
  scriptLabel: {
    color: '#e91e63',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  scriptBox: {
    backgroundColor: 'rgba(233, 30, 99, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#e91e63',
    marginBottom: 20,
  },
  scriptText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  yourLine: {
    color: '#999',
    fontSize: 12,
    marginBottom: 8,
  },
  responseText: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
  },
  callActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  callActionButton: {
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: '#f44336',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
  },
  callActionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  callActionText: {
    color: '#fff',
    fontSize: 12,
  },
});