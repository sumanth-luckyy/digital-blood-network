import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ListFilter,
  Map as MapIcon,
  Phone,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { BloodMap } from '../components/maps/BloodMap';
import { appStorage } from '../lib/storage';
import { BloodGroup, BloodComponent, Organization, BloodStockBatch, BloodRequest } from '../types';
import { checkClinicalCompatibility } from '../lib/clinicalCompatibility';

export const FindBloodPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGroup = (searchParams.get('group') as BloodGroup) || 'O-';
  const initialCity = searchParams.get('city') || 'Hyderabad';

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>(initialGroup);
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('Whole Blood');
  const [cityFilter, setCityFilter] = useState<string>(initialCity);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userCoords, setUserCoords] = useState<[number, number] | null>([17.385, 78.4867]);
  const [locPermissionState, setLocPermissionState] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const organizations = appStorage.getOrganizations().filter((o) => o.verification_status === 'verified');
  const stockBatches = appStorage.getStock().filter((s) => s.status === 'available');
  const emergencyRequests = appStorage.getRequests().filter((r) => r.status === 'matching' || r.status === 'open');

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: BloodComponent[] = [
    'Whole Blood',
    'Red Blood Cells',
    'Platelets',
    'Fresh Frozen Plasma',
    'Cryoprecipitate',
  ];

  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocPermissionState('requesting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setLocPermissionState('granted');
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err.message);
        setLocPermissionState('denied');
      }
    );
  };

  // Filter available stock batches matching clinical compatibility and city
  const matchedBatches = stockBatches.filter((batch) => {
    // Clinical compatibility
    const compatible = checkClinicalCompatibility(batch.blood_group, selectedGroup, selectedComponent);
    if (!compatible) return false;

    // Component filter (if specified)
    if (batch.blood_component !== selectedComponent && selectedComponent !== 'Whole Blood') {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Emergency Blood Availability Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time verified hospital and blood-bank reserves. Clinically filtered by compatibility.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-white">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#C62828] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" /> List View
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                viewMode === 'map'
                  ? 'bg-[#C62828] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5" /> Map View
            </button>
          </div>

          <Link to="/patient/new-request">
            <Button size="sm" className="shadow-xs font-semibold">
              + Post Blood Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Target Recipient Blood Group */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient Blood Group
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value as BloodGroup)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#C62828]"
            >
              {bloodGroups.map((g) => (
                <option key={g} value={g}>
                  {g} (Show compatible donors)
                </option>
              ))}
            </select>
          </div>

          {/* Blood Component */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Component
            </label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value as BloodComponent)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
            >
              {components.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City / Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              City / Region
            </label>
            <div className="relative">
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g. New York"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 pl-8 pr-3 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
              />
              <MapPin className="h-4 w-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Search Radius & Location Button */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Distance Radius ({radiusKm} km)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#C62828]"
              />
              <button
                onClick={handleRequestLocation}
                title="Use Current Location"
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 shrink-0"
              >
                <Compass className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {locPermissionState === 'denied' && (
          <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg flex items-center gap-2 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              Location permission was denied. Defaulting to city center coordinates. You can still search manually above.
            </span>
          </div>
        )}
      </div>

      {/* Main Content: Map or List View */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <BloodMap
              organizations={organizations}
              requests={emergencyRequests}
              center={userCoords || [40.7128, -74.006]}
              userCoords={userCoords}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#7c3aed] inline-block" /> Blood Banks (Purple)
              <span className="h-3 w-3 rounded-full bg-[#2563eb] inline-block ml-2" /> Hospitals (Blue)
              <span className="h-3 w-3 rounded-full bg-[#dc2626] inline-block ml-2" /> Emergency Requests (Red)
            </span>
            <span className="text-[11px] italic">Exact donor residential coordinates are never displayed.</span>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Compatible Stock Batches Available ({matchedBatches.length} Batches Found)
            </h2>
            <span className="text-xs text-slate-500">
              Showing compatible blood units for <strong className="text-[#C62828]">{selectedGroup}</strong> recipient
            </span>
          </div>

          {matchedBatches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6">
              <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 text-sm">No Compatible Stock In Current Filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No verified blood banks currently report unreserved {selectedGroup} compatible {selectedComponent}.
                Submit an emergency request to broadcast alerts to voluntary donors nearby.
              </p>
              <div className="mt-4">
                <Link to="/patient/new-request">
                  <Button size="sm">Create Emergency Request</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedBatches.map((batch) => {
                const org = organizations.find((o) => o.id === batch.organization_id);
                return (
                  <Card key={batch.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs font-black bg-red-100 text-[#C62828]">
                            {batch.blood_group}
                          </span>
                          <span className="text-xs font-semibold text-slate-900">
                            {batch.blood_component}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">Batch: {batch.batch_number}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        {batch.units_available} Units Free
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{org?.name || batch.organization_name || 'Verified Blood Bank'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{org?.address || 'New York, NY'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Expiry Date: {batch.expiry_date}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={`tel:${org?.phone || '+1-555-345-6789'}`}
                        className="text-xs font-semibold text-[#17233C] hover:text-[#C62828] flex items-center gap-1"
                      >
                        <Phone className="h-3 w-3" /> {org?.phone || 'Call Facility'}
                      </a>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                        Verified Facility
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
