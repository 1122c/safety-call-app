import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { SafetyAPI } from '../../services/api';
import { EmergencyContact } from '../../services/supabase';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data, error } = await SafetyAPI.getEmergencyContacts();
      if (error) {
        console.error('Error loading contacts:', error);
      } else {
        setContacts(data || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setName('');
    setPhoneNumber('');
    setRelationship('');
    setIsPrimary(false);
    setEditingContact(null);
    setShowAddModal(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setName(contact.name);
    setPhoneNumber(contact.phone_number);
    setRelationship(contact.relationship);
    setIsPrimary(contact.is_primary);
    setEditingContact(contact);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingContact(null);
    setName('');
    setPhoneNumber('');
    setRelationship('');
    setIsPrimary(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !phoneNumber.trim() || !relationship.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setSaving(true);
    try {
      if (editingContact) {
        // Update existing contact
        const { error } = await SafetyAPI.updateEmergencyContact(editingContact.id, {
          name: name.trim(),
          phone_number: phoneNumber.trim(),
          relationship: relationship.trim(),
          is_primary: isPrimary,
        });
        
        if (error) {
          Alert.alert('Error', error.message || 'Failed to update contact');
        } else {
          closeModal();
          loadContacts();
        }
      } else {
        // Add new contact
        const { error } = await SafetyAPI.addEmergencyContact({
          name: name.trim(),
          phone_number: phoneNumber.trim(),
          relationship: relationship.trim(),
          is_primary: isPrimary,
        });
        
        if (error) {
          Alert.alert('Error', error.message || 'Failed to add contact');
        } else {
          closeModal();
          loadContacts();
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (contact: EmergencyContact) => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await SafetyAPI.deleteEmergencyContact(contact.id);
            if (error) {
              Alert.alert('Error', error.message || 'Failed to delete contact');
            } else {
              loadContacts();
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        <Text style={styles.sectionDescription}>
          Add contacts who will receive your location when you share it
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#e91e63" />
          </View>
        ) : contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No emergency contacts yet</Text>
            <Text style={styles.emptyStateSubtext}>Add your first contact to get started</Text>
          </View>
        ) : (
          <View style={styles.contactsList}>
            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <View style={styles.contactHeader}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.is_primary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone_number}</Text>
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(contact)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(contact)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email || 'Not available'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Relationship *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Friend, Family, Partner"
                value={relationship}
                onChangeText={setRelationship}
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsPrimary(!isPrimary)}
            >
              <View style={[styles.checkbox, isPrimary && styles.checkboxChecked]}>
                {isPrimary && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Set as primary contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  contactsList: {
    gap: 12,
    marginBottom: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
  },
  primaryBadge: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editButtonText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#e91e63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalClose: {
    fontSize: 24,
    color: '#7f8c8d',
    fontWeight: '300',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  saveButton: {
    backgroundColor: '#e91e63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
