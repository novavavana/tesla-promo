'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const name = searchParams.get('name');

  const announcementDate = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '19193093163';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const refCode = id ? id.split('-')[0].toUpperCase() : 'PENDING';

  const messageText = encodeURIComponent(
    `Hello! I just submitted my registration for the Tesla Discount Promotion.` +
    (name ? `\nName: ${name}` : '') +
    `\nReference Code: #${refCode}\n\n` +
    `Please confirm my registration. Thank you!`
  );

  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${messageText}`;

  useEffect(() => {
    // Automatically forward to WhatsApp
    window.location.href = whatsappUrl;
  }, [whatsappUrl]);

  return (
    <div className="min-h-screen bg-[#111] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-medium tracking-tight text-white">
          Registration Received
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1c1c1c] py-10 px-6 shadow-2xl sm:rounded-xl sm:px-10 border border-[#333]">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-2 text-gray-300">
              <Loader2 className="w-5 h-5 animate-spin text-[#25D366]" />
              <p className="text-sm font-medium">Opening WhatsApp to confirm your entry...</p>
            </div>
            <p className="text-gray-400 text-xs font-light leading-relaxed">
              Your registration details have been saved. Taking you to WhatsApp right now.
            </p>
            
            {id && (
              <div className="mt-6 p-5 bg-[#2a2a2a] rounded text-center border border-[#444]">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Registration Reference</p>
                <p className="text-xl font-mono text-white tracking-wider">#{refCode}</p>
              </div>
            )}

            {/* Instant WhatsApp Confirmation Button */}
            <div className="mt-6 p-6 bg-[#14231b] border border-[#235338] rounded-xl text-center space-y-3 shadow-lg">
              <div className="flex items-center justify-center space-x-2 text-[#25D366]">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span className="font-semibold text-xs uppercase tracking-widest text-[#25D366]">WhatsApp Support & Updates</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Connect directly with our promotion team on WhatsApp to confirm your entry and receive real-time updates.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all duration-200 shadow-md hover:shadow-green-500/25"
              >
                <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                Confirm via WhatsApp
              </a>
            </div>

            {announcementDate && (
              <p className="text-sm text-gray-400 mt-6 pt-6 border-t border-[#333]">
                Expected announcement date:<br/>
                <strong className="text-white text-base font-medium mt-1 inline-block">{announcementDate}</strong>
              </p>
            )}

            <div className="mt-8 pt-8 border-t border-[#333]">
              <Link href="/" className="inline-block w-full py-4 px-4 border border-white rounded shadow-sm text-sm font-semibold uppercase tracking-widest text-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c1c] focus:ring-white transition-all duration-200">
                Return to Homepage
              </Link>
            </div>
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
