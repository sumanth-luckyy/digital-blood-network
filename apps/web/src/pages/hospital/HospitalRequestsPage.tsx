import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Building2, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { BloodGroup, UrgencyLevel, RequestStatus } from '../../types';

export const HospitalRequestsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [requests, setRequests] = useState(() => dataService.getRequests());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setRequests(dataService.getRequests());
    });
    return unsub;
  }, []);

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      r.request_code.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital_room_or_doctor?.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === 'all' || r.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Emergency Requisition Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage clinical verifications, matching status, and donor candidate outreach pipelines.
          </p>
        </div>

        <Link to="/patient/new-request">
          <Button size="sm" className="font-semibold shadow-xs" leftIcon={<Plus className="h-4 w-4" />}>
            Create Order
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, code, or doctor..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900"
          >
            <option value="all">All Urgency</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs sm:text-sm text-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="matching">Matching</option>
            <option value="donor_response_received">Responses Received</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Reference</th>
                <th className="py-3 px-6">Patient</th>
                <th className="py-3 px-6">Blood Type</th>
                <th className="py-3 px-6">Units Needed</th>
                <th className="py-3 px-6">Urgency</th>
                <th className="py-3 px-6">Verification</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {req.request_code}
                  </td>
                  <td className="py-4 px-6">
                    <strong className="text-slate-900 block font-semibold">{req.patient_name}</strong>
                    <span className="text-slate-400 text-[11px]">{req.hospital_room_or_doctor}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-[#C62828] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {req.blood_group}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      {req.blood_component}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <strong className="text-slate-900">{req.units_fulfilled}</strong> / {req.units_needed} units
                  </td>
                  <td className="py-4 px-6">
                    <Badge urgency={req.urgency}>{req.urgency}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge verification={req.verification_status}>{req.verification_status}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    <Badge status={req.status}>{req.status.replace('_', ' ')}</Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link to={`/hospital/requests/${req.id}`}>
                      <Button size="sm" variant="outline" className="text-xs py-1">
                        Triage & Match →
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
