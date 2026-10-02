import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, ShieldCheck, Search, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { appStorage } from '../lib/storage';
import { Organization } from '../types';

export const BloodBanksPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'blood_bank' | 'hospital'>('all');

  // Strict requirement: Only verified organizations are displayed in the public directory
  const verifiedOrgs = appStorage
    .getOrganizations()
    .filter((o) => o.verification_status === 'verified' && o.is_public_directory);

  const filtered = verifiedOrgs.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.license_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Accredited Public Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Verified Blood Banks & Hospital Transfusion Centers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Browse verified blood transfusion services, licensed blood banks, and authorized emergency dispatch hubs. All listed centers maintain current state healthcare accreditations.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by facility name, city, or license..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
          >
            <option value="all">All Facilities ({verifiedOrgs.length})</option>
            <option value="blood_bank">Blood Banks Only</option>
            <option value="hospital">Hospitals Only</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((org) => {
          const isBB = org.type === 'blood_bank';
          return (
            <Card key={org.id} className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isBB ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isBB ? 'BB' : 'H'}
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isBB ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {isBB ? 'Licensed Blood Bank' : 'Emergency Hospital'}
                      </span>
                    </div>
                  </div>
                  <Badge verification={org.verification_status}>Verified</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{org.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Lic: {org.license_number}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {org.address}, {org.city}, {org.state} {org.postal_code}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${org.phone}`} className="hover:text-[#C62828] font-medium">
                      {org.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${org.email}`} className="hover:text-[#C62828]">
                      {org.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Verified: {new Date(org.verified_at || '').toLocaleDateString()}
                </span>
                <a
                  href={`tel:${org.phone}`}
                  className="font-semibold text-[#C62828] hover:underline"
                >
                  Contact Dispatch →
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
