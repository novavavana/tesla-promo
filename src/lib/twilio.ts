import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Only initialize if we have real credentials (not placeholders)
export const twilioClient = accountSid && authToken && !accountSid.includes('your_') ? twilio(accountSid, authToken) : null;

export const sendSms = async (to: string, body: string) => {
  if (!twilioClient) {
    console.warn('Twilio client not initialized. SMS not sent:', { to, body });
    return { success: false, error: 'Twilio not configured', sid: null };
  }

  try {
    const message = await twilioClient.messages.create({
      body,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
    });
    return { success: true, sid: message.sid, error: null };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message, sid: null };
  }
};
