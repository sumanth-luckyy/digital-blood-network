import React, { useState } from 'react';
import { Heart, MapPin, Shield, Bell, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { BloodGroup } from '../../types';
import { appStorage } from '../../lib/storage';

export const DonorProfilePage: React.FC = () => {
  const { user, donorProfile, refreshDonorProfile } = useAuth();

  const [fullName, setFullName] = useState(donorProfile?.donor_name || user?.full_name || 'Marcus Chen');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(donorProfile?.blood_group || 'O-');
  const [city, setCity] = useState(donorProfile?.city || 'New York');
  const [area, setArea] = useState(donorProfile?.area || 'Lower Manhattan');
  const [radius, setRadius] = useState<number>(donorProfile?.travel_radius_km || 25);
  const [isAvailable, setIsAvailable] = useState<boolean>(donorProfile?.is_available ?? true);
  const [consentAlerts, setConsentAlerts] = useState<boolean>(donorProfile?.consent_emergency_alerts ?? true);
  const [consentLocation, setConsentLocation] = useState<boolean>(donorProfile?.consent_share_approx_location ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorProfile) return;

    const donors = appStorage.getDonors();
    const updated = donors.map((d) =>
      d.id === donorProfile.id
        ? {
            ...d,
            donor_name: fullName,
            blood_group: bloodGroup,
            city,
            area,
            travel_radius_km: radius,
            is_available: isAvailable,
            consent_emergency_alerts: consentAlerts,
            consent_share_approx_location: consentLocation,
          }
        : d
    );
    appStorage.setDonors(updated);
    refreshDonorProfile();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Donor Profile & Privacy Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your contact credentials, blood group, travel radius, and privacy consents.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Profile changes and privacy preferences successfully saved.</span>
        </div>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Identity & Blood Group
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                >
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location & Radius */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Geographic Service Radius
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Area / Neighborhood
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Maximum Travel Radius: <strong className="text-[#C62828]">{radius} km</strong>
                </label>
                <span className="text-[11px] text-slate-400">Range: 5 km - 100 km</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-[#C62828]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                You will only be notified of hospital emergency requests located within this radius.
              </p>
            </div>
          </div>

          {/* Privacy & Consents */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Privacy & Consent Controls
            </h3>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="mt-0.5 rounded text-[#C62828] focus:ring-[#C62828]"
              />
              <div className="text-xs">
                <strong className="block text-slate-900 font-semibold">Active Donor Status</strong>
                <span className="text-slate-500">
                  Unchecking this stops all new incoming outreach notifications until re-enabled.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAlerts}
                onChange={(e) => setConsentAlerts(e.target.checked)}
                className="mt-0.5 rounded text-[#C62828] focus:ring-[#C62828]"
              />
              <div className="text-xs">
                <strong className="block text-slate-900 font-semibold">
                  Consent to Emergency Outreach Broadcasts
                </strong>
                <span className="text-slate-500">
                  Allow verified hospital staff to include your profile in compatible candidate donor rankings.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={consentLocation}
                onChange={(e) => setConsentLocation(e.target.checked)}
                className="mt-0.5 rounded text-[#C62828] focus:ring-[#C62828]"
              />
              <div className="text-xs">
                <strong className="block text-slate-900 font-semibold">
                  Consent to Approximate Geographic Distance Matching
                </strong>
                <span className="text-slate-500">
                  Strictly approximate distance only. Exact GPS / residential address is never stored or revealed.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />} className="font-semibold">
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
