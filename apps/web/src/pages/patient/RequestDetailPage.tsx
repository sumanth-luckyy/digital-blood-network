import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { RequestStatus } from '../../types';

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [requests, setRequests] = React.useState(() => dataService.getRequests());
  const [allMatches, setAllMatches] = React.useState(() => dataService.getMatches());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setRequests(dataService.getRequests());
      setAllMatches(dataService.getMatches());
    });
    return unsub;
  }, []);

  const req = requests.find((r) => r.id === id) || requests[0];
  const organizations = appStorage.getOrganizations();
  const hospital = organizations.find((o) => o.id === req.hospital_id);

  const matches = allMatches.filter((m) => m.request_id === req.id);
  const acceptedMatches = matches.filter((m) => m.outreach_status === 'accepted');

  const pipelineSteps: { key: RequestStatus; label: string }[] = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'pending_verification', label: 'Hospital Review' },
    { key: 'matching', label: 'AI Matching' },
    { key: 'donor_response_received', label: 'Donors Responding' },
    { key: 'fulfilled', label: 'Fulfilled' },
  ];

  const getStepIndex = (status: RequestStatus): number => {
    switch (status) {
      case 'submitted':
        return 0;
      case 'pending_verification':
        return 1;
      case 'open':
      case 'matching':
        return 2;
      case 'donor_response_received':
        return 3;
      case 'fulfilled':
        return 4;
      default:
        return 1;
    }
  };

  const currentIndex = getStepIndex(req.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/patient/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Patient Dashboard
      </Link>

      {/* Main Status Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-black bg-red-100 text-[#C62828]">
                {req.blood_group}
              </span>
              <span className="font-mono text-xs text-slate-400 font-semibold">{req.request_code}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{req.patient_name}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Requisition for {req.units_needed} units of {req.blood_component}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge urgency={req.urgency}>{req.urgency}</Badge>
            <Badge status={req.status}>{req.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        {/* Visual Lifecycle Pipeline */}
        <div className="py-2">
          <div className="grid grid-cols-5 gap-2">
            {pipelineSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <div key={step.key} className="text-center space-y-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isPastOrCurrent ? 'bg-[#C62828]' : 'bg-slate-200'
                    } ${isCurrent ? 'ring-2 ring-red-200' : ''}`}
                  />
                  <span
                    className={`text-[11px] block font-semibold ${
                      isPastOrCurrent ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Hospital Facility</span>
            <strong className="text-slate-800 text-sm">{req.hospital_name}</strong>
            <p className="text-slate-500 mt-0.5">{req.hospital_room_or_doctor}</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Needed By</span>
            <strong className="text-slate-800 text-sm">
              {new Date(req.needed_by).toLocaleString()}
            </strong>
            <p className="text-slate-500 mt-0.5">City: {req.city}</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Units Progress</span>
            <strong className="text-slate-800 text-sm text-emerald-700">
              {req.units_fulfilled} / {req.units_needed} Units Fulfilled
            </strong>
            <p className="text-slate-500 mt-0.5">{acceptedMatches.length} donor(s) mobilized</p>
          </div>
        </div>
      </Card>

      {/* Authorized Donor Outreach & Privacy Shield */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Donor Mobilization Progress ({matches.length} Candidates Engaged)
            </h3>
          </div>
          <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Privacy Protected
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          In compliance with health privacy standards, exact donor names and phone numbers are managed directly by hospital phlebotomy triage coordinators. Aggregated response status:
        </p>

        <div className="space-y-3 pt-1">
          {matches.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              Matching candidates will appear here as hospital coordinators review the request.
            </div>
          ) : (
            matches.map((m, idx) => (
              <div
                key={m.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-100 text-[#C62828] font-bold flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <strong className="text-slate-900">
                      Consented {m.donor_blood_group || req.blood_group} Donor
                    </strong>
                    <span className="text-slate-500 text-[11px] block">
                      Approx. ~{m.distance_km || 2.3} km away • AI Match Score: {m.match_score}%
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    m.outreach_status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : m.outreach_status === 'declined'
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {m.outreach_status === 'accepted' ? 'Accepted & En Route' : m.outreach_status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Hospital Coordination Contact */}
      <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-slate-900">{req.hospital_name} Emergency Desk</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            For urgent room changes or blood test updates, contact the lead coordinator.
          </p>
        </div>
        <a href={`tel:${hospital?.phone || '+1-555-234-5678'}`}>
          <Button size="sm" variant="secondary" leftIcon={<Phone className="h-4 w-4" />}>
            Call Hospital Desk
          </Button>
        </a>
      </Card>
    </div>
  );
};
