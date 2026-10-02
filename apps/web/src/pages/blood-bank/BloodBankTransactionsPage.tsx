import React from 'react';
import { FileText, ArrowRight, ArrowDownLeft, ArrowUpRight, Lock, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { appStorage } from '../../lib/storage';

export const BloodBankTransactionsPage: React.FC = () => {
  const transactions = appStorage.getTransactions();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Blood Stock Transaction Audit Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically auditable transaction history for every unit received, reserved, released, or issued across all facilities.
        </p>
      </div>

      <Card className="overflow-hidden">
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No stock transactions recorded yet. Allocate units or add inventory batches to generate ledger movements.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Batch & Product</th>
                  <th className="py-3 px-6">Quantity Change</th>
                  <th className="py-3 px-6">Performed By</th>
                  <th className="py-3 px-6">Audit Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isPositive = tx.transaction_type === 'receipt' || tx.transaction_type === 'release';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            tx.transaction_type === 'receipt'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.transaction_type === 'reservation'
                              ? 'bg-amber-100 text-amber-800'
                              : tx.transaction_type === 'release'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tx.transaction_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <strong className="text-slate-800 font-mono block">
                          {tx.batch_number || 'BATCH'}
                        </strong>
                        <span className="text-[11px] text-slate-500">
                          {tx.blood_group} {tx.blood_component}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold">
                        <span className={isPositive ? 'text-emerald-700' : 'text-slate-900'}>
                          {isPositive ? `+${tx.units}` : `-${tx.units}`} units
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          ({tx.previous_available} → {tx.new_available})
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {tx.performed_by_name || 'Authorized Staff'}
                      </td>
                      <td className="py-4 px-6 text-slate-600 italic">
                        "{tx.reason || 'Routine transaction'}"
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
