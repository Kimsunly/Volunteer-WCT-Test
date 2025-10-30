# VolunteerHub

A comprehensive volunteer management platform built with Next.js, Tailwind CSS, and Supabase.

## Features

### For Volunteers
- Browse and search volunteer events by category and location
- Join events and track participation
- View dashboard with upcoming and past events
- Manage profile and account settings

### For Organizers
- Create and manage volunteer events
- Track volunteer registrations
- View event analytics
- Requires admin verification before posting events

### For Admins
- Approve organizer accounts
- Review and approve events
- Manage platform categories
- View platform statistics
- Monitor contact form submissions

## Getting Started

The application is already configured and ready to use. The database schema has been created with the following tables:
- `profiles` - User profiles with role-based access
- `organizers` - Organization information for event organizers
- `categories` - Event categories (6 pre-populated)
- `events` - Volunteer events
- `event_participants` - Track event registrations
- `event_comments` - User feedback on events
- `contact_messages` - Contact form submissions

## Testing the Platform

### Create Test Accounts

1. **Admin Account** - Create an admin to test approval workflows:
   - Register as a user
   - Manually update the role in Supabase dashboard: `profiles` table → set `role = 'admin'`

2. **Organizer Account** - Test the organizer flow:
   - Register as an organizer from `/register`
   - Fill in organization details
   - Login as admin and approve the organizer

3. **Volunteer Account** - Test the volunteer experience:
   - Register as a volunteer from `/register`
   - Browse events at `/events`
   - Join events and view in dashboard

### Key Workflows

**Organizer Workflow:**
1. Register → Pending verification
2. Admin approves organizer
3. Create events → Events pending approval
4. Admin approves events
5. Events become visible to volunteers

**Volunteer Workflow:**
1. Register as volunteer
2. Browse approved events
3. Join events
4. View joined events in dashboard

## Technology Stack

- **Framework:** Next.js 13 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Date Handling:** date-fns

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control (User, Organizer, Admin)
- Protected routes for authenticated users
- Secure password handling via Supabase Auth
