import React from 'react';
import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  ShieldCheck,
  AlertCircle,
  Building2,
  Heart,
  Droplet,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';
import { InteractiveEmergencyMap } from '../components/maps/InteractiveEmergencyMap';
import { isSupabaseConfigured } from '../lib/supabase';
import { dataService } from '../lib/dataService';

export const EmergencyMapPage: React.FC = () => {
  const requests = dataService.getRequests().filter(r => r.status === 'matching' || r.status === 'open' || r.status === 'submitted');
  const organizations = dataService.getOrganizations();
  const donors = dataService.getDonors().filter(d => d.is_available && d.consent_share_approx_location);

  const hospitalsCount = organizations.filter(o => o.type === 'hospital').length;
  const bloodBanksCount = organizations.filter(o => o.type === 'blood_bank').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 bg-[#C62828] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              <MapIcon className="h-3 w-3" /> Geospatial Emergency Grid
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isSupabaseConfigured ? '🟢 Live Supabase Database' : '⚡ Sandbox Demo Data'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            India Emergency Blood Donation Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Geospatial tracking of verified hospitals, certified blood banks (e-RaktKosh / NHM standards),
            emergency requests, and privacy-protected consented donors across Andhra Pradesh, Telangana, and National Metros.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/find-blood"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <span>Directory List View</span>
          </Link>
          <Link
            to="/patient/new-request"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C62828] hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Create Emergency SOS</span>
          </Link>
        </div>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Hospitals</div>
            <div className="text-lg font-bold text-slate-900">{hospitalsCount} Verified</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Droplet className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Blood Banks</div>
            <div className="text-lg font-bold text-purple-700">{bloodBanksCount} Centers</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">SOS Requests</div>
            <div className="text-lg font-bold text-red-600">{requests.length} Active</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Consented Donors</div>
            <div className="text-lg font-bold text-emerald-700">{donors.length} Available</div>
          </div>
        </div>
      </div>

      {/* Interactive Map Component */}
      <InteractiveEmergencyMap className="h-[620px] w-full" />

      {/* Privacy, Compatibility & Safety Architecture Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block text-slate-800 font-semibold">
            Privacy & Clinical Safety Architecture Guarantee
          </strong>
          <p>
            Donor home addresses and live telemetry are strictly confidential and never displayed on public map layers.
            Green markers represent consented, anonymized search radiuses (~1.2 km). Patient phone numbers and private medical charts are shielded from public marker popups.
          </p>
        </div>
      </div>
    </div>
  );
};
