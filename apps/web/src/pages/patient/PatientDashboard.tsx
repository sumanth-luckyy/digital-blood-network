import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Plus, Clock, CheckCircle2, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = React.useState(() => dataService.getRequests());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setAllRequests(dataService.getRequests());
    });
    return unsub;
  }, []);

  // Show requests belonging to user or demo requests
  const userRequests = allRequests.filter(
    (r) => r.requester_id === user?.id || r.requester_id === 'user-patient' || r.requester_id?.startsWith('user-')
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Patient & Caregiver Portal
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
              Requester
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track emergency requisition status, verified hospital reviews, and donor mobilization.
          </p>
        </div>

        <Link to="/patient/new-request">
          <Button size="md" className="font-semibold shadow-xs" leftIcon={<Plus className="h-4 w-4" />}>
            New Emergency Request
          </Button>
        </Link>
      </div>

      {/* Safety Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Hospital Clinical Review:</strong> All requests must be confirmed by attending clinical staff at the designated hospital before emergency donor alerts are dispatched to the voluntary network.
        </p>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Your Emergency Requests ({userRequests.length})
          </h2>
          <span className="text-xs text-slate-500">Live Status Tracking</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {userRequests.map((req) => (
            <Card key={req.id} className="p-6 space-y-4 hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg text-sm font-black bg-red-100 text-[#C62828]">
                    {req.blood_group}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{req.patient_name}</h3>
                    <p className="text-xs text-slate-400 font-mono">Reference: {req.request_code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge urgency={req.urgency}>{req.urgency}</Badge>
                  <Badge status={req.status}>{req.status.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Units Needed: <strong>{req.units_needed} units ({req.blood_component})</strong></span>
                  <span className="font-semibold text-emerald-700">
                    {req.units_fulfilled} of {req.units_needed} Fulfilled
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C62828] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((req.units_fulfilled / req.units_needed) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>{req.hospital_name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Needed: {new Date(req.needed_by).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 italic">
                  <span>"{req.medical_notes}"</span>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Verification: <strong className="text-slate-700 uppercase">{req.verification_status}</strong>
                </span>
                <Link
                  to={`/patient/requests/${req.id}`}
                  className="text-xs font-semibold text-[#C62828] hover:text-[#991b1b] flex items-center gap-1"
                >
                  View Live Progress & Coordination <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
