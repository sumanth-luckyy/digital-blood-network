import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, UserCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';

export const AdminAuditLogsPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = React.useState(() => dataService.getAuditLogs());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setAuditLogs(dataService.getAuditLogs());
    });
    return unsub;
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Security & Compliance Audit Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically recorded audit history for sensitive administrative, clinical verification, and stock adjustment workflows.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Timestamp (UTC)</th>
                <th className="py-3 px-6">Action Event</th>
                <th className="py-3 px-6">Actor ID & Name</th>
                <th className="py-3 px-6">Resource Target</th>
                <th className="py-3 px-6">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-[#17233C] bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-800 font-semibold">
                    {log.actor_name}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono">
                    {log.resource_type}
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                    {JSON.stringify(log.details)}
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
