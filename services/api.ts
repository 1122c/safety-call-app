import { supabase, EmergencyContact, SafetyIncident, User } from './supabase';

export class SafetyAPI {
  // Authentication methods
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Emergency contacts methods
  static async getEmergencyContacts(): Promise<{ data: EmergencyContact[] | null; error: any }> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });
    
    return { data, error };
  }

  static async addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([contact])
      .select();
    
    return { data, error };
  }

  static async updateEmergencyContact(id: string, updates: Partial<EmergencyContact>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', id)
      .select();
    
    return { data, error };
  }

  static async deleteEmergencyContact(id: string) {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  // Safety incidents methods
  static async logSafetyIncident(incident: Omit<SafetyIncident, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('safety_incidents')
      .insert([incident])
      .select();
    
    return { data, error };
  }

  static async getSafetyIncidents(): Promise<{ data: SafetyIncident[] | null; error: any }> {
    const { data, error } = await supabase
      .from('safety_incidents')
      .select('*')
      .order('created_at', { ascending: false });
    
    return { data, error };
  }

  // User profile methods
  static async getUserProfile() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single();
    
    return { data, error };
  }

  static async updateUserProfile(updates: { display_name?: string; emergency_message?: string }) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(updates)
      .select();
    
    return { data, error };
  }
}
