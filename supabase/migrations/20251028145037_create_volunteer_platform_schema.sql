/*
  # Volunteer Platform Database Schema

  ## Overview
  This migration creates the complete database schema for a volunteer platform with role-based access control.

  ## New Tables

  ### 1. profiles
  Extended user profile information linked to Supabase auth.users
  - `id` (uuid, primary key) - References auth.users
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'user', 'organizer', or 'admin'
  - `profile_image` (text) - URL to profile image
  - `phone` (text) - Contact phone number
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. organizers
  Additional information for users with organizer role
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References profiles.id
  - `organization_name` (text) - Name of organization
  - `description` (text) - Organization description
  - `contact_email` (text) - Organization contact email
  - `verification_status` (text) - Status: 'pending', 'approved', 'rejected'
  - `verification_documents` (text) - URL to verification documents
  - `verified_at` (timestamptz) - Verification timestamp
  - `verified_by` (uuid) - Admin who verified (references profiles.id)
  - `created_at` (timestamptz)

  ### 3. categories
  Event categories for organizing volunteer opportunities
  - `id` (uuid, primary key)
  - `name` (text) - Category name
  - `description` (text) - Category description
  - `icon` (text) - Icon identifier or URL
  - `created_at` (timestamptz)

  ### 4. events
  Volunteer events posted by organizers
  - `id` (uuid, primary key)
  - `title` (text) - Event title
  - `description` (text) - Detailed event description
  - `organizer_id` (uuid) - References organizers.id
  - `category_id` (uuid) - References categories.id
  - `event_date` (timestamptz) - When event occurs
  - `location` (text) - Event location
  - `image_url` (text) - Event banner image
  - `volunteers_needed` (integer) - Number of volunteers needed
  - `status` (text) - Status: 'pending', 'approved', 'rejected', 'completed'
  - `approved_by` (uuid) - Admin who approved (references profiles.id)
  - `approved_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. event_participants
  Tracks which users have joined which events
  - `id` (uuid, primary key)
  - `event_id` (uuid) - References events.id
  - `user_id` (uuid) - References profiles.id
  - `status` (text) - Status: 'joined', 'completed', 'cancelled'
  - `joined_at` (timestamptz)
  - `completed_at` (timestamptz)

  ### 6. event_comments
  User comments and feedback on events
  - `id` (uuid, primary key)
  - `event_id` (uuid) - References events.id
  - `user_id` (uuid) - References profiles.id
  - `comment` (text) - Comment text
  - `created_at` (timestamptz)

  ### 7. contact_messages
  Messages from contact form
  - `id` (uuid, primary key)
  - `name` (text) - Sender name
  - `email` (text) - Sender email
  - `message` (text) - Message content
  - `status` (text) - Status: 'new', 'read', 'responded'
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Create policies for role-based access control
  - Users can read their own data
  - Organizers can manage their events
  - Admins have full access to management functions
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'organizer', 'admin')),
  profile_image text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create organizers table
CREATE TABLE IF NOT EXISTS organizers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  organization_name text NOT NULL,
  description text,
  contact_email text NOT NULL,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_documents text,
  verified_at timestamptz,
  verified_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  organizer_id uuid REFERENCES organizers(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) NOT NULL,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  image_url text,
  volunteers_needed integer DEFAULT 10,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'joined' CHECK (status IN ('joined', 'completed', 'cancelled')),
  joined_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(event_id, user_id)
);

-- Create event_comments table
CREATE TABLE IF NOT EXISTS event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Organizers policies
CREATE POLICY "Organizers are viewable by everyone"
  ON organizers FOR SELECT
  USING (true);

CREATE POLICY "Users can create organizer profile"
  ON organizers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update own profile"
  ON organizers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update organizer verification"
  ON organizers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Events policies
CREATE POLICY "Approved events are viewable by everyone"
  ON events FOR SELECT
  USING (status = 'approved' OR 
    auth.uid() IN (
      SELECT user_id FROM organizers WHERE organizers.id = events.organizer_id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.id = organizer_id
      AND organizers.user_id = auth.uid()
      AND organizers.verification_status = 'approved'
    )
  );

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.id = events.organizer_id
      AND organizers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.id = events.organizer_id
      AND organizers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update event status"
  ON events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Organizers can delete own events"
  ON events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizers
      WHERE organizers.id = events.organizer_id
      AND organizers.user_id = auth.uid()
    )
  );

-- Event participants policies
CREATE POLICY "Event participants are viewable by event organizers and admins"
  ON event_participants FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM events
      JOIN organizers ON organizers.id = events.organizer_id
      WHERE events.id = event_participants.event_id
      AND organizers.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can join events"
  ON event_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON event_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own participation"
  ON event_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Event comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON event_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON event_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON event_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON event_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Contact messages policies
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_organizers_user_id ON organizers(user_id);
CREATE INDEX IF NOT EXISTS idx_organizers_verification_status ON organizers(verification_status);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category_id ON events(category_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);

-- Insert default categories
INSERT INTO categories (name, description, icon) VALUES
  ('Environment', 'Environmental conservation and sustainability projects', 'leaf'),
  ('Education', 'Teaching, tutoring, and educational support', 'book-open'),
  ('Health', 'Healthcare and wellness initiatives', 'heart-pulse'),
  ('Community', 'Community building and social programs', 'users'),
  ('Animals', 'Animal welfare and rescue', 'dog'),
  ('Arts & Culture', 'Arts, culture, and heritage preservation', 'palette')
ON CONFLICT (name) DO NOTHING;
