'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const announcementDate = process.env.NEXT_PUBLIC_ANNOUNCEMENT_DATE;

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
            <p className="text-gray-300 font-light leading-relaxed">
              Thank you for registering your interest. Your details have been recorded successfully. Please wait for the official announcement regarding the applicants selected for the discount.
            </p>
            
            {id && (
              <div className="mt-6 p-5 bg-[#2a2a2a] rounded text-center border border-[#444]">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Registration Reference</p>
                <p className="text-xl font-mono text-white tracking-wider">{id.split('-')[0]}</p>
              </div>
            )}

            {announcementDate && (
              <p className="text-sm text-gray-400 mt-6 pt-6 border-t border-[#333]">
                Expected announcement date:<br/>
                <strong className="text-white text-base font-medium mt-1 inline-block">{announcementDate}</strong>
              </p>
            )}

            <div className="mt-8 pt-8">
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
