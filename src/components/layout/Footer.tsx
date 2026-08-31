import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Shield, CheckCircle2, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Company Bio */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                DR
              </div>
              <span className="font-bold text-lg text-white tracking-tight">DIGITAL RANCHI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Purpose-built local business growth platform. We help Jharkhand SMBs get discovered on Google Maps, generate authentic 5-star reviews, and turn searches into paying customers.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium pt-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Razorpay Verified Payment Processing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Growth Solutions
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Google Business Profile Verification
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Smart Review QR Stands & NFC
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  High-Converting 1-Page Mini Websites
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Local Map Pack 3-Pack SEO
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  WhatsApp Business Growth Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Packages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Transparent Pricing
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Starter Verification (₹499)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Growth Kickstart (₹999)
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Premium Retainer (₹2,499/mo)
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-white text-indigo-400 font-semibold transition-colors">
                  Free Digital Presence Audit
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Local Presence
            </h4>
            <div className="flex items-start gap-2.5 text-xs">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>Main Road, Lalpur & Circular Road, Ranchi, Jharkhand — 834001</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Phone className="w-4 h-4 text-sky-400 shrink-0" />
              <span>+91 94311 09876 / +91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <span>growth@digitalranchi.in</span>
            </div>
            <a
              href="https://wa.me/919431109876?text=Hi%20Digital%20Ranchi,%20I%20want%20to%20grow%20my%20local%20business%20on%20Google"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-all mt-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp Directly
            </a>
          </div>
        </div>

        {/* Bottom Legal & Non-GST Disclosure */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Digital Ranchi. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Tax Mode: Non-GST Bill of Supply (Configurable)</span>
            <span>•</span>
            <span>Server-side Verified Razorpay Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
