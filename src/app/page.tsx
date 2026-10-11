'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Car, Loader2 } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(7, "Phone number with country code is required"),
  emailAddress: z.string().email("Please enter a valid email address"),
  residentialAddress: z.string().min(10, "Full residential address is required"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to proceed",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Something went wrong. Please try again.');
        return;
      }

      router.push(`/confirmation?id=${result.id}&name=${encodeURIComponent(data.fullName)}`);
    } catch (error) {
      setServerError('A network error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#111] text-white">
      {/* Hero Section with Background Image */}
      <div className="relative w-full h-[60vh] lg:h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop"
          alt="Premium Electric Vehicle"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-[#111]"></div>
        
        <header className="absolute top-0 w-full z-20 py-6">
          <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Car className="text-white" size={28} />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase text-white">Independent Promotions</span>
            </div>
          </div>
        </header>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-12">
          <h1 className="text-4xl md:text-6xl font-medium text-white mb-4 tracking-tight">
            Exclusive Vehicle Discount
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 font-light">
            Register your interest to be considered for a promotional offer.
          </p>
        </div>
      </div>

      <main className="flex-grow -mt-20 relative z-20 pb-24">
        {/* Important Disclaimer Notice */}
        <div className="max-w-3xl mx-auto px-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-5 text-sm text-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-xl">
            <div>
              <p className="font-semibold text-white uppercase tracking-wider text-xs mb-1">Disclaimer</p>
              <p className="leading-relaxed text-gray-300">
                This is an independent promotion and is not affiliated with, endorsed by, or sponsored by Tesla, Inc. Registration does not guarantee selection.
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-[#1c1c1c] shadow-2xl border border-[#333] p-8 md:p-12">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-medium text-white tracking-wide">Application Form</h2>
              <p className="text-gray-400 mt-2 text-sm">Please fill out your details below to register.</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    {...register("fullName")}
                    id="fullName"
                    type="text"
                    className="block w-full rounded bg-[#2a2a2a] border-transparent focus:border-white focus:ring-0 text-white sm:text-sm px-4 py-3 transition-colors"
                  />
                  {errors.fullName && <p className="mt-2 text-xs text-red-400">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                  <input
                    {...register("phoneNumber")}
                    id="phoneNumber"
                    type="tel"
                    className="block w-full rounded bg-[#2a2a2a] border-transparent focus:border-white focus:ring-0 text-white sm:text-sm px-4 py-3 transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phoneNumber && <p className="mt-2 text-xs text-red-400">{errors.phoneNumber.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="emailAddress" className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input
                  {...register("emailAddress")}
                  id="emailAddress"
                  type="email"
                  className="block w-full rounded bg-[#2a2a2a] border-transparent focus:border-white focus:ring-0 text-white sm:text-sm px-4 py-3 transition-colors"
                />
                {errors.emailAddress && <p className="mt-2 text-xs text-red-400">{errors.emailAddress.message}</p>}
              </div>

              <div>
                <label htmlFor="residentialAddress" className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Residential Address</label>
                <textarea
                  {...register("residentialAddress")}
                  id="residentialAddress"
                  rows={3}
                  className="block w-full rounded bg-[#2a2a2a] border-transparent focus:border-white focus:ring-0 text-white sm:text-sm px-4 py-3 transition-colors resize-none"
                />
                {errors.residentialAddress && <p className="mt-2 text-xs text-red-400">{errors.residentialAddress.message}</p>}
              </div>

              <div className="pt-4 border-t border-[#333]">
                <div className="flex items-start">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      {...register("consent")}
                      id="consent"
                      type="checkbox"
                      className="focus:ring-white h-4 w-4 text-white border-gray-600 bg-[#2a2a2a] rounded focus:ring-offset-[#1c1c1c] focus:ring-offset-2 transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="consent" className="font-medium text-gray-200 cursor-pointer">Privacy & SMS Consent</label>
                    <p className="text-gray-500 mt-1 leading-relaxed text-xs">
                      I confirm that I have read the privacy notice and agree to receive an SMS confirmation regarding my registration. Standard message and data rates may apply.
                    </p>
                  </div>
                </div>
                {errors.consent && <p className="mt-2 text-xs text-red-400">{errors.consent.message}</p>}
              </div>

              {serverError && (
                <div className="bg-red-900/30 text-red-300 p-4 rounded text-sm border border-red-800/50">
                  {serverError}
                </div>
              )}

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded shadow-sm text-sm font-semibold uppercase tracking-widest text-[#111] bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1c1c1c] focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-black py-12 border-t border-[#222]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-gray-200 font-medium tracking-wide mb-4 text-sm uppercase">About</h3>
            <p className="text-xs text-gray-500 leading-relaxed">An independent promotion offering potential discounts on electric vehicles to selected applicants. Subject to terms and availability.</p>
          </div>
          <div>
            <h3 className="text-gray-200 font-medium tracking-wide mb-4 text-sm uppercase">Eligibility</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Open to residents 18 years and older. Registration is free and does not guarantee selection or the award of any discount.</p>
          </div>
          <div>
            <h3 className="text-gray-200 font-medium tracking-wide mb-4 text-sm uppercase">Legal</h3>
            <ul className="text-xs space-y-3 text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 mt-16 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; 2026 Independent Promotions. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Not affiliated with Tesla, Inc.</p>
        </div>
      </footer>
    </div>
  );
}
