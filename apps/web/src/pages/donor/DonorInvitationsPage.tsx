import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Building2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { appStorage } from '../../lib/storage';
import { dataService, subscribeToDataChanges } from '../../lib/dataService';
import { DonorMatch, BloodRequest } from '../../types';

export const DonorInvitationsPage: React.FC = () => {
  const { user, donorProfile } = useAuth();
  const { dispatchNotification } = useNotifications();

  const [matches, setMatches] = useState<DonorMatch[]>(() => {
    return dataService.getMatches();
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const unsub = subscribeToDataChanges(() => {
      setMatches(dataService.getMatches());
    });
    return unsub;
  }, []);

  const requests = dataService.getRequests();

  const handleRespond = async (matchId: string, response: 'accepted' | 'declined') => {
    await dataService.respondToMatch(
      matchId,
      response,
      donorProfile?.donor_name || user?.full_name || 'Marcus Chen'
    );

    if (response === 'accepted') {
      setStatusMessage('Thank you! You accepted the request. Hospital triage has been notified with your confirmation.');
    } else {
      setStatusMessage('Invitation declined. Thank you for the quick response.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Emergency Outreach Invitations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Urgent donation calls matched against your blood group, interval eligibility, and consented travel radius.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Invitations List */}
      <div className="space-y-4">
        {matches.map((match) => {
          const req = requests.find((r) => r.id === match.request_id);
          const isPending = match.outreach_status === 'sent';

          return (
            <Card
              key={match.id}
              className={`p-6 space-y-4 border ${
                isPending ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-black bg-red-100 text-[#C62828]">
                    {req?.blood_group || match.donor_blood_group}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {req?.hospital_name || 'City Central Trauma Hospital'}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Ref: {req?.request_code || 'REQ-EMERGENCY'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {req?.urgency && <Badge urgency={req.urgency}>{req.urgency}</Badge>}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      match.outreach_status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : match.outreach_status === 'declined'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                  >
                    {match.outreach_status}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>Distance: ~{match.distance_km || 2.3} km away</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>Component: {req?.blood_component || 'Red Blood Cells'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Needed: Within 6 hours</span>
                </div>
              </div>

              {/* Explainable Match Score Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    AI Match Score: {match.match_score}%
                  </span>
                  <span className="text-[11px] text-slate-400">Explainable Algorithm Breakdown</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
                  {match.match_reasons.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <div>
                        <strong className="text-slate-800">{r.factor}:</strong> {r.details}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {isPending ? (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRespond(match.id, 'declined')}
                    leftIcon={<X className="h-4 w-4 text-slate-500" />}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-xs"
                    onClick={() => handleRespond(match.id, 'accepted')}
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Accept & Donate
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic text-right pt-1">
                  Responded on {new Date(match.responded_at || match.created_at).toLocaleDateString()}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
