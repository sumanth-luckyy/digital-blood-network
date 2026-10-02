import React from 'react';
import { Layers, AlertTriangle, ShieldCheck, Clock, Radio } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { BloodStockBatch, BloodGroup } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

interface BloodStockRealtimeGridProps {
  stock: BloodStockBatch[];
  title?: string;
  subtitle?: string;
  onSelectGroup?: (group: BloodGroup) => void;
  selectedGroup?: BloodGroup | null;
}

const ALL_BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const BloodStockRealtimeGrid: React.FC<BloodStockRealtimeGridProps> = ({
  stock,
  title = 'Real-time Blood Stock Inventory',
  subtitle = 'Continuous inventory monitoring across all 8 blood groups with automatic low & critical safety alerts.',
  onSelectGroup,
  selectedGroup,
}) => {
  // Aggregate stock by blood group
  const groupStats = ALL_BLOOD_GROUPS.map((group) => {
    const batches = stock.filter((b) => b.blood_group === group && b.status === 'available');
    const totalAvailable = batches.reduce((acc, curr) => acc + curr.units_available, 0);
    const totalReserved = batches.reduce((acc, curr) => acc + curr.units_reserved, 0);

    // Latest update
    let latestUpdate = 'Never';
    if (batches.length > 0) {
      const dates = batches.map((b) => new Date(b.updated_at || b.created_at).getTime());
      const maxDate = new Date(Math.max(...dates));
      const diffMins = Math.floor((Date.now() - maxDate.getTime()) / (1000 * 60));
      if (diffMins < 1) latestUpdate = 'Just now';
      else if (diffMins < 60) latestUpdate = `${diffMins}m ago`;
      else latestUpdate = `${Math.floor(diffMins / 60)}h ago`;
    }

    let status: 'critical' | 'low' | 'adequate' = 'adequate';
    if (totalAvailable <= 2) {
      status = 'critical';
    } else if (totalAvailable <= 5) {
      status = 'low';
    }

    return {
      group,
      totalAvailable,
      totalReserved,
      status,
      batchCount: batches.length,
      latestUpdate,
    };
  });

  const criticalCount = groupStats.filter((g) => g.status === 'critical').length;
  const lowCount = groupStats.filter((g) => g.status === 'low').length;
  const totalUnits = groupStats.reduce((acc, curr) => acc + curr.totalAvailable, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Radio className="h-2.5 w-2.5 text-emerald-500 animate-pulse" />
              <span>{isSupabaseConfigured ? 'Supabase Realtime Live' : 'Active Local Stream'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Status badges summary */}
        <div className="flex items-center gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="px-2 py-1 rounded-lg font-bold bg-red-100 text-red-800 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{criticalCount} Critical (≤2 units)</span>
            </span>
          )}
          {lowCount > 0 && (
            <span className="px-2 py-1 rounded-lg font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
              <span>{lowCount} Low (≤5 units)</span>
            </span>
          )}
          <span className="px-2 py-1 rounded-lg font-bold bg-slate-100 text-slate-700">
            Total {totalUnits} Units
          </span>
        </div>
      </div>

      {/* 8-Blood-Group Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {groupStats.map((item) => {
          const isSelected = selectedGroup === item.group;
          return (
            <div
              key={item.group}
              onClick={() => onSelectGroup && onSelectGroup(item.group)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-[#C62828] bg-red-50/60 shadow-md ring-2 ring-red-400'
                  : item.status === 'critical'
                  ? 'border-red-300 bg-red-50/40 hover:bg-red-50 hover:border-red-400'
                  : item.status === 'low'
                  ? 'border-amber-200 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Header: Group Name and Status Dot */}
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-900">{item.group}</span>
                <span
                  className={`h-2 w-2 rounded-full ${
                    item.status === 'critical'
                      ? 'bg-red-500 animate-ping'
                      : item.status === 'low'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              {/* Units count */}
              <div className="mt-2">
                <div className="text-xl font-black text-slate-900 tracking-tight">
                  {item.totalAvailable}
                  <span className="text-[10px] font-semibold text-slate-500 ml-1">units</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {item.totalReserved > 0 ? `${item.totalReserved} reserved` : '0 reserved'}
                </div>
              </div>

              {/* Status pill & update time */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-0.5">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    item.status === 'critical'
                      ? 'text-red-700'
                      : item.status === 'low'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {item.status === 'critical'
                    ? 'Critical'
                    : item.status === 'low'
                    ? 'Low Reserve'
                    : 'Adequate'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">{item.latestUpdate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
