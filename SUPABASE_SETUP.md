# Supabase Setup Instructions

1. Create a new project in [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase dashboard and run the following script to create the necessary tables and policies:

```sql
-- Create applicants table
CREATE TABLE applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email_address TEXT NOT NULL UNIQUE,
  residential_address TEXT NOT NULL,
  registration_timestamp TIMESTAMPTZ DEFAULT NOW(),
  sms_delivery_status TEXT DEFAULT 'pending',
  sms_message_id TEXT,
  consent_timestamp TIMESTAMPTZ NOT NULL,
  selection_status TEXT DEFAULT 'Pending Review' CHECK (selection_status IN ('Pending Review', 'Selected', 'Not Selected', 'Contacted'))
);

-- Enable Row Level Security
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;

-- Allow public to insert new applicants (for the registration form)
CREATE POLICY "Allow public insert to applicants" 
ON applicants FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow authenticated admins to view and update applicants
CREATE POLICY "Allow admins to read applicants"
ON applicants FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow admins to update applicants"
ON applicants FOR UPDATE
TO authenticated
USING (true);
```

3. Obtain your Supabase credentials:
   - Go to Project Settings -> API
   - Copy the `Project URL` and `anon public` key.
   - You will also need the `service_role` key if you want to bypass RLS for server-side administrative actions or you can use standard auth.

4. Create an admin user:
   - Go to Authentication -> Users
   - Click "Add user" -> "Create new user"
   - Enter an email and password for the admin account. Auto-confirm the user.

5. Configure Environment Variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Also add Twilio credentials.
