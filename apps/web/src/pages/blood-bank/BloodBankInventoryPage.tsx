import React, { useState, useEffect } from 'react';
import { Plus, Building2, AlertTriangle, Layers, Calendar, Clock, ShieldCheck, CheckCircle2, Edit2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { BloodStockRealtimeGrid } from '../../components/common/BloodStockRealtimeGrid';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { BloodStockBatch, BloodGroup, BloodComponent, StockBatchStatus } from '../../types';

export const BloodBankInventoryPage: React.FC = () => {
  const [stock, setStock] = useState<BloodStockBatch[]>(() => {
    return dataService.getStock();
  });

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<BloodStockBatch | null>(null);

  useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setStock(dataService.getStock());
    });
    return unsub;
  }, []);

  // Form states for new batch
  const [batchNumber, setBatchNumber] = useState(`METRO-${Date.now().toString().slice(-4)}`);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [component, setComponent] = useState<BloodComponent>('Whole Blood');
  const [units, setUnits] = useState(10);
  const [storageLocation, setStorageLocation] = useState('Chamber B-02');
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 35);
    return d.toISOString().split('T')[0];
  });

  // Form state for adjustment
  const [newStatus, setNewStatus] = useState<StockBatchStatus>('available');
  const [adjustReason, setAdjustReason] = useState('Routine clinical quality verification');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: BloodComponent[] = [
    'Whole Blood',
    'Red Blood Cells',
    'Platelets',
    'Fresh Frozen Plasma',
    'Cryoprecipitate',
  ];

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const newBatch: BloodStockBatch = {
      id: `batch-${Date.now()}`,
      organization_id: 'org-bb-1',
      organization_name: 'Metro Health Blood Bank Center',
      batch_number: batchNumber,
      blood_group: bloodGroup,
      blood_component: component,
      units_available: units,
      units_reserved: 0,
      collected_date: new Date().toISOString().split('T')[0],
      expiry_date: expiryDate,
      status: 'available',
      storage_location: storageLocation,
      is_sample_data: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await dataService.addStockBatch(newBatch, 'Elena Rostova (Director)');

    // Record transaction
    const txs = appStorage.getTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      batch_id: newBatch.id,
      organization_id: newBatch.organization_id,
      organization_name: newBatch.organization_name,
      batch_number: newBatch.batch_number,
      blood_group: newBatch.blood_group,
      blood_component: newBatch.blood_component,
      performed_by_name: 'Elena Rostova (Director)',
      transaction_type: 'receipt',
      units: units,
      previous_available: 0,
      new_available: units,
      reason: 'Intake accession from mobile donation camp',
      created_at: new Date().toISOString(),
    });
    appStorage.setTransactions(txs);

    setAddModalOpen(false);
    setSuccessMsg(`Successfully registered batch ${batchNumber} (${units} units).`);
  };

  const handleAdjustStatus = () => {
    if (!selectedBatch) return;

    const all = stock.map((b) =>
      b.id === selectedBatch.id
        ? { ...b, status: newStatus, updated_at: new Date().toISOString() }
        : b
    );
    appStorage.setStock(all);
    setStock(all);

    const txs = appStorage.getTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      batch_id: selectedBatch.id,
      organization_id: selectedBatch.organization_id,
      organization_name: selectedBatch.organization_name,
      batch_number: selectedBatch.batch_number,
      blood_group: selectedBatch.blood_group,
      blood_component: selectedBatch.blood_component,
      performed_by_name: 'Elena Rostova (Director)',
      transaction_type: 'adjustment',
      units: selectedBatch.units_available,
      previous_available: selectedBatch.units_available,
      new_available: newStatus === 'discarded' || newStatus === 'quarantined' ? 0 : selectedBatch.units_available,
      reason: adjustReason,
      created_at: new Date().toISOString(),
    });
    appStorage.setTransactions(txs);

    setAdjustModalOpen(false);
    setSuccessMsg(`Batch ${selectedBatch.batch_number} status updated to ${newStatus}.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Blood Bank Inventory & Batch Control
            </h1>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
              Sample Demo Batches Labeled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accession, separate, quarantine, and issue blood components with transaction-safe audit protection.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-semibold shadow-xs"
        >
          Accession New Batch
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {successMsg}
          </span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Realtime 8-Blood-Group Inventory Grid */}
      <BloodStockRealtimeGrid
        stock={stock}
        title="Real-time Inventory by Blood Group (Click to Filter)"
        subtitle="Live tracking of available and reserved units across all 8 blood groups with automatic threshold alerts."
        selectedGroup={selectedGroup}
        onSelectGroup={(g) => setSelectedGroup(selectedGroup === g ? null : g)}
      />

      {/* Batches Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing{' '}
            <strong className="text-slate-800">
              {selectedGroup ? stock.filter((b) => b.blood_group === selectedGroup).length : stock.length}
            </strong>{' '}
            batch(es) {selectedGroup ? `for blood group ${selectedGroup}` : 'across all groups'}
          </span>
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-[#C62828] font-bold hover:underline"
            >
              Reset Blood Group Filter
            </button>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Batch ID</th>
                  <th className="py-3 px-6">Facility</th>
                  <th className="py-3 px-6">Group & Component</th>
                  <th className="py-3 px-6">Available</th>
                  <th className="py-3 px-6">Reserved</th>
                  <th className="py-3 px-6">Collected / Expiry</th>
                  <th className="py-3 px-6">Storage Unit</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedGroup ? stock.filter((b) => b.blood_group === selectedGroup) : stock).map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">
                    {batch.batch_number}
                  </td>
                  <td className="py-4 px-6 text-slate-700 font-medium">
                    {batch.organization_name || 'Metro Health Blood Bank'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 rounded font-black bg-red-100 text-[#C62828] mr-1.5">
                      {batch.blood_group}
                    </span>
                    <strong className="text-slate-800">{batch.blood_component}</strong>
                  </td>
                  <td className="py-4 px-6">
                    <strong className="text-sm font-black text-slate-900">
                      {batch.units_available}
                    </strong>{' '}
                    units
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {batch.units_reserved} units
                  </td>
                  <td className="py-4 px-6 text-slate-500">
                    <span className="block text-slate-700 font-medium">
                      Exp: {batch.expiry_date}
                    </span>
                    <span className="text-[11px] text-slate-400">Coll: {batch.collected_date}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-[11px]">
                    {batch.storage_location || 'Main Cold Bay'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1"
                      onClick={() => {
                        setSelectedBatch(batch);
                        setNewStatus(batch.status);
                        setAdjustModalOpen(true);
                      }}
                      leftIcon={<Edit2 className="h-3 w-3 text-slate-500" />}
                    >
                      Status
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>

      {/* Modal: Add New Batch */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Accession New Blood Batch"
        subtitle="Record tested and labeled component units into inventory"
      >
        <form onSubmit={handleAddBatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-bold text-slate-900"
              >
                {bloodGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Component</label>
              <select
                value={component}
                onChange={(e) => setComponent(e.target.value as BloodComponent)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              >
                {components.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Units (Bags)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Unit</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold">
              Save Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Adjust Status */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust Batch Status"
        subtitle={`Update status for ${selectedBatch?.batch_number}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as StockBatchStatus)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-semibold text-slate-900"
            >
              <option value="available">Available</option>
              <option value="quarantined">Quarantined (Pending Quality Audit)</option>
              <option value="expired">Expired</option>
              <option value="discarded">Discarded (Contaminated / Broken Seal)</option>
              <option value="issued">Issued / Transfused</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical Justification / Audit Reason
            </label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Temperature variation spike during storage"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAdjustStatus}>
              Commit Status Change
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
