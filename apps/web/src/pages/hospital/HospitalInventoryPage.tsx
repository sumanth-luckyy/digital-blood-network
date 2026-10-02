import React, { useState } from 'react';
import { Plus, Building2, AlertTriangle, Layers, Calendar, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { BloodStockRealtimeGrid } from '../../components/common/BloodStockRealtimeGrid';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { BloodStockBatch, BloodGroup, BloodComponent } from '../../types';

export const HospitalInventoryPage: React.FC = () => {
  const [stock, setStock] = useState<BloodStockBatch[]>(() => {
    return dataService.getStock().filter((s) => s.organization_id === 'org-hosp-1' || s.organization_name?.includes('Hospital'));
  });

  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [batchNumber, setBatchNumber] = useState(`HOSP-${Date.now().toString().slice(-4)}`);
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [component, setComponent] = useState<BloodComponent>('Red Blood Cells');
  const [units, setUnits] = useState(4);
  const [storageLocation, setStorageLocation] = useState('Emergency Trauma Bay 2');
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setStock(
        dataService.getStock().filter((s) => s.organization_id === 'org-hosp-1' || s.organization_name?.includes('Hospital'))
      );
    });
    return unsub;
  }, []);

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
      organization_id: 'org-hosp-1',
      organization_name: 'City Central Trauma Hospital',
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

    await dataService.addStockBatch(newBatch, 'Dr. Rajesh Rao (Lead Surgeon)');

    // Record stock receipt transaction
    const txs = appStorage.getTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      batch_id: newBatch.id,
      organization_id: newBatch.organization_id,
      organization_name: newBatch.organization_name,
      batch_number: newBatch.batch_number,
      blood_group: newBatch.blood_group,
      blood_component: newBatch.blood_component,
      performed_by_name: 'Dr. Rajesh Rao (Lead Surgeon)',
      transaction_type: 'receipt',
      units: units,
      previous_available: 0,
      new_available: units,
      reason: 'Hospital emergency blood intake',
      created_at: new Date().toISOString(),
    });
    appStorage.setTransactions(txs);

    setAddModalOpen(false);
    setSuccessMsg(`Batch ${batchNumber} (${units} units) recorded into hospital inventory.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Hospital Emergency Blood Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time batch-level inventory tracking, reserved quantities, and cold chain locations.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setAddModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          className="font-semibold shadow-xs"
        >
          Add Emergency Batch
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
        title="Emergency Hospital Blood Bank Reserves (8 Blood Groups)"
        subtitle="Tracking critical emergency on-site stocks for surgery and trauma triage."
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
            emergency batch(es) {selectedGroup ? `for ${selectedGroup}` : 'across all blood groups'}
          </span>
          {selectedGroup && (
            <button
              onClick={() => setSelectedGroup(null)}
              className="text-[#C62828] font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Batch ID</th>
                  <th className="py-3 px-6">Blood Product</th>
                  <th className="py-3 px-6">Available Units</th>
                  <th className="py-3 px-6">Reserved</th>
                  <th className="py-3 px-6">Storage Unit</th>
                  <th className="py-3 px-6">Expiry Date</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(selectedGroup ? stock.filter((b) => b.blood_group === selectedGroup) : stock).map((batch) => {
                const isLow = batch.units_available <= 2;
                return (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {batch.batch_number}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded font-black bg-red-100 text-[#C62828] mr-2">
                        {batch.blood_group}
                      </span>
                      <strong className="text-slate-800">{batch.blood_component}</strong>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-sm font-black ${
                          isLow ? 'text-red-600 animate-pulse' : 'text-slate-900'
                        }`}
                      >
                        {batch.units_available} units
                      </span>
                      {isLow && (
                        <span className="block text-[10px] text-red-600 font-semibold">Low Reserve</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {batch.units_reserved} units
                    </td>
                    <td className="py-4 px-6 text-slate-600">{batch.storage_location}</td>
                    <td className="py-4 px-6 text-slate-600">{batch.expiry_date}</td>
                    <td className="py-4 px-6 text-right">
                      <Badge variant="status" status="open">
                        {batch.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      </div>

      {/* Modal: Add Batch */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Register Hospital Stock Batch"
        subtitle="Log received whole blood or separated components"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration Date</label>
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
    </div>
  );
};
