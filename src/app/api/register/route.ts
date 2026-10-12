import { NextResponse } from 'next/server';
import { turso } from '@/lib/turso';
import { sendSms } from '@/lib/twilio';
import { z } from 'zod';
import crypto from 'crypto';

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
    const existing = await turso.execute({
      sql: 'SELECT id FROM applicants WHERE email_address = ? LIMIT 1',
      args: [emailAddress]
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An application with this email already exists.' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const consentTimestamp = new Date().toISOString();

    // Insert into Turso applicants table
    await turso.execute({
      sql: `INSERT INTO applicants (id, full_name, phone_number, email_address, residential_address, consent_timestamp, selection_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, fullName, phoneNumber, emailAddress, residentialAddress, consentTimestamp, 'Pending Review']
    });

    // Attempt to send SMS if configured
    const firstName = fullName.split(' ')[0];
    const announcementDate = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE;
    
    let messageBody = `Hello ${firstName}, your registration for the Tesla Discount Promotion has been received successfully. Please stay tuned for an announcement regarding the selection date and the applicants chosen for the discount. Registration does not guarantee selection. Thank you for your interest.`;

    if (announcementDate) {
      messageBody = `Hello ${firstName}, your registration for the Tesla Discount Promotion has been received successfully. Please keep an eye out for the official announcement on ${announcementDate}, when applicants selected for the discount will be notified. Registration does not guarantee selection. Thank you for your interest.`;
    }

    const smsResult = await sendSms(phoneNumber, messageBody);

    if (smsResult.success || smsResult.sid) {
      await turso.execute({
        sql: 'UPDATE applicants SET sms_delivery_status = ?, sms_message_id = ? WHERE id = ?',
        args: [smsResult.success ? 'sent' : 'failed', smsResult.sid || null, id]
      });
    }

    return NextResponse.json({ 
      success: true, 
      id,
      smsSent: smsResult.success
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}
