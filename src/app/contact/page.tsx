'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button, Input } from '@/components/ui';
import { globalStore } from '@/lib/store';

export default function ContactPage() {
  const [businessName, setBusinessName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !phone) return;

    globalStore.createLead({
      businessName,
      contactName: name || businessName,
      phone,
      whatsapp: phone,
      email: `${phone}@lead.digitalranchi.in`,
      category: 'General Inquiry',
      city: 'Ranchi',
      state: 'Jharkhand',
      leadSource: 'Website Contact Page',
      estimatedValue: 999,
      leadScore: 70,
      status: 'NEW',
      notes: message,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Local Growth Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Let's Grow Your Business Together
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Reach out to our Ranchi office directly or send a message for a 1-on-1 strategy consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Details & Direct WhatsApp Card */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">Digital Ranchi Headquarters</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Main Road, Lalpur & Circular Road, Ranchi, Jharkhand — 834001
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-400" />
                  <span>+91 94311 09876 / +91 98765 43210</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span>growth@digitalranchi.in</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>Mon - Sat: 9:30 AM - 7:00 PM</span>
                </div>
              </div>
            </div>

            <div>
              <a
                href="https://wa.me/919431109876?text=Hi%20Digital%20Ranchi,%20I%20want%20to%20grow%20my%20business%20on%20Google"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-lg shadow-emerald-600/30"
              >
                <MessageCircle className="w-4 h-4" />
                Chat with Growth Consultant on WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send a Growth Inquiry
                </h3>
                <Input
                  label="Business Name *"
                  placeholder="e.g. Apex Eye Clinic"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
                <Input
                  label="Your Name *"
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Mobile / WhatsApp Number *"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    What are your main growth goals?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. We need more patient appointments from Google Maps and a review QR stand..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="primary" size="md" className="w-full" icon={Send}>
                  Submit Inquiry
                </Button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thank You, {name || businessName}!
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Our growth strategist will review your profile and reach out via WhatsApp / phone within 2 business hours.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
