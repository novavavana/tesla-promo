# Tesla Discount Promotion Registration

A modern, responsive Next.js application for a promotional landing page. Allows users to register their interest for a potential vehicle discount and automatically sends a confirmation SMS. 

## Features

- **Premium Design**: Clean, automotive-inspired UI using Tailwind CSS.
- **Registration Form**: Secure form with client and server-side validation.
- **SMS Integration**: Automated SMS notifications via Twilio upon successful registration.
- **Admin Dashboard**: Secure Supabase-authenticated dashboard to view applicants, manage statuses, and export data.
- **Modern Stack**: Next.js (App Router), React, Supabase, Twilio, Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js 18+ 
- A [Supabase](https://supabase.com/) account
- A [Twilio](https://twilio.com/) account

### 1. Database Setup (Supabase)
Please follow the instructions in the \`SUPABASE_SETUP.md\` file in this repository to configure your database tables, Row Level Security (RLS) policies, and to create an initial admin user.

### 2. Environment Variables
Copy the example environment file to create your local environment configuration:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in all the required variables:
- \`NEXT_PUBLIC_SUPABASE_URL\`: Your Supabase Project URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Your Supabase Anon Key
- \`TWILIO_ACCOUNT_SID\`: Twilio Account SID
- \`TWILIO_AUTH_TOKEN\`: Twilio Auth Token
- \`TWILIO_PHONE_NUMBER\`: Your Twilio phone number
- \`NEXT_PUBLIC_ANNOUNCEMENT_DATE\`: The expected announcement date to display on the confirmation page (e.g., "December 15th, 2026")

### 3. Installation
Install the required NPM dependencies:
\`\`\`bash
npm install
\`\`\`

### 4. Running Locally
Start the Next.js development server:
\`\`\`bash
npm run dev
\`\`\`
- Landing Page: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin (Log in with the Supabase user you created)

### Architecture & Security
- **Data Protection**: Supabase Row Level Security ensures the public can only INSERT registrations, while authenticated administrators can READ and UPDATE records.
- **Server-Side APIs**: Twilio SMS triggering is handled securely in a Next.js API Route (\`/api/register\`), preventing sensitive credentials from leaking to the client.

## Disclaimer
This project is an independent promotion system and is not affiliated with, endorsed by, or sponsored by Tesla, Inc.
