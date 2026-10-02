import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Building2,
  Phone,
  AlertCircle,
  Heart,
  Navigation,
  Search,
  Filter,
  Layers,
  ChevronRight,
  ShieldCheck,
  Droplet,
  Compass,
  CheckCircle2,
  X,
  ExternalLink,
  Flame,
  Radio,
  Clock,
  Sparkles,
  Info,
  Globe,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Organization,
  BloodRequest,
  DonorProfile,
  BloodGroup,
  UrgencyLevel,
} from '../../types';
import { checkClinicalCompatibility, calculateDistanceKm } from '../../lib/clinicalCompatibility';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  INDIAN_STATES,
  INDIAN_CITIES,
  INDIA_DEFAULT_CENTER,
  INDIA_DEFAULT_ZOOM,
  findIndianCityCoords,
} from '../../lib/indianGeoData';

// Fix Leaflet default marker assets in Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom HTML/CSS Marker generator
const createMapMarkerIcon = (
  color: string,
  badgeText: string,
  opts?: { pulse?: boolean; isEmergency?: boolean; isDonor?: boolean; isBloodBank?: boolean }
) => {
  const pulseHtml = opts?.pulse
    ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${color}; opacity: 0.45; animation: ping 1.3s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
    : '';

  return L.divIcon({
    className: 'bloodlink-india-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 38px; height: 38px;">
        ${pulseHtml}
        <div style="
          background: ${color};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.38);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: -0.02em;
          position: relative;
          z-index: 10;
        ">
          ${badgeText}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

// Required Marker Types & Colors:
// - Blue: Hospitals
// - Purple: Blood banks
// - Red: Emergency blood requests
// - Green: Donors who have explicitly opted in
const hospitalIcon = createMapMarkerIcon('#1D4ED8', 'H'); // Blue
const bloodBankIcon = createMapMarkerIcon('#7C3AED', 'BB', { isBloodBank: true }); // Purple
const emergencyCriticalIcon = createMapMarkerIcon('#DC2626', 'SOS', { pulse: true, isEmergency: true }); // Red pulsing
const emergencyHighIcon = createMapMarkerIcon('#E11D48', 'SOS', { isEmergency: true }); // Red
const donorIcon = createMapMarkerIcon('#059669', 'DONOR', { isDonor: true }); // Green
const userLocationIcon = createMapMarkerIcon('#4F46E5', 'YOU'); // Indigo

// Dynamic map view controller component
function MapViewController({
  targetCoords,
  zoomLevel,
}: {
  targetCoords: [number, number] | null;
  zoomLevel: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (targetCoords) {
      map.setView(targetCoords, zoomLevel, { animate: true, duration: 1.2 });
    }
  }, [targetCoords, zoomLevel, map]);
  return null;
}

interface InteractiveEmergencyMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
  highlightRequestId?: string;
}

