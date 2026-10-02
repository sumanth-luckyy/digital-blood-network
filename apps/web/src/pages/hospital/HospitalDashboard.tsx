import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';

export const HospitalDashboard: React.FC = () => {
  const [requests, setRequests] = React.useState(() => dataService.getRequests());
  const [stock, setStock] = React.useState(() => dataService.getStock());
  const [matches, setMatches] = React.useState(() => dataService.getMatches());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setRequests(dataService.getRequests());
      setStock(dataService.getStock());
      setMatches(dataService.getMatches());
    });
    return unsub;
  }, []);

  const openRequests = requests.filter(
    (r) => r.status === 'submitted' || r.status === 'matching' || r.status === 'open' || r.status === 'donor_response_received'
  );
  const criticalRequests = openRequests.filter((r) => r.urgency === 'critical');
  const pendingVerification = requests.filter((r) => r.verification_status === 'pending');
  const hospitalStock = stock.filter((s) => s.organization_id === 'org-hosp-1' || s.organization_name?.includes('Hospital'));
  const totalHospitalUnits = hospitalStock.reduce((acc, curr) => acc + curr.units_available, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              City Central Trauma Hospital — Emergency Operations
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
              Hospital Staff Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical triage, emergency requisition verification, AI donor matching, and on-hand emergency blood reserve tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/patient/new-request">
            <Button size="sm" className="font-semibold shadow-xs" leftIcon={<Plus className="h-4 w-4" />}>
              Create Request
            </Button>
          </Link>
          <Link to="/forecast">
            <Button size="sm" variant="outline" className="font-semibold" leftIcon={<TrendingUp className="h-4 w-4 text-slate-600" />}>
              Demand Forecast
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Triage Notice if any critical requests */}
      {criticalRequests.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#C62828] text-white flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {criticalRequests.length} Critical Transfusion Request(s) Active!
                </h3>
                <span className="bg-red-200 text-red-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Immediate Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {criticalRequests[0].patient_name} requires {criticalRequests[0].units_needed} units of{' '}
                {criticalRequests[0].blood_group} ({criticalRequests[0].blood_component}).
              </p>
            </div>
          </div>
          <Link to={`/hospital/requests/${criticalRequests[0].id}`}>
            <Button size="sm" className="font-bold whitespace-nowrap shadow-xs">
              Triage Request Now →
            </Button>
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Active Requests</span>
            <Activity className="h-5 w-5 text-[#C62828]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{openRequests.length}</div>
          <span className="text-[11px] text-red-600 font-medium mt-1 block">
            {criticalRequests.length} Critical Urgency
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Pending Review</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {pendingVerification.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Awaiting Clinical Verification
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Hospital Stock</span>
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalHospitalUnits}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Units available on-hand</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Donor Outreach</span>
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{matches.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            AI Ranked Candidates
          </span>
        </Card>
      </div>

      {/* Main Grid: Open Requests Table & Stock Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Open Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Emergency Requisition Orders</h2>
            <Link to="/hospital/requests" className="text-xs font-semibold text-[#C62828] hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 4).map((r) => (
              <Card key={r.id} className="p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded text-xs font-black bg-red-100 text-[#C62828]">
                      {r.blood_group}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{r.patient_name}</h4>
                      <p className="text-xs text-slate-500">
                        {r.units_needed} units {r.blood_component} • {r.hospital_room_or_doctor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge urgency={r.urgency}>{r.urgency}</Badge>
                    <Badge verification={r.verification_status}>{r.verification_status}</Badge>
                    <Link to={`/hospital/requests/${r.id}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Hospital On-hand Inventory Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Hospital Emergency Units</h2>
            <Link to="/hospital/inventory" className="text-xs font-semibold text-[#C62828] hover:underline">
              Manage Batches →
            </Link>
          </div>

          <Card className="p-5 space-y-3 divide-y divide-slate-100">
            {hospitalStock.map((b) => (
              <div key={b.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="text-[#C62828]">{b.blood_group}</span>
                    <span>{b.blood_component}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Loc: {b.storage_location}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-slate-900">{b.units_available}</span>
                  <span className="text-[10px] text-slate-400 block">
                    ({b.units_reserved} reserved)
                  </span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
