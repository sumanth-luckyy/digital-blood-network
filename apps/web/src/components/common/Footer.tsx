import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, PhoneCall, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#17233C] text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Medical Safety Disclaimer Callout */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 mb-10 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300 font-semibold block mb-0.5">
              Clinical & Regulatory Advisory
            </strong>
            BloodLink is a digital emergency blood donation coordination platform. Matching algorithms
            and candidate rankings assist healthcare coordinators and do NOT constitute clinical approval.
            Every donor must complete compulsory on-site medical screening, hemoglobin checks, and pathogen
            testing conducted by certified phlebotomists at licensed facilities prior to transfusion.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Emergency Hotline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#C62828] flex items-center justify-center text-white">
                <Droplet className="h-4 w-4 fill-current" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Blood<span className="text-[#C62828]">Link</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering voluntary lifesavers, patients, verified hospitals, and blood banks with rapid,
              transparent emergency coordination.
            </p>
            <div className="flex items-center gap-2.5 text-xs text-red-300 font-semibold bg-red-950/40 p-2.5 rounded-lg border border-red-900/50">
              <PhoneCall className="h-4 w-4 text-[#C62828]" />
              <span>24/7 Emergency Dispatch: 1-800-BLOOD-LINK</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Emergency Coordination</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/find-blood" className="hover:text-white transition-colors">
                  Find Emergency Blood
                </Link>
              </li>
              <li>
                <Link to="/patient/new-request" className="hover:text-white transition-colors">
                  Submit Blood Request
                </Link>
              </li>
              <li>
                <Link to="/blood-banks" className="hover:text-white transition-colors">
                  Verified Blood Banks
                </Link>
              </li>
              <li>
                <Link to="/forecast" className="hover:text-white transition-colors">
                  AI Demand Forecasting
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Donor & Healthcare */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Donors & Hospitals</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/auth/register" className="hover:text-white transition-colors">
                  Register as Volunteer Donor
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How Matching Works
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Clinical Safety Protocols
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Support & Facility Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Security & Compliance</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Encrypted Health Records</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Strict Geographic Privacy</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Facility Auditing</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2">
                Coordinates approximate geocodes only. Exact donor residential addresses are never shared publicly.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BloodLink Emergency Network. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
