import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplet,
  Heart,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Search,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  Sparkles,
  ChevronDown,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { appStorage } from '../lib/storage';
import { BloodGroup } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [searchCity, setSearchCity] = useState('New York');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const requests = appStorage.getRequests();
  const urgentRequests = requests.filter((r) => r.status !== 'cancelled' && r.status !== 'fulfilled');

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/find-blood?group=${encodeURIComponent(selectedGroup)}&city=${encodeURIComponent(searchCity)}`);
  };

  const faqs = [
    {
      q: 'How does BloodLink verify emergency requests?',
      a: 'All blood requests submitted by patients or caregivers require verification by licensed hospital personnel or accredited blood banks before emergency donor broadcasts are sent out. This prevents spam, misinformation, and duplicate mobilization.',
    },
    {
      q: 'Are my private contact details and home address shared publicly?',
      a: 'Never. BloodLink prioritizes donor privacy. Coordinates are geocoded to an approximate zone (within your consented travel radius). Personal phone numbers and home addresses are never published on any public feed.',
    },
    {
      q: 'How does the AI donor-ranking service work?',
      a: 'Our explainable algorithm first enforces strict clinical compatibility (ABO & Rh transfusion safety rules), validates legal cooldown intervals (e.g. 56 days for whole blood), and ranks donors by proximity and historical reliability. AI never overrides clinical compatibility.',
    },
    {
      q: 'Can hospitals forecast blood inventory shortages?',
      a: 'Yes. BloodLink includes a time-series demand forecasting engine that analyzes historical intake patterns and seasonal trends to give hospitals and blood banks an early 7-to-30-day projection of stock gaps.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/70 via-slate-50 to-white pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-100/80 border border-red-200 text-[#C62828] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Real-Time Digital Emergency Blood Network</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Seconds Save Lives. <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#C62828] via-[#e53935] to-[#991b1b] bg-clip-text text-transparent">
                Every Drop Connected.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              BloodLink connects voluntary blood donors, patients in critical need, verified hospitals,
              and blood banks into a synchronized, transparent, and explainable emergency care network.
            </p>

            {/* Quick Emergency Search Box */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200 max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-full sm:w-1/3">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left mb-1">
                    Blood Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828]"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg} {bg === 'O-' ? '(Universal Donor)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-1/2">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left mb-1">
                    City / Area
                  </label>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    placeholder="Enter city (e.g. New York)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828] focus:border-[#C62828]"
                  />
                </div>

                <div className="w-full sm:w-auto sm:self-end">
                  <Button type="submit" size="md" className="w-full sm:w-auto h-[42px] px-5" leftIcon={<Search className="h-4 w-4" />}>
                    Find Blood
                  </Button>
                </div>
              </form>
            </div>

            {/* Key Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link to="/patient/new-request">
                <Button size="lg" className="shadow-md hover:shadow-lg" leftIcon={<Zap className="h-5 w-5" />}>
                  Submit Emergency Blood Request
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="secondary" size="lg" leftIcon={<Heart className="h-5 w-5 text-red-400" />}>
                  Register as Voluntary Donor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Urgent Requests Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C62828]"></span>
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Active Hospital Blood Emergencies
              </h2>
            </div>
            <Link
              to="/find-blood"
              className="text-xs font-semibold text-[#C62828] hover:text-[#991b1b] flex items-center gap-1"
            >
              View all requests & facilities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {urgentRequests.slice(0, 3).map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-red-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-black bg-red-100 text-red-800">
                    {req.blood_group}
                  </span>
                  <Badge urgency={req.urgency}>{req.urgency}</Badge>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{req.hospital_name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Need: <strong>{req.units_needed} units</strong> of {req.blood_component}
                </p>
                <p className="text-xs text-slate-600 mt-2 line-clamp-1 italic">
                  "{req.medical_notes}"
                </p>
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{req.city}</span>
                  <Link
                    to={`/patient/requests/${req.id}`}
                    className="text-xs font-semibold text-[#C62828] hover:underline"
                  >
                    View Status →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Network Metrics Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <Users className="h-6 w-6 text-[#C62828] mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">4,850+</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Voluntary Donors</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <Building2 className="h-6 w-6 text-[#17233C] mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">128</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Verified Hospitals & Banks</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <Clock className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">14 Mins</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Avg Donor Response Time</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-center shadow-xs">
            <ShieldCheck className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Clinically Screened Protocols</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">How BloodLink Operates</h2>
          <p className="text-sm text-slate-600 mt-2">
            A secure, multi-stakeholder workflow connecting request, medical verification, explainable AI matching, and safe collection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="h-10 w-10 rounded-lg bg-red-100 text-[#C62828] font-black flex items-center justify-center text-lg mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Request & Hospital Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Patient or caregiver submits an emergency blood request. Authorized hospital staff verify the clinical urgency, doctor in charge, and compatibility crossmatch before public dispatch.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="h-10 w-10 rounded-lg bg-navy-100 text-[#17233C] font-black flex items-center justify-center text-lg mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Explainable AI Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our matching pipeline enforces clinical compatibility rules, checks donor cooldown intervals, and ranks available consenting donors by approximate proximity with transparent scores.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-lg mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Confirmed Care & Inventory</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donors accept invitations in real-time, report to the hospital phlebotomy center for on-site medical screening, and atomic transactions prevent double-reservation of stock batches.
            </p>
          </div>
        </div>
      </section>

      {/* Donor Stories & Synthetic Testimonials */}
      <section className="bg-slate-50 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Lifesaver Stories</h2>
              <p className="text-xs text-slate-500 mt-1">
                Real impact from voluntary donors and clinical coordinators (Sample Community Content)
              </p>
            </div>
            <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-1 rounded font-medium">
              Demo Testimonials
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-red-100 text-[#C62828] font-bold flex items-center justify-center">
                  MC
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Marcus Chen</h4>
                  <span className="text-xs text-slate-500">Universal O- Donor • 12 Donations</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "Receiving an urgent alert when a child was undergoing cardiac surgery right across the bridge gave me purpose. The proximity filter meant I was at the hospital within 25 minutes."
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-navy-100 text-[#17233C] font-bold flex items-center justify-center">
                  RR
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Dr. Rajesh Rao</h4>
                  <span className="text-xs text-slate-500">Chief Trauma Surgeon • City Central</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "BloodLink eliminated the chaotic phone trees we used to rely on. The AI demand forecasting warns us about weekend inventory deficits days before emergency cases arrive."
              </p>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                  PP
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Priya Patel</h4>
                  <span className="text-xs text-slate-500">Caregiver & Requester</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                "When my brother needed rare O- units, the verification gave us peace of mind that genuine hospital staff were managing the request. We were kept updated every step."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-1">
            Understanding clinical safeguards, privacy protections, and network operations.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-4 font-semibold text-sm text-slate-900 flex items-center justify-between hover:bg-slate-50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-[#C62828]' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