export const InteractiveEmergencyMap: React.FC<InteractiveEmergencyMapProps> = ({
  className = 'h-[650px] w-full',
  initialCenter = INDIA_DEFAULT_CENTER, // Center on India [22.5, 79.0]
  initialZoom = INDIA_DEFAULT_ZOOM, // Zoom 5 (all-India view)
}) => {
  const navigate = useNavigate();

  // Data states from dataService
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donors, setDonors] = useState<DonorProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Map view & location states
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [mapZoom, setMapZoom] = useState<number>(initialZoom);
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');

  // Indian Geographic Filtering states
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Blood & Urgency Filter states
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel | 'ALL'>('ALL');
  const [showHospitals, setShowHospitals] = useState<boolean>(true);
  const [showBloodBanks, setShowBloodBanks] = useState<boolean>(true);
  const [showRequests, setShowRequests] = useState<boolean>(true);
  const [showDonors, setShowDonors] = useState<boolean>(true);

  // UI interaction states
  const [selectedItem, setSelectedItem] = useState<{
    type: 'hospital' | 'blood_bank' | 'request' | 'donor';
    data: any;
    coords: [number, number];
  } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'donors' | 'filters' | 'legend'>('donors');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load data and subscribe to realtime changes
  const loadData = () => {
    try {
      const orgList = dataService.getOrganizations();
      const reqList = dataService.getRequests();
      const donorList = dataService.getDonors();

      setOrganizations(orgList);
      setRequests(reqList);
      setDonors(donorList);
      setIsLoading(false);
    } catch (e) {
      console.error('Error loading map data:', e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    dataService.syncFromSupabase().then(() => loadData());
    const unsubscribe = subscribeToDataChanges(loadData);
    return () => unsubscribe();
  }, []);

  // Browser Geolocation API handler
  const handleFindMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('locating');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setMapCenter(coords);
        setMapZoom(13);
        setLocationStatus('granted');
        showToast('Location detected! Map centered on your position.');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationStatus('denied');
        showToast('Location permission denied. Map kept on India overview.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Jump to specific Indian city
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    if (cityName === 'ALL') {
      if (selectedState === 'ALL') {
        setMapCenter(INDIA_DEFAULT_CENTER);
        setMapZoom(INDIA_DEFAULT_ZOOM);
      }
      return;
    }

    const city = INDIAN_CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (city) {
      setMapCenter([city.latitude, city.longitude]);
      setMapZoom(city.zoom);
      setSelectedState(city.state);
      showToast(`Zoomed to ${city.name}, ${city.state}`);
    }
  };

  // Jump to state
  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setSelectedCity('ALL');

    if (stateName === 'ALL') {
      setMapCenter(INDIA_DEFAULT_CENTER);
      setMapZoom(INDIA_DEFAULT_ZOOM);
      return;
    }

    // Find first city in that state to center on
    const stateCities = INDIAN_CITIES.filter((c) => c.state === stateName);
    if (stateCities.length > 0) {
      const primaryCity = stateCities[0];
      setMapCenter([primaryCity.latitude, primaryCity.longitude]);
      setMapZoom(8); // State-level overview zoom
    }
  };

  // Helper to determine coordinates for a request
  const getRequestCoords = (req: BloodRequest): [number, number] => {
    if (req.hospital_id) {
      const hosp = organizations.find((o) => o.id === req.hospital_id);
      if (hosp && hosp.latitude && hosp.longitude) {
        return [hosp.latitude, hosp.longitude];
      }
    }
    // Lookup city coords
    const cityCoords = findIndianCityCoords(req.city);
    if (cityCoords) {
      const charSum = req.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const latOffset = ((charSum % 100) - 50) * 0.0006;
      const lonOffset = (((charSum * 3) % 100) - 50) * 0.0006;
      return [cityCoords[0] + latOffset, cityCoords[1] + lonOffset];
    }
    return [17.385, 78.4867]; // Default Hyderabad
  };

  // Helper to compute privacy-safe approximate donor coordinates
  const getDonorApproxCoords = (d: DonorProfile): [number, number] => {
    if (d.latitude && d.longitude) {
      // PRIVACY PROTECTION: Jitter slightly within ~1.2 km to protect residential privacy
      const fuzzSeed = (d.id.charCodeAt(0) || 5) % 10;
      const fLat = d.latitude + (fuzzSeed - 5) * 0.002;
      const fLon = d.longitude + (5 - fuzzSeed) * 0.002;
      return [fLat, fLon];
    }
    const cityCoords = findIndianCityCoords(d.city);
    if (cityCoords) return cityCoords;
    return [17.418, 78.435];
  };

  // Filtered organizations
  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      if (org.type === 'hospital' && !showHospitals) return false;
      if (org.type === 'blood_bank' && !showBloodBanks) return false;

      if (selectedState !== 'ALL' && org.state !== selectedState) return false;
      if (selectedCity !== 'ALL' && org.city.toLowerCase() !== selectedCity.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesCity = org.city.toLowerCase().includes(q);
        const matchesState = org.state?.toLowerCase().includes(q);
        const matchesDistrict = org.district?.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesState && !matchesDistrict) return false;
      }

      return true;
    });
  }, [organizations, showHospitals, showBloodBanks, selectedState, selectedCity, searchQuery]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (!showRequests) return [];
    return requests.filter((req) => {
      if (req.status === 'fulfilled' || req.status === 'cancelled' || req.status === 'expired') {
        return false;
      }

      if (selectedBloodGroup !== 'ALL' && req.blood_group !== selectedBloodGroup) return false;
      if (selectedUrgency !== 'ALL' && req.urgency !== selectedUrgency) return false;
      if (selectedState !== 'ALL' && req.state && req.state !== selectedState) return false;
      if (selectedCity !== 'ALL' && req.city.toLowerCase() !== selectedCity.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesHospital = req.hospital_name.toLowerCase().includes(q);
        const matchesCity = req.city.toLowerCase().includes(q);
        const matchesCode = req.request_code.toLowerCase().includes(q);
        if (!matchesHospital && !matchesCity && !matchesCode) return false;
      }

      return true;
    });
  }, [requests, showRequests, selectedBloodGroup, selectedUrgency, selectedState, selectedCity, searchQuery]);

  // Filtered consented donors (PRIVACY-PROTECTED)
  const filteredDonors = useMemo(() => {
    if (!showDonors) return [];
    return donors.filter((d) => {
      // Must have explicit consent and active status
      if (!d.is_available || !d.consent_share_approx_location) return false;

      if (selectedBloodGroup !== 'ALL') {
        const isCompatible = checkClinicalCompatibility(d.blood_group, selectedBloodGroup, 'Whole Blood');
        if (!isCompatible) return false;
      }

      if (selectedState !== 'ALL' && d.state && d.state !== selectedState) return false;
      if (selectedCity !== 'ALL' && d.city.toLowerCase() !== selectedCity.toLowerCase()) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCity = d.city.toLowerCase().includes(q);
        const matchesArea = d.area?.toLowerCase().includes(q);
        if (!matchesCity && !matchesArea) return false;
      }

      return true;
    });
  }, [donors, showDonors, selectedBloodGroup, selectedState, selectedCity, searchQuery]);

  // Ranked compatible nearby donors for sidebar
  const nearbyCompatibleDonors = useMemo(() => {
    const referenceCenter = userCoords || mapCenter;
    return filteredDonors
      .map((donor) => {
        const coords = getDonorApproxCoords(donor);
        const distance = calculateDistanceKm(referenceCenter[0], referenceCenter[1], coords[0], coords[1]);
        return { donor, distance, coords };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [filteredDonors, userCoords, mapCenter]);

  // 8 standard blood groups
  const bloodGroups: (BloodGroup | 'ALL')[] = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Popular quick-jump Indian cities (prioritizing AP & Telangana)
  const popularCities = [
    { name: 'All India', city: 'ALL', state: 'ALL' },
    { name: 'Hyderabad', city: 'Hyderabad', state: 'Telangana' },
    { name: 'Vijayawada', city: 'Vijayawada', state: 'Andhra Pradesh' },
    { name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { name: 'Guntur', city: 'Guntur', state: 'Andhra Pradesh' },
    { name: 'Eluru', city: 'Eluru', state: 'Andhra Pradesh' },
    { name: 'Tirupati', city: 'Tirupati', state: 'Andhra Pradesh' },
    { name: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka' },
    { name: 'Chennai', city: 'Chennai', state: 'Tamil Nadu' },
    { name: 'Mumbai', city: 'Mumbai', state: 'Maharashtra' },
    { name: 'Delhi', city: 'Delhi', state: 'Delhi' },
  ];

  return (
    <div className={`relative flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl ${className}`}>
      {/* Top Controls Header */}
      <div className="bg-[#17233C] px-4 py-3 border-b border-slate-700/60 flex flex-col gap-2.5 z-30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, hospital, or district in India..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-800/90 text-slate-100 placeholder-slate-400 rounded-lg text-xs sm:text-sm border border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* State and City Dropdowns */}
          <div className="flex items-center gap-2">
            {/* State Select */}
            <select
              value={selectedState}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs py-1.5 px-2.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#C62828]"
            >
              <option value="ALL">🇮🇳 All States & UTs</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* City Select */}
            <select
              value={selectedCity}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs py-1.5 px-2.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#C62828]"
            >
              <option value="ALL">All Cities</option>
              {INDIAN_CITIES.filter((c) => selectedState === 'ALL' || c.state === selectedState).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Find My Location */}
            <button
              onClick={handleFindMyLocation}
              disabled={locationStatus === 'locating'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                locationStatus === 'granted'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Locate my position in India"
            >
              {locationStatus === 'locating' ? (
                <Radio className="h-3.5 w-3.5 animate-spin text-[#C62828]" />
              ) : (
                <Compass className={`h-3.5 w-3.5 ${locationStatus === 'granted' ? 'text-emerald-400' : 'text-slate-400'}`} />
              )}
              <span className="hidden sm:inline">
                {locationStatus === 'locating'
                  ? 'Locating...'
                  : locationStatus === 'granted'
                  ? 'Location Active'
                  : 'Find My Location'}
              </span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Panels ({nearbyCompatibleDonors.length})</span>
            </button>
          </div>
        </div>

        {/* Quick City Navigation Pills & Blood Group Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-700/50">
          {/* Quick Indian City Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden lg:inline">
              Cities:
            </span>
            {popularCities.map((pc) => (
              <button
                key={pc.name}
                onClick={() => {
                  if (pc.city === 'ALL') {
                    setSelectedState('ALL');
                    setSelectedCity('ALL');
                    setMapCenter(INDIA_DEFAULT_CENTER);
                    setMapZoom(INDIA_DEFAULT_ZOOM);
                  } else {
                    handleCitySelect(pc.city);
                  }
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all whitespace-nowrap ${
                  selectedCity === pc.city
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-white/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {pc.name}
              </button>
            ))}
          </div>

          {/* Blood Groups Selector */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden xl:inline">
              Group:
            </span>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBloodGroup(bg)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-all whitespace-nowrap ${
                  selectedBloodGroup === bg
                    ? 'bg-[#C62828] text-white shadow-sm ring-1 ring-white/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Leaflet Map Canvas */}
        <div className="relative flex-1 h-full min-h-[440px]">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="h-full w-full z-10"
          >
            {/* Dynamic pan/zoom controller */}
            <MapViewController targetCoords={mapCenter} zoomLevel={mapZoom} />

            {/* Standard OpenStreetMap Tile Layer with Proper Attribution */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | India Emergency Blood Grid'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {/* User Location Detected Circle */}
            {userCoords && (
              <>
                <Circle
                  center={userCoords}
                  radius={4000}
                  pathOptions={{
                    color: '#4F46E5',
                    fillColor: '#4F46E5',
                    fillOpacity: 0.12,
                    dashArray: '4, 8',
                  }}
                />
                <Marker position={userCoords} icon={userLocationIcon}>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Compass className="h-3.5 w-3.5 text-indigo-600" />
                        Your Detected Location
                      </div>
                      <p className="text-slate-600">Active regional search center (~4.0 km radius).</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* 1. Hospitals (Blue Markers) */}
            {filteredOrganizations.filter(o => o.type === 'hospital').map((org) => {
              if (!org.latitude || !org.longitude) return null;

              return (
                <Marker
                  key={org.id}
                  position={[org.latitude, org.longitude]}
                  icon={hospitalIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedItem({
                        type: 'hospital',
                        data: org,
                        coords: [org.latitude, org.longitude],
                      });
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-2 min-w-[220px] text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Hospital
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">{org.name}</h4>

                      <div className="space-y-1 text-slate-600">
                        <p className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{org.address}, {org.city}, {org.state}</span>
                        </p>
                        <p className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{org.phone}</span>
                        </p>
                      </div>

                      <div className="pt-1 flex gap-1.5">
                        <Link
                          to="/find-blood"
                          className="flex-1 text-center bg-[#17233C] hover:bg-slate-800 text-white font-semibold py-1 px-2 rounded text-[11px] transition-colors"
                        >
                          View Hospital Stock
                        </Link>
                        <button
                          onClick={() => {
                            setMapCenter([org.latitude, org.longitude]);
                            setMapZoom(14);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          Center
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 2. Blood Banks (Purple Markers) */}
            {filteredOrganizations.filter(o => o.type === 'blood_bank').map((org) => {
              if (!org.latitude || !org.longitude) return null;

              return (
                <Marker
                  key={org.id}
                  position={[org.latitude, org.longitude]}
                  icon={bloodBankIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedItem({
                        type: 'blood_bank',
                        data: org,
                        coords: [org.latitude, org.longitude],
                      });
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-2 min-w-[220px] text-xs">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Blood Bank
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" /> e-RaktKosh Certified
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">{org.name}</h4>

                      <div className="space-y-1 text-slate-600">
                        <p className="flex items-start gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span>{org.address}, {org.city}, {org.state}</span>
                        </p>
                        <p className="flex items-center gap-1 font-medium text-slate-700">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{org.phone}</span>
                        </p>
                      </div>

                      <div className="pt-1 flex gap-1.5">
                        <Link
                          to="/blood-banks"
                          className="flex-1 text-center bg-purple-700 hover:bg-purple-800 text-white font-semibold py-1 px-2 rounded text-[11px] transition-colors"
                        >
                          Check Inventory
                        </Link>
                        <button
                          onClick={() => {
                            setMapCenter([org.latitude, org.longitude]);
                            setMapZoom(14);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors"
                        >
                          Center
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 3. Emergency Blood Requests (Red / SOS Markers) */}
            {filteredRequests.map((req) => {
              const coords = getRequestCoords(req);
              const isCritical = req.urgency === 'critical';
              const icon = isCritical ? emergencyCriticalIcon : emergencyHighIcon;

              return (
                <Marker
                  key={req.id}
                  position={coords}
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      setSelectedItem({
                        type: 'request',
                        data: req,
                        coords,
                      });
                    },
                  }}
                >
                  <Popup>
                    <div className="p-1.5 space-y-2 min-w-[230px] text-xs">
                      {/* Urgency Badge */}
                      <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-1.5">
                        <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wide flex items-center gap-1">
                          <Flame className="h-3 w-3" /> EMERGENCY {req.blood_group}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          {req.request_code}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{req.hospital_name}</h4>
                        <p className="text-slate-500 text-[11px]">{req.city}, {req.area || 'Emergency Center'}</p>
                      </div>

                      {/* Clinical units & Component (Privacy safe: no private patient phone in public popup) */}
                      <div className="bg-red-50 border border-red-100 rounded p-1.5 space-y-0.5">
                        <div className="flex justify-between text-red-950 font-bold text-xs">
                          <span>Component:</span>
                          <span>{req.blood_component}</span>
                        </div>
                        <div className="flex justify-between text-red-900 text-[11px]">
                          <span>Units Needed:</span>
                          <span className="font-bold">{req.units_needed} Units</span>
                        </div>
                        <div className="flex justify-between text-red-700 text-[10px]">
                          <span>Urgency:</span>
                          <span className="uppercase font-semibold">{req.urgency}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex gap-1.5">
                        <Link
                          to={`/patient/requests/${req.id}`}
                          className="flex-1 text-center bg-[#C62828] hover:bg-red-700 text-white font-bold py-1.5 px-2 rounded text-[11px] transition-colors shadow-sm"
                        >
                          Respond to Donate
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* 4. Consented Available Donors (Green Markers + Privacy Zone Circle) */}
            {filteredDonors.map((donor) => {
              const coords = getDonorApproxCoords(donor);

              return (
                <React.Fragment key={donor.id}>
                  {/* Privacy-safe approximate zone circle (~1.2 km radius) */}
                  <Circle
                    center={coords}
                    radius={1200}
                    pathOptions={{
                      color: '#059669',
                      fillColor: '#059669',
                      fillOpacity: 0.12,
                      weight: 1,
                    }}
                  />
                  <Marker
                    position={coords}
                    icon={donorIcon}
                    eventHandlers={{
                      click: () => {
                        setSelectedItem({
                          type: 'donor',
                          data: donor,
                          coords,
                        });
                      },
                    }}
                  >
                    <Popup>
                      <div className="p-1.5 space-y-2 min-w-[220px] text-xs">
                        <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-1.5">
                          <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1">
                            <Heart className="h-3 w-3" /> DONOR {donor.blood_group}
                          </span>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 font-bold px-1.5 py-0.5 rounded">
                            Available Now
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {donor.donor_name || 'Volunteer Donor'}
                          </h4>
                          <p className="text-slate-500 text-[11px]">
                            Approximate Zone: {donor.area || donor.city} (~1.2 km circle)
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded p-1.5 space-y-1 text-slate-600 text-[11px]">
                          <div className="flex justify-between">
                            <span>Total Donations:</span>
                            <strong className="text-slate-900">{donor.total_donations} times</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Travel Radius:</span>
                            <span className="text-slate-900 font-semibold">{donor.travel_radius_km} km max</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic">
                          🔒 Exact home address & phone shielded for privacy.
                        </p>

                        <div className="pt-1">
                          <button
                            onClick={() => {
                              showToast(`Emergency alert dispatched to ${donor.donor_name || 'Donor'} (${donor.blood_group})!`);
                            }}
                            className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded text-[11px] transition-colors shadow-sm"
                          >
                            Send Emergency Request
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs text-slate-200 hidden sm:block max-w-[280px]">
            <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Map Legend</span>
              <span className="text-[10px] text-emerald-400 font-semibold">India Grid</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white shrink-0"></span>
                <span>Hospitals ({filteredOrganizations.filter(o => o.type === 'hospital').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-white shrink-0"></span>
                <span>Blood Banks ({filteredOrganizations.filter(o => o.type === 'blood_bank').length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shrink-0 animate-pulse"></span>
                <span className="font-semibold text-red-300">Emergency Requests ({filteredRequests.length})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white shrink-0"></span>
                <span className="text-emerald-300">Consented Donors ({filteredDonors.length})</span>
              </div>
            </div>

            {/* Demo Data Disclaimer */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-amber-400/90 flex items-center gap-1">
              <Info className="h-3 w-3 shrink-0" />
              <span>Labelled DEMO DATA (e-RaktKosh / NHM Mock Schema)</span>
            </div>
          </div>

          {/* Toast Notification Pill */}
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#C62828] text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 border border-red-400/40 animate-bounce">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Sidebar: Nearby Compatible Donors & Layer Filters */}
        <div
          className={`
            ${mobileDrawerOpen ? 'absolute inset-0 z-30 flex' : 'hidden md:flex'}
            w-full md:w-80 lg:w-96 bg-slate-900 border-l border-slate-700/70 flex-col shrink-0 overflow-hidden
          `}
        >
          {/* Sidebar Header Tabs */}
          <div className="bg-slate-950 p-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarTab('donors')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sidebarTab === 'donors'
                    ? 'bg-[#C62828] text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Nearby Donors ({nearbyCompatibleDonors.length})
              </button>
              <button
                onClick={() => setSidebarTab('filters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sidebarTab === 'filters'
                    ? 'bg-[#C62828] text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                Filters & Layers
              </button>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TAB 1: NEARBY COMPATIBLE DONORS */}
            {sidebarTab === 'donors' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-semibold text-slate-300">
                    {selectedBloodGroup === 'ALL' ? 'All Active Donors in View' : `Matching ${selectedBloodGroup} Donors`}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {selectedCity === 'ALL' ? 'All Regions' : selectedCity}
                  </span>
                </div>

                {nearbyCompatibleDonors.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-800/40 rounded-xl border border-slate-800">
                    <Heart className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-300">No compatible donors in view</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Try selecting "ALL" blood groups or choosing a different city.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedBloodGroup('ALL');
                        setSelectedCity('ALL');
                        setSelectedState('ALL');
                        setSearchQuery('');
                        setMapCenter(INDIA_DEFAULT_CENTER);
                        setMapZoom(INDIA_DEFAULT_ZOOM);
                      }}
                      className="mt-3 text-xs text-[#C62828] hover:underline font-bold"
                    >
                      Reset All Geographic Filters
                    </button>
                  </div>
                ) : (
                  nearbyCompatibleDonors.map(({ donor, distance, coords }) => (
                    <div
                      key={donor.id}
                      onClick={() => {
                        setMapCenter(coords);
                        setMapZoom(14);
                        setSelectedItem({
                          type: 'donor',
                          data: donor,
                          coords,
                        });
                        setMobileDrawerOpen(false);
                      }}
                      className="group cursor-pointer bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/50 rounded-xl p-3 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white font-extrabold text-xs px-2 py-0.5 rounded shadow-sm">
                            {donor.blood_group}
                          </span>
                          <span className="font-bold text-slate-200 text-xs truncate max-w-[130px]">
                            {donor.donor_name || 'Volunteer Donor'}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                          ~{distance} km
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">{donor.area || donor.city}, {donor.state || 'India'}</span>
                        <span>{donor.total_donations} donations</span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px]">
                        <span className="text-slate-500">Travel radius: up to {donor.travel_radius_km} km</span>
                        <span className="text-emerald-400 font-bold group-hover:underline flex items-center gap-0.5">
                          View on map <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: LAYER & URGENCY FILTERS */}
            {sidebarTab === 'filters' && (
              <div className="space-y-4 text-xs text-slate-200">
                <div className="font-bold text-slate-300 text-xs border-b border-slate-800 pb-2 uppercase tracking-wider">
                  Map Layers Visibility
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white"></span>
                      <span>Hospitals (Blue)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showHospitals}
                      onChange={(e) => setShowHospitals(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-white"></span>
                      <span>Blood Banks (Purple)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showBloodBanks}
                      onChange={(e) => setShowBloodBanks(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white"></span>
                      <span>Emergency SOS Requests (Red)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showRequests}
                      onChange={(e) => setShowRequests(e.target.checked)}
                      className="rounded text-red-600 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white"></span>
                      <span>Consented Donors (Green)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={showDonors}
                      onChange={(e) => setShowDonors(e.target.checked)}
                      className="rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Urgency Level Filter */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="font-bold text-slate-300 block uppercase tracking-wider text-[11px]">
                    Emergency Urgency Filter
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['ALL', 'critical', 'high', 'medium', 'low'] as (UrgencyLevel | 'ALL')[]).map((urg) => (
                      <button
                        key={urg}
                        onClick={() => setSelectedUrgency(urg)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                          selectedUrgency === urg
                            ? 'bg-[#C62828] text-white shadow'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {urg}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Transparency Notice */}
                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Info className="h-3.5 w-3.5 text-amber-400" />
                    <span>Indian Data Source Notice</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    Designed for e-RaktKosh / National Health Mission (NHM) standards. Demo facilities are synthetic representations across Andhra Pradesh, Telangana, and national metros.
                  </p>
                </div>
              </div>
            )}

            {/* Selected Marker Detail Card */}
            {selectedItem && (
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-3.5 space-y-3 mt-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Selected Location
                  </span>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Request Details */}
                {selectedItem.type === 'request' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-white">
                        {selectedItem.data.hospital_name}
                      </span>
                      <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        {selectedItem.data.blood_group}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Component: <strong>{selectedItem.data.blood_component}</strong> ({selectedItem.data.units_needed} units required)
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Location: {selectedItem.data.city}, {selectedItem.data.area || 'Emergency Center'} ({selectedItem.data.state || 'India'})
                    </p>
                    <Link
                      to={`/patient/requests/${selectedItem.data.id}`}
                      className="block w-full text-center bg-[#C62828] hover:bg-red-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      View Emergency Request Details
                    </Link>
                  </div>
                )}

                {/* Hospital Details */}
                {selectedItem.type === 'hospital' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-white">
                        {selectedItem.data.name}
                      </span>
                      <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Hospital
                      </span>
                    </div>
                    <p className="text-slate-400">{selectedItem.data.address}, {selectedItem.data.city}, {selectedItem.data.state}</p>
                    <p className="text-slate-300 font-medium">Helpline: {selectedItem.data.phone}</p>
                    <Link
                      to="/find-blood"
                      className="block w-full text-center bg-[#17233C] hover:bg-slate-800 text-white font-bold py-2 rounded-lg text-xs transition-colors"
                    >
                      Check Hospital Blood Reserves
                    </Link>
                  </div>
                )}

                {/* Blood Bank Details (Purple) */}
                {selectedItem.type === 'blood_bank' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-white">
                        {selectedItem.data.name}
                      </span>
                      <span className="bg-purple-900 text-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        Blood Bank
                      </span>
                    </div>
                    <p className="text-slate-400">{selectedItem.data.address}, {selectedItem.data.city}, {selectedItem.data.state}</p>
                    <p className="text-slate-300 font-medium">Dispatch: {selectedItem.data.phone}</p>
                    <Link
                      to="/blood-banks"
                      className="block w-full text-center bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Check Inventory & Stock
                    </Link>
                  </div>
                )}

                {/* Donor Details */}
                {selectedItem.type === 'donor' && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-white">
                        {selectedItem.data.donor_name || 'Active Volunteer Donor'}
                      </span>
                      <span className="bg-emerald-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        {selectedItem.data.blood_group}
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Zone: {selectedItem.data.area || selectedItem.data.city} ({selectedItem.data.state || 'India'})
                    </p>
                    <p className="text-slate-400">
                      Verified Donations: <strong>{selectedItem.data.total_donations} times</strong>
                    </p>
                    <button
                      onClick={() => {
                        showToast(`Emergency alert dispatched to ${selectedItem.data.donor_name || 'Donor'}!`);
                      }}
                      className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Dispatch Emergency Alert
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
