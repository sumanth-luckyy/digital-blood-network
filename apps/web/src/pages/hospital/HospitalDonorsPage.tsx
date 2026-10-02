import React, { useState } from 'react';
import { Users, Search, MapPin, Award, Heart, ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { appStorage } from '../../lib/storage';
import { BloodGroup } from '../../types';

export const HospitalDonorsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  const donors = appStorage.getDonors();

  const filtered = donors.filter((d) => {
    const matchesSearch =
      (d.donor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = groupFilter === 'all' || d.blood_group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Consented Voluntary Donor Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review registered voluntary donors who have consented to high-urgency notifications. Locations are approximate to protect personal privacy.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor name or city..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Blood Group:</span>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-slate-900"
          >
            <option value="all">All Groups</option>
            {bloodGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((donor) => (
          <Card key={donor.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg text-sm font-black bg-red-100 text-[#C62828]">
                  {donor.blood_group}
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{donor.donor_name}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {donor.area || donor.city}
                  </span>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  donor.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {donor.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Donations</span>
                <strong className="text-slate-800">{donor.total_donations} Completed</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Travel Radius</span>
                <strong className="text-slate-800">Within {donor.travel_radius_km} km</strong>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Consented to Emergency Alerts</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>{donor.badges?.[0]?.name || 'Volunteer Lifesaver'}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
