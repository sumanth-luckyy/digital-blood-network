import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Users,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { appStorage } from '../../lib/storage';

import { dataService, subscribeToDataChanges } from '../../lib/dataService';

export const AdminDashboard: React.FC = () => {
  const [orgs, setOrgs] = React.useState(() => appStorage.getOrganizations());
  const [donors, setDonors] = React.useState(() => appStorage.getDonors());
  const [requests, setRequests] = React.useState(() => dataService.getRequests());
  const [stock, setStock] = React.useState(() => dataService.getStock());
  const [matches, setMatches] = React.useState(() => dataService.getMatches());
  const [auditLogs, setAuditLogs] = React.useState(() => dataService.getAuditLogs());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setOrgs(appStorage.getOrganizations());
      setDonors(appStorage.getDonors());
      setRequests(dataService.getRequests());
      setStock(dataService.getStock());
      setMatches(dataService.getMatches());
      setAuditLogs(dataService.getAuditLogs());
    });
    return unsub;
  }, []);

  const pendingOrgs = orgs.filter((o) => o.verification_status === 'pending');
  const activeRequests = requests.filter((r) => r.status !== 'fulfilled' && r.status !== 'cancelled');
  const totalStockUnits = stock.reduce((acc, curr) => acc + curr.units_available, 0);
  const successfulMatches = matches.filter((m) => m.outreach_status === 'accepted').length;
  const criticalShortages = stock.filter((b) => b.units_available <= 2 && b.status === 'available').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Platform Administration Suite
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
              Admin Restricted
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Network oversight, hospital accreditation auditing, security telemetry, and cross-facility governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/organizations">
            <Button size="sm" className="font-semibold shadow-xs" leftIcon={<ShieldCheck className="h-4 w-4" />}>
              Organization Approvals ({pendingOrgs.length})
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button size="sm" variant="outline" leftIcon={<FileText className="h-4 w-4 text-slate-600" />}>
              Audit Trail
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Verifications Callout */}
      {pendingOrgs.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {pendingOrgs.length} Healthcare Organization(s) Awaiting Accreditation Audit
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Review state medical licenses before authorizing facilities to broadcast emergency blood calls.
              </p>
            </div>
          </div>
          <Link to="/admin/organizations">
            <Button size="sm" className="font-bold whitespace-nowrap shadow-xs">
              Audit Submissions →
            </Button>
          </Link>
        </div>
      )}

      {/* 6 Required Network Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Donors</span>
            <Users className="h-4 w-4 text-[#C62828]" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{donors.length}</div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
            Registered volunteers
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Active Requests</span>
            <Activity className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{activeRequests.length}</div>
          <span className="text-[10px] text-purple-700 font-medium block mt-0.5">
            Emergency surges
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Available Blood</span>
            <Layers className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{totalStockUnits}</div>
          <span className="text-[10px] text-slate-500 block mt-0.5">Units across hubs</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Successful Matches</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{successfulMatches}</div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
            Accepted donor invites
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Critical Shortages</span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{criticalShortages}</div>
          <span className="text-[10px] text-red-600 font-medium block mt-0.5">
            Groups with ≤2 units
          </span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">System Activity</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">{auditLogs.length}</div>
          <span className="text-[10px] text-blue-700 font-medium block mt-0.5">
            Logged audit events
          </span>
        </Card>
      </div>

      {/* Main Grid: Pending Orgs & Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Verification Submissions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Organization Verification Queue</h2>
            <Link
              to="/admin/organizations"
              className="text-xs font-semibold text-[#C62828] hover:underline"
            >
              View Full Queue →
            </Link>
          </div>

          <div className="space-y-3">
            {pendingOrgs.map((org) => (
              <Card key={org.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{org.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">Lic: {org.license_number}</p>
                  </div>
                  <Badge verification={org.verification_status}>{org.verification_status}</Badge>
                </div>
                <p className="text-xs text-slate-600">
                  {org.address}, {org.city}, {org.state}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Phone: {org.phone}</span>
                  <Link
                    to="/admin/organizations"
                    className="font-semibold text-[#C62828] hover:underline"
                  >
                    Review License →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Privileged Action Audit Logs</h2>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-semibold text-[#C62828] hover:underline"
            >
              Full Security Ledger →
            </Link>
          </div>

          <Card className="divide-y divide-slate-100 p-2">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#17233C]">{log.action}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-600">
                  Actor: <strong className="text-slate-800">{log.actor_name}</strong> • Target:{' '}
                  {log.resource_type}
                </p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
