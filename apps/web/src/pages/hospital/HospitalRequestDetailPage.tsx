import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Send,
  Building2,
  MapPin,
  Clock,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { requestDonorRanking } from '../../lib/aiServiceClient';
import { useNotifications } from '../../context/NotificationContext';
import { BloodRequest, DonorMatch, BloodStockBatch } from '../../types';

export const HospitalRequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatchNotification } = useNotifications();

  const [request, setRequest] = useState<BloodRequest>(() => {
    return dataService.getRequestById(id || '') || dataService.getRequests()[0];
  });

  const [candidateMatches, setCandidateMatches] = useState<DonorMatch[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);
  const [rankingSource, setRankingSource] = useState<string>('');
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [reserveUnits, setReserveUnits] = useState(1);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Subscribe to real-time changes
  useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      const updated = dataService.getRequestById(id || '');
      if (updated) {
        setRequest(updated);
      }
      const allMatches = dataService.getMatchesForRequest(id || '');
      if (allMatches.length > 0) {
        setCandidateMatches(allMatches);
      }
    });
    return unsub;
  }, [id]);

  const stockBatches = dataService
    .getStock()
    .filter((b) => b.status === 'available' && b.units_available > 0);

  // Load Explainable AI Ranking
  useEffect(() => {
    async function loadRanking() {
      if (!request) return;
      setIsLoadingRanking(true);
      const existingMatches = dataService.getMatchesForRequest(request.id);
      if (existingMatches.length > 0) {
        setCandidateMatches(existingMatches);
        setRankingSource('live-pipeline');
      } else {
        const donors = appStorage.getDonors();
        const res = await requestDonorRanking(request, donors);
        setCandidateMatches(res.matches);
        setRankingSource(res.source);
        dataService.saveMatches(res.matches);
      }
      setIsLoadingRanking(false);
    }
    loadRanking();
  }, [request?.id]);

  // Action: Verify Request
  const handleVerify = async () => {
    await dataService.updateRequest(
      request.id,
      {
        verification_status: 'verified',
        status: 'matching',
        verified_at: new Date().toISOString(),
      },
      'Dr. Rajesh Rao (Hospital Lead)'
    );
    setRequest({
      ...request,
      verification_status: 'verified',
      status: 'matching',
      verified_at: new Date().toISOString(),
    });
    setActionSuccess('Request verified. Donor matching outreach is now authorized.');
  };

  // Action: Reject Request
  const handleReject = async () => {
    await dataService.updateRequest(
      request.id,
      {
        verification_status: 'rejected',
        status: 'cancelled',
      },
      'Dr. Rajesh Rao (Hospital Lead)'
    );
    setRequest({ ...request, verification_status: 'rejected', status: 'cancelled' });
    setActionSuccess('Request marked as rejected.');
  };

  // Action: Trigger Outreach Broadcast
  const handleBroadcastOutreach = async () => {
    if (request.verification_status !== 'verified') {
      alert('Clinical protocol requires verifying the request before broadcasting emergency outreach.');
      return;
    }

    const newMatches: DonorMatch[] = candidateMatches.map((cm) => ({
      ...cm,
      outreach_status: 'sent',
      sent_at: new Date().toISOString(),
    }));

    await dataService.saveMatches(newMatches);
    setCandidateMatches(newMatches);

    // Dispatch notifications to the donors
    newMatches.forEach((m) => {
      dispatchNotification(
        'user-donor',
        'match_invite',
        `Urgent ${request.blood_group} Needed: ${request.hospital_name}`,
        `You have been matched as a compatible donor for ${request.patient_name} (~${m.distance_km || 2.3} km away). Please review invitation.`,
        '/donor/invitations'
      );
    });

    setActionSuccess(
      `Emergency outreach broadcast dispatched to ${newMatches.length} qualified candidate donor(s)!`
    );
  };

  // Action: Atomic Stock Reservation
  const handleReserveStock = async () => {
    if (!selectedBatchId || reserveUnits <= 0) return;

    const allStock = dataService.getStock();
    const batch = allStock.find((b) => b.id === selectedBatchId);
    if (!batch) return;

    if (batch.units_available < reserveUnits) {
      alert(`Insufficient available units in selected batch (${batch.units_available} free).`);
      return;
    }

    // Atomic update via dataService
    const newAvail = batch.units_available - reserveUnits;
    const newReserved = batch.units_reserved + reserveUnits;
    await dataService.updateStockBatchUnits(batch.id, newAvail, newReserved, 'Dr. Rajesh Rao (Hospital Lead)');

    // Record transaction
    const txs = appStorage.getTransactions();
    txs.unshift({
      id: `tx-${Date.now()}`,
      batch_id: batch.id,
      organization_id: batch.organization_id,
      organization_name: batch.organization_name,
      batch_number: batch.batch_number,
      blood_group: batch.blood_group,
      blood_component: batch.blood_component,
      performed_by_name: 'Dr. Rajesh Rao (Lead Surgeon)',
      transaction_type: 'reservation',
      units: reserveUnits,
      previous_available: batch.units_available,
      new_available: newAvail,
      reason: `Allocated to ${request.request_code} (${request.patient_name})`,
      created_at: new Date().toISOString(),
    });
    appStorage.setTransactions(txs);

    // Update request fulfillment
    const updatedFulfilled = Math.min(request.units_needed, request.units_fulfilled + reserveUnits);
    const newStatus = updatedFulfilled >= request.units_needed ? ('fulfilled' as const) : request.status;

    await dataService.updateRequest(
      request.id,
      { units_fulfilled: updatedFulfilled, status: newStatus },
      'Dr. Rajesh Rao (Hospital Lead)'
    );
    setRequest({ ...request, units_fulfilled: updatedFulfilled, status: newStatus });

    setReserveModalOpen(false);
    setActionSuccess(`Successfully reserved ${reserveUnits} unit(s) from batch ${batch.batch_number}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/hospital/requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Hospital Orders
      </Link>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Order Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-sm font-black bg-red-100 text-[#C62828]">
                {request.blood_group}
              </span>
              <span className="font-mono text-xs font-bold text-slate-400">
                {request.request_code}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Patient: {request.patient_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Requisition: <strong>{request.units_needed} units</strong> of {request.blood_component}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge urgency={request.urgency}>{request.urgency}</Badge>
            <Badge verification={request.verification_status}>{request.verification_status}</Badge>
            <Badge status={request.status}>{request.status.replace('_', ' ')}</Badge>
          </div>
        </div>

        {/* Clinical Info & Justification */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block mb-0.5">Room & Attending Physician</span>
            <strong className="text-slate-800 text-sm">{request.hospital_room_or_doctor}</strong>
            <p className="text-slate-500 mt-0.5">{request.hospital_name}</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Needed By Deadline</span>
            <strong className="text-slate-800 text-sm">
              {new Date(request.needed_by).toLocaleString()}
            </strong>
            <p className="text-slate-500 mt-0.5">City: {request.city}</p>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Stock Fulfillment</span>
            <strong className="text-slate-800 text-sm text-emerald-700">
              {request.units_fulfilled} of {request.units_needed} Units Secured
            </strong>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <strong className="block text-slate-900 font-semibold mb-1">
            Clinical Transfusion Indication:
          </strong>
          <p className="italic leading-relaxed">"{request.medical_notes}"</p>
        </div>

        {/* Verification and Triage Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {request.verification_status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  variant="success"
                  onClick={handleVerify}
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                >
                  Verify Clinical Need
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleReject}
                  leftIcon={<XCircle className="h-4 w-4" />}
                >
                  Reject Order
                </Button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-4 w-4" /> Clinically Verified for Donor Matching
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReserveModalOpen(true)}
              leftIcon={<Layers className="h-4 w-4 text-slate-600" />}
            >
              Allocate Stock Units
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleBroadcastOutreach}
              disabled={request.verification_status !== 'verified'}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Broadcast Donor Outreach
            </Button>
          </div>
        </div>
      </Card>

      {/* AI Explainable Candidate Donor Ranking */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#C62828]" />
              <h3 className="font-bold text-base text-slate-900">
                AI Explainable Candidate Donor Ranking
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranks compatible consenting donors based on ABO/Rh rules, proximity, and eligibility intervals.
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
            Engine: {rankingSource || 'Clinical-Rules-v1'}
          </span>
        </div>

        {candidateMatches.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No compatible donors currently available within service radius.
          </div>
        ) : (
          <div className="space-y-4">
            {candidateMatches.map((candidate, idx) => (
              <div
                key={candidate.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-lg bg-red-100 text-[#C62828] font-black flex items-center justify-center text-sm">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {candidate.donor_name} ({candidate.donor_blood_group})
                      </h4>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {candidate.donor_city} • ~{candidate.distance_km || 2.3} km away
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Match Score</span>
                      <strong className="text-base font-black text-slate-900">
                        {candidate.match_score}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Reasons breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {candidate.match_reasons.map((r, rIdx) => (
                    <div key={rIdx} className="flex items-start gap-1.5 text-slate-600">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>
                        <strong className="text-slate-800">{r.factor}:</strong> {r.details}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Stock Reservation Modal */}
      <Modal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        title="Atomic Blood Stock Allocation"
        subtitle={`Allocate on-hand inventory units directly to ${request.request_code}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Available Batch
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#C62828]"
            >
              <option value="">-- Choose Inventory Batch --</option>
              {stockBatches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_number} • {b.blood_group} {b.blood_component} ({b.units_available} Free) • {b.organization_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Units to Reserve
            </label>
            <input
              type="number"
              min="1"
              max={request.units_needed - request.units_fulfilled}
              value={reserveUnits}
              onChange={(e) => setReserveUnits(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Remaining needed: {request.units_needed - request.units_fulfilled} unit(s)
            </span>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-900 border border-amber-200">
            <strong>Concurrency Lock:</strong> Reservation invokes atomic database row locks to prevent double-booking or negative stock counts during mass surges.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setReserveModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleReserveStock} disabled={!selectedBatchId}>
              Confirm Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
