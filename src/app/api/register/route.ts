import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendSms } from '@/lib/twilio';
import { z } from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
  emailAddress: z.string().email("Invalid email address"),
  residentialAddress: z.string().min(5, "Residential address is required"),
  consent: z.boolean().refine(val => val === true, "You must consent to continue")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { fullName, phoneNumber, emailAddress, residentialAddress } = result.data;

    // Check for existing email to prevent duplicates
    const { data: existingUser } = await supabase
      .from('applicants')
      .select('id')
      .eq('email_address', emailAddress)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('applicants')
      .insert([
        {
          full_name: fullName,
          phone_number: phoneNumber,
          email_address: emailAddress,
          residential_address: residentialAddress,
          consent_timestamp: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Attempt to send SMS
    const firstName = fullName.split(' ')[0];
    const announcementDate = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE;
    
    let messageBody = `Hello ${firstName}, your registration for the Tesla Discount Promotion has been received successfully. Please stay tuned for an announcement regarding the selection date and the applicants chosen for the discount. Registration does not guarantee selection. Thank you for your interest.`;

    if (announcementDate) {
      messageBody = `Hello ${firstName}, your registration for the Tesla Discount Promotion has been received successfully. Please keep an eye out for the official announcement on ${announcementDate}, when applicants selected for the discount will be notified. Registration does not guarantee selection. Thank you for your interest.`;
    }

    const smsResult = await sendSms(phoneNumber, messageBody);

    // Update status in db
    await supabase
      .from('applicants')
      .update({
        sms_delivery_status: smsResult.success ? 'sent' : 'failed',
        sms_message_id: smsResult.sid || null
      })
      .eq('id', data.id);

    return NextResponse.json({ 
      success: true, 
      id: data.id,
      smsSent: smsResult.success
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
