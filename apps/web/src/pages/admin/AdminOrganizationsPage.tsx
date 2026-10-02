import React, { useState } from 'react';
import { ShieldCheck, Check, X, AlertTriangle, Building2, MapPin, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { appStorage } from '../../lib/storage';
import { Organization, VerificationStatus } from '../../types';

export const AdminOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    return appStorage.getOrganizations();
  });

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [reviewAction, setReviewAction] = useState<'verified' | 'rejected' | 'suspended'>('verified');
  const [reviewReason, setReviewReason] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const handleOpenReview = (org: Organization, action: 'verified' | 'rejected' | 'suspended') => {
    setSelectedOrg(org);
    setReviewAction(action);
    setReviewReason(
      action === 'verified'
        ? 'State medical license verified via state board registry'
        : 'License credentials unconfirmed or expired'
    );
    setModalOpen(true);
  };

  const handleCommitReview = () => {
    if (!selectedOrg) return;

    const updated = organizations.map((o) =>
      o.id === selectedOrg.id
        ? {
            ...o,
            verification_status: reviewAction,
            verified_at: reviewAction === 'verified' ? new Date().toISOString() : undefined,
            rejection_reason: reviewAction !== 'verified' ? reviewReason : undefined,
            is_public_directory: reviewAction === 'verified',
          }
        : o
    );

    appStorage.setOrganizations(updated);
    setOrganizations(updated);

    // Record audit log
    const logs = appStorage.getAuditLogs();
    logs.unshift({
      id: `audit-${Date.now()}`,
      actor_name: 'Dr. Sarah Mitchell (Platform Admin)',
      action: `ORGANIZATION_${reviewAction.toUpperCase()}`,
      resource_type: 'organization',
      resource_id: selectedOrg.id,
      details: {
        organization_name: selectedOrg.name,
        license_number: selectedOrg.license_number,
        reason: reviewReason,
      },
      created_at: new Date().toISOString(),
    });
    appStorage.setAuditLogs(logs);

    setModalOpen(false);
    setBannerMsg(`Organization "${selectedOrg.name}" marked as ${reviewAction.toUpperCase()}.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-extrabold text-slate-900">
          Organization Verification & Accreditation Desk
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review state licenses and facility accreditations. Verified facilities gain authority to broadcast emergency blood calls.
        </p>
      </div>

      {bannerMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {bannerMsg}
          </span>
          <button onClick={() => setBannerMsg(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Organizations List */}
      <div className="space-y-4">
        {organizations.map((org) => {
          const isPending = org.verification_status === 'pending';
          const isBB = org.type === 'blood_bank';

          return (
            <Card key={org.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isBB ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isBB ? 'BB' : 'HOSP'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{org.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      State Medical License: <strong>{org.license_number}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge verification={org.verification_status}>{org.verification_status}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>
                    {org.address}, {org.city}, {org.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{org.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{org.email}</span>
                </div>
              </div>

              {org.rejection_reason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
                  <strong>Notice:</strong> {org.rejection_reason}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {isPending ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReview(org, 'rejected')}
                      leftIcon={<X className="h-4 w-4 text-red-500" />}
                    >
                      Reject Application
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleOpenReview(org, 'verified')}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      Approve & Verify
                    </Button>
                  </>
                ) : org.verification_status === 'verified' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReview(org, 'suspended')}
                    className="text-xs text-amber-700 hover:bg-amber-50"
                  >
                    Suspend Facility
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReview(org, 'verified')}
                    className="text-xs text-emerald-700 hover:bg-emerald-50"
                  >
                    Re-verify
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Review Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Confirm ${reviewAction.toUpperCase()} Action`}
        subtitle={`Organization: ${selectedOrg?.name}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please log a mandatory audit explanation for updating this healthcare organization's verification status.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Reason / Findings *
            </label>
            <textarea
              rows={3}
              value={reviewReason}
              onChange={(e) => setReviewReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCommitReview}>
              Save Audit Verdict
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
