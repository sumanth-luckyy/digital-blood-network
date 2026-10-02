import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Award,
  Bell,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle,
  Activity,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';

export const DonorDashboard: React.FC = () => {
  const { user, donorProfile, updateDonorAvailability } = useAuth();

  const [matches, setMatches] = React.useState(() => dataService.getMatches());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setMatches(dataService.getMatches());
    });
    return unsub;
  }, []);

  const pendingInvites = matches.filter(
    (m) =>
      (m.donor_id === donorProfile?.id || m.donor_id === 'donor-marcus' || m.donor_id === '20000000-0000-0000-0000-000000000001') &&
      m.outreach_status === 'sent'
  );

  const isAvailable = donorProfile?.is_available ?? true;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#C62828] to-[#991b1b] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold">
            <Heart className="h-3.5 w-3.5 fill-current text-red-200" />
            <span>Voluntary Lifesaver Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {donorProfile?.donor_name || user?.full_name || 'Marcus'}!
          </h1>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl">
            Blood Group:{' '}
            <strong className="text-white font-bold px-2 py-0.5 rounded bg-black/20 text-sm">
              {donorProfile?.blood_group || 'O-'}
            </strong>{' '}
            • City: {donorProfile?.city || 'New York'} • Consented Radius:{' '}
            {donorProfile?.travel_radius_km || 25} km
          </p>
        </div>

        {/* Real-time Availability Toggle */}
        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 flex items-center justify-between md:flex-col md:items-end gap-3">
          <div className="text-left md:text-right">
            <span className="text-xs text-red-100 block">Emergency Dispatch Status:</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`}
              />
              {isAvailable ? 'Available for Alerts' : 'Temporarily Inactive'}
            </span>
          </div>

          <button
            onClick={() => updateDonorAvailability(!isAvailable)}
            className="flex items-center gap-1.5 bg-white text-[#C62828] hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            {isAvailable ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            <span>{isAvailable ? 'Go Unavailable' : 'Go Active'}</span>
          </button>
        </div>
      </div>

      {/* Pending Emergency Invitations Alert */}
      {pendingInvites.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#C62828] text-white flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {pendingInvites.length} Emergency Blood Invitation Pending!
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-200 text-red-900">
                  Critical Surge
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                City Central Trauma Hospital requires {donorProfile?.blood_group || 'O-'} blood units. Distance ~2.3 km away.
              </p>
            </div>
          </div>
          <Link to="/donor/invitations">
            <Button size="sm" className="whitespace-nowrap shadow-sm font-bold">
              Review & Respond →
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Donations</span>
            <Heart className="h-5 w-5 text-[#C62828]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {donorProfile?.total_donations || 12}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            ~36 Lives Impacted
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Reward Points</span>
            <Award className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {donorProfile?.reward_points || 1450} pts
          </div>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">
            Platinum Tier Contributor
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Eligibility Window</span>
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-1 text-emerald-600">
            <CheckCircle className="h-4 w-4" /> Eligible Now
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Cooldown passed (Subject to screening)
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Invitations</span>
            <Bell className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {pendingInvites.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Within {donorProfile?.travel_radius_km || 25} km zone
          </span>
        </Card>
      </div>

      {/* Main Grid: Badges & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recognition Badges & Safety Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recognition Badges</h3>
                <p className="text-xs text-slate-500">Milestones unlocked through verified donations</p>
              </div>
              <Link to="/donor/history" className="text-xs font-semibold text-[#C62828] hover:underline">
                View History →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(donorProfile?.badges || []).map((badge, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{badge.name}</h4>
                    <span className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                      {badge.tier} Tier Milestone
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pre-Donation Clinical Checklist */}
          <Card className="p-6 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Pre-Donation Clinical Reminders</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Software eligibility estimation does not guarantee clinical acceptance. Certified phlebotomists will screen you on-site. Before attending:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Drink at least 500ml of water and eat a nutritious meal 2-3 hours prior.</li>
              <li>Avoid strenuous physical workouts right after donating.</li>
              <li>Bring a government-issued photo ID to the verified hospital collection center.</li>
              <li>Notify staff if you feel lightheaded, have recent travel, or take blood thinners.</li>
            </ul>
          </Card>
        </div>

        {/* Right Col: Quick Links */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/donor/invitations"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Emergency Invitations ({pendingInvites.length})</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                to="/donor/profile"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Edit Profile & Consents</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                to="/find-blood"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Explore Nearby Facilities</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </div>
          </Card>

          <div className="bg-slate-900 text-slate-300 p-5 rounded-xl space-y-2 text-xs">
            <span className="text-red-400 font-bold uppercase tracking-wider block text-[10px]">
              Privacy Safeguard Active
            </span>
            <p className="leading-relaxed">
              Your home coordinates are obfuscated. Hospital coordinators only see your approximate neighborhood and validated match score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
