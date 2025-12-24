import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase';

// Validate config before creating client
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const supabaseUrl = supabaseConfig.url && supabaseConfig.url !== 'YOUR_SUPABASE_URL' 
  ? supabaseConfig.url 
  : 'https://placeholder.supabase.co';

const supabaseAnonKey = supabaseConfig.anonKey && supabaseConfig.anonKey !== 'YOUR_SUPABASE_ANON_KEY'
  ? supabaseConfig.anonKey
  : 'placeholder-key';

if (!isValidUrl(supabaseUrl) || supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn(
    '⚠️ Supabase not configured. Please update config/supabase.ts with your Supabase URL and anon key.\n' +
    'Authentication features will not work until configured.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
