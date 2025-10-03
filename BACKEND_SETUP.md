# Safety Call App - Backend Setup

## Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `safety-call-app`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

### Step 3: Update Configuration

1. Open `config/supabase.ts` in your project
2. Replace the placeholder values:
   ```typescript
   export const supabaseConfig = {
     url: "https://your-project-id.supabase.co",
     anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   };
   ```

### Step 4: Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema
5. You should see "Success. No rows returned" message

### Step 5: Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers**, make sure **Email** is enabled
3. Under **Site URL**, add: `exp://192.168.1.100:8081` (or your local IP)
4. Under **Redirect URLs**, add: `exp://192.168.1.100:8081`

### Step 6: Test the Backend

The backend is now ready! Your app can now:

- ✅ **Authenticate users** (sign up/sign in)
- ✅ **Store emergency contacts**
- ✅ **Log safety incidents**
- ✅ **Share location via SMS**
- ✅ **Real-time updates** (when you add features)

## Database Tables Created

### `emergency_contacts`

- Stores user's emergency contacts
- Fields: name, phone_number, relationship, is_primary

### `safety_incidents`

- Logs all safety-related actions
- Fields: incident_type, location, timestamp, notes

### `user_profiles`

- Stores user preferences
- Fields: display_name, emergency_message

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- All API calls are authenticated
- Database passwords are encrypted

## Next Steps

1. **Test authentication** - Try signing up a user
2. **Add emergency contacts** - Test the contacts feature
3. **Test location sharing** - Verify SMS functionality
4. **Add real-time features** - Live location tracking

## Troubleshooting

### Common Issues:

1. **"Invalid API key"** - Check your `supabase.ts` config
2. **"Permission denied"** - Make sure RLS policies are set up
3. **"SMS not available"** - Test on a real device, not simulator
4. **"Location permission denied"** - Check device location settings

### Getting Help:

- Supabase Docs: https://supabase.com/docs
- Expo Location: https://docs.expo.dev/versions/latest/sdk/location/
- Expo SMS: https://docs.expo.dev/versions/latest/sdk/sms/
