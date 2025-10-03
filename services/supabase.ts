import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase';

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafetyIncident {
  id: string;
  user_id: string;
  incident_type: 'fake_call' | 'location_share' | 'emergency_call';
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  timestamp: string;
  notes?: string;
  created_at: string;
}
