import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  role: 'user' | 'organizer' | 'admin';
  profile_image: string | null;
  phone: string | null;
  created_at: string;
};

export type Organizer = {
  id: string;
  user_id: string;
  organization_name: string;
  description: string | null;
  contact_email: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_documents: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  organizer_id: string;
  category_id: string;
  event_date: string;
  location: string;
  image_url: string | null;
  volunteers_needed: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventParticipant = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'joined' | 'completed' | 'cancelled';
  joined_at: string;
  completed_at: string | null;
};

export type EventComment = {
  id: string;
  event_id: string;
  user_id: string;
  comment: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'read' | 'responded';
  created_at: string;
};
