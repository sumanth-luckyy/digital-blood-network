import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  Plus,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { BloodStockRealtimeGrid } from '../../components/common/BloodStockRealtimeGrid';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';

export const BloodBankDashboard: React.FC = () => {
  const [stock, setStock] = React.useState(() =>
    dataService.getStock().filter((s) => s.organization_id === 'org-bb-1' || s.organization_name?.includes('Metro'))
  );
  const [transactions, setTransactions] = React.useState(() => appStorage.getTransactions());

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setStock(
        dataService.getStock().filter((s) => s.organization_id === 'org-bb-1' || s.organization_name?.includes('Metro'))
      );
      setTransactions(appStorage.getTransactions());
    });
    return unsub;
  }, []);

  const totalAvailable = stock.reduce((acc, curr) => acc + curr.units_available, 0);
  const totalReserved = stock.reduce((acc, curr) => acc + curr.units_reserved, 0);
  const lowStockBatches = stock.filter((b) => b.units_available <= 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Metro Health Blood Bank Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
              Blood Bank Staff Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            License: BB-NY-2023-1102 • State Accredited Biological Transfusion Repository.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/blood-bank/inventory">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} className="font-semibold shadow-xs">
              Manage Batches
            </Button>
          </Link>
          <Link to="/blood-bank/transactions">
            <Button size="sm" variant="outline" leftIcon={<FileText className="h-4 w-4" />}>
              Transaction Audit Log
            </Button>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockBatches.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-950">
              {lowStockBatches.length} Blood Group Reserve(s) Approaching Safety Threshold
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              O- Red Blood Cells and A+ Platelets are below safe surge reserves. Review scheduled collections or generate an automated demand forecast.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Available Units</span>
            <Layers className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalAvailable}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Across {stock.length} Active Batches
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Reserved Units</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalReserved}</div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Allocated to Emergency Surgery
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Low Stock Alerts</span>
            <TrendingDown className="h-5 w-5 text-[#C62828]" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{lowStockBatches.length}</div>
          <span className="text-[11px] text-red-600 font-medium mt-1 block">
            Requires Intake Drive
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Audit Movements</span>
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{transactions.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Safe atomic logged transactions
          </span>
        </Card>
      </div>

      {/* Realtime 8-Blood-Group Inventory Grid */}
      <BloodStockRealtimeGrid
        stock={stock}
        title="Real-time Blood Stock Inventory (8 Blood Groups)"
        subtitle="Tracking A+, A-, B+, B-, AB+, AB-, O+, O- with automatic critical & low stock thresholds."
      />

      {/* Batches Table Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Current Blood Stock Reserves</h2>
          <Link
            to="/blood-bank/inventory"
            className="text-xs font-semibold text-[#C62828] hover:underline"
          >
            Full Batch View →
          </Link>
        </div>

        <Card className="overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Batch ID</th>
                <th className="py-3 px-6">Blood Group</th>
                <th className="py-3 px-6">Component</th>
                <th className="py-3 px-6">Available</th>
                <th className="py-3 px-6">Reserved</th>
                <th className="py-3 px-6">Expiry</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stock.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {batch.batch_number}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded font-black bg-red-100 text-[#C62828]">
                      {batch.blood_group}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800">
                    {batch.blood_component}
                  </td>
                  <td className="py-4 px-6">
                    <strong className="text-sm font-black text-slate-900">
                      {batch.units_available}
                    </strong>{' '}
                    units
                  </td>
                  <td className="py-4 px-6 text-slate-500">{batch.units_reserved} units</td>
                  <td className="py-4 px-6 text-slate-600">{batch.expiry_date}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
