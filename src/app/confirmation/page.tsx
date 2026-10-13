'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, Mail, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const name = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const preferredMethod = searchParams.get('method') || 'whatsapp';
  const emailSent = searchParams.get('emailSent') === '1' || searchParams.get('emailSent') === 'true';

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const announcementDate = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '19193093163';
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'teslaspaceinnovation34@gmail.com';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const refCode = id ? id.split('-')[0].toUpperCase() : 'PENDING';

  // WhatsApp Message
  const whatsappMessageText = encodeURIComponent(
    `Hello! I just submitted my registration for the Tesla Discount Promotion.` +
    (name ? `\nName: ${name}` : '') +
    `\nReference Code: #${refCode}\n\n` +
    `Please confirm my registration. Thank you!`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessageText}`;

  // Email Message
  const emailSubject = `Tesla Discount Promotion Registration - #${refCode}`;
  const emailBodyText = 
    `Hello Support Team,\n\n` +
    `I just submitted my registration for the Tesla Discount Promotion.\n\n` +
    `Applicant Name: ${name || 'Applicant'}\n` +
    `Reference Code: #${refCode}\n` +
    (emailParam ? `Email: ${emailParam}\n` : '') +
    `\nPlease confirm my registration. Thank you!`;
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;

  const copyToClipboard = (text: string, type: 'email' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#111] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        </div>
        <h2 className="text-3xl font-medium tracking-tight text-white">
          Registration Received
        </h2>
        <p className="text-gray-400 text-sm font-light mt-2 max-w-md mx-auto">
          Your details have been recorded. Confirm your registration below using WhatsApp or Email.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-[#1c1c1c] py-8 px-6 shadow-2xl sm:px-10 border border-[#333]">
          {/* Reference Code Box */}
          {id && (
            <div className="p-4 bg-[#252525] text-center border border-[#3a3a3a] mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Registration Reference</p>
                <p className="text-xl font-mono text-white tracking-wider font-bold">#{refCode}</p>
              </div>
              <button
                onClick={() => copyToClipboard(`#${refCode}`, 'ref')}
                className="inline-flex items-center text-xs text-gray-300 hover:text-white bg-[#333] hover:bg-[#444] px-3 py-1.5 transition-colors"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          )}

          {/* Automated Email Notice */}
          {emailParam && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-950/40 to-[#1e2530] border border-blue-500/30 text-xs text-blue-200 space-y-2.5">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-sm">Automated Confirmation Sent</p>
                  <p className="mt-0.5 text-blue-200/90 leading-relaxed">
                    A registration summary with your reference code was sent to <strong className="text-white">{emailParam}</strong>.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] leading-relaxed flex items-start space-x-2">
                <span className="flex-shrink-0 text-sm">⚠️</span>
                <div>
                  <strong>Didn&apos;t see the email in your main feed?</strong>
                  <p className="mt-0.5 text-amber-200/90">
                    Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder. Be sure to mark it as <em>&quot;Not Spam&quot;</em> so you receive the official selection announcements!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest text-center">
              Additional Confirmation & Contact Options
            </p>

            {/* WhatsApp Option Card */}
            <div className={`p-5 border transition-all ${
              preferredMethod === 'whatsapp' 
                ? 'bg-[#14231b] border-[#25D366]/40 shadow-lg' 
                : 'bg-[#222] border-[#333]'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5 text-[#25D366]">
                  <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span className="font-semibold text-xs uppercase tracking-wider text-[#25D366]">Option 1: WhatsApp Support</span>
                </div>
                {preferredMethod === 'whatsapp' && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-[#25D366]/20 text-[#25D366] px-2 py-0.5">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Connect directly with our team on WhatsApp to confirm your entry and receive real-time updates.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-green-500/25"
              >
                <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Confirm via WhatsApp
              </a>
            </div>

            {/* Email Option Card */}
            <div className={`p-5 border transition-all ${
              preferredMethod === 'email' 
                ? 'bg-[#131d2e] border-blue-500/40 shadow-lg' 
                : 'bg-[#222] border-[#333]'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5 text-blue-400">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold text-xs uppercase tracking-wider text-blue-400">Option 2: Email Confirmation</span>
                </div>
                {preferredMethod === 'email' && (
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-400 px-2 py-0.5">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Don&apos;t have WhatsApp? Confirm your entry directly via email with our support desk.
              </p>
              
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={mailtoUrl}
                  className="inline-flex items-center justify-center py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Now
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(supportEmail, 'email')}
                  className="inline-flex items-center justify-center py-3 px-4 bg-[#2a2a2a] hover:bg-[#333] text-gray-200 border border-[#444] font-semibold text-xs uppercase tracking-wider transition-all"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      Email Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2 text-gray-400" />
                      Copy Support Email
                    </>
                  )}
                </button>
              </div>

              <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2 text-amber-300 text-[11px] leading-relaxed">
                <span className="flex-shrink-0">⚠️</span>
                <span>
                  <strong>Tip:</strong> If our automated email does not appear in your primary inbox, please check your <strong>Spam / Junk</strong> folder and mark it as <em>&quot;Not Spam&quot;</em>.
                </span>
              </div>

              <div className="mt-2 text-[11px] text-gray-400 text-center sm:text-left">
                Support email: <span className="font-mono text-gray-300">{supportEmail}</span>
              </div>
            </div>
          </div>

          {announcementDate && (
            <p className="text-sm text-gray-400 mt-6 pt-6 border-t border-[#333] text-center">
              Expected announcement date:<br/>
              <strong className="text-white text-base font-medium mt-1 inline-block">{announcementDate}</strong>
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-[#333]">
            <Link href="/" className="inline-block w-full py-3.5 px-4 border border-white/40 hover:border-white shadow-sm text-xs font-semibold uppercase tracking-widest text-white hover:bg-white hover:text-black text-center transition-all">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111] text-white flex items-center justify-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
