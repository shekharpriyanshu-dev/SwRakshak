import React from 'react';
import { SwRakshakLogo } from './SwRakshakLogo';

interface CompanyFooterProps {
  onOpenAuth?: () => void;
  className?: string;
}

export const CompanyFooter: React.FC<CompanyFooterProps> = ({ onOpenAuth, className = '' }) => {
  return (
    <footer
      id="swrakshak-company-footer"
      className={`w-full bg-[#07030a] border-t border-white/10 text-white/70 text-xs mt-auto relative z-20 overflow-hidden ${className}`}
    >
      {/* Subtle background glow effect */}
      <div className="absolute top-0 left-1/4 w-96 h-40 bg-purple-900/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-40 bg-cyan-900/10 blur-[100px] pointer-events-none"></div>

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Column 1: Company Info & Branding (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <SwRakshakLogo size={36} showName={true} nameInSmall={true} showSubtitle={true} />

            <p className="text-white/60 text-xs leading-relaxed max-w-sm">
              SwRakshak Technologies is India’s next-generation cloud-native Hospital Information & Telemedicine Platform, empowering multispeciality hospital networks, private clinics, and remote patients with unified clinical records, lab telemetry, and encrypted consultations.
            </p>

            {/* Accreditations Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                NABH Accredited
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">shield</span>
                ISO 27001:2022
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-purple-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">lock</span>
                HIPAA Compliant
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-amber-300 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">cloud_done</span>
                ABDM Enabled
              </span>
            </div>

            <div className="pt-2 text-[11px] text-white/40 font-mono">
              Corporate CIN: <span className="text-white/60">U72900DL2024PTC384910</span>
            </div>
          </div>

          {/* Column 2: Registered Address & Facilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-purple-400">domain</span>
              Corporate Address
            </h4>
            <div className="text-xs text-white/60 space-y-2 leading-relaxed">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-semibold text-white/80 block">Headquarters:</span>
                <p>
                  SwRakshak Towers, 4th Floor<br />
                  Plot 22, Institutional Area, Sector 44<br />
                  Gurugram, Haryana - 122003, India
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-semibold text-white/80 block">Clinical Diagnostic Center:</span>
                <p>
                  ApexCare Multispeciality Hospital<br />
                  Ring Road, Okhla Health City<br />
                  New Delhi - 110020, India
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Contact Mail & Helpdesks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-cyan-400">mail</span>
              Direct Inquiries
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <span className="text-white/40 block text-[10px] uppercase font-mono">General Inquiries</span>
                <a
                  href="mailto:contact@swrakshak.health"
                  className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors break-all"
                >
                  contact@swrakshak.health
                </a>
              </li>
              <li>
                <span className="text-white/40 block text-[10px] uppercase font-mono">Provider & Doctor Onboarding</span>
                <a
                  href="mailto:providers@swrakshak.health"
                  className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors break-all"
                >
                  providers@swrakshak.health
                </a>
              </li>
              <li>
                <span className="text-white/40 block text-[10px] uppercase font-mono">Patient Care & Support</span>
                <a
                  href="mailto:support@swrakshak.health"
                  className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors break-all"
                >
                  support@swrakshak.health
                </a>
              </li>
              <li>
                <span className="text-white/40 block text-[10px] uppercase font-mono">HIPAA & Data Privacy Officer</span>
                <a
                  href="mailto:privacy@swrakshak.health"
                  className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors break-all"
                >
                  privacy@swrakshak.health
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: 24x7 Helplines & Emergency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-400">emergency</span>
              Emergency Helplines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase font-mono text-rose-300 block">
                  24x7 Emergency Ambulance
                </span>
                <a
                  href="tel:18002082273"
                  className="text-base font-bold font-mono text-white hover:text-rose-200 transition-colors block"
                >
                  1800-208-CARE (2273)
                </a>
                <span className="text-[10px] text-rose-300/80 block">Toll-free across all states</span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase font-mono text-white/50 block">
                  Telehealth Concierge
                </span>
                <a
                  href="tel:+911149208000"
                  className="font-mono text-white hover:text-cyan-300 transition-colors block"
                >
                  +91 (011) 4920-8000
                </a>
                <span className="text-[10px] text-white/40 block">Mon - Sun (8:00 AM - 10:00 PM)</span>
              </div>

              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="w-full mt-2 py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">login</span>
                  Access Portal Login
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>© {new Date().getFullYear()} SwRakshak Technologies Pvt. Ltd.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All Rights Reserved.</span>
          </div>

          {/* Quick Legal Links */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
            <span className="hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Terms of Telehealth
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Patient Rights Charter
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer transition-colors">
              Security Whitepaper
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
