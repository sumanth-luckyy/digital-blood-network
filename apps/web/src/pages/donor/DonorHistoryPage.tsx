import React from 'react';
import { Award, Calendar, CheckCircle2, ShieldCheck, Heart, Download, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const DonorHistoryPage: React.FC = () => {
  const { user, donorProfile } = useAuth();

  const mockDonationRecords = [
    {
      id: 'don-01',
      date: '2026-06-15',
      facility: 'City Central Trauma Hospital',
      component: 'Red Blood Cells',
      units: 1,
      screening_status: 'Passed (Hb: 14.2 g/dL, BP: 120/80)',
      certificate_id: 'CERT-2026-MC-8812',
    },
    {
      id: 'don-02',
      date: '2026-03-01',
      facility: 'Metro Health Blood Bank Center',
      component: 'Whole Blood',
      units: 1,
      screening_status: 'Passed (Hb: 14.5 g/dL, BP: 118/76)',
      certificate_id: 'CERT-2026-MC-4109',
    },
    {
      id: 'don-03',
      date: '2025-11-20',
      facility: 'St. Jude Community Hospital',
      component: 'Red Blood Cells',
      units: 1,
      screening_status: 'Passed (Hb: 14.0 g/dL, BP: 122/82)',
      certificate_id: 'CERT-2025-MC-1994',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Donation History & Recognition</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verified log of past lifesaving contributions, medical screening records, and donor certificates.
        </p>
      </div>

      {/* Clinical Advisory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-900 font-semibold block mb-0.5">Clinical Safeguard</strong>
          While your interval eligibility date is calculated based on legal whole blood recovery periods (56 days), full clinical eligibility is determined exclusively on-site via pre-donation screening by qualified medical personnel.
        </p>
      </div>

      {/* Milestones & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <Heart className="h-6 w-6 text-[#C62828] mx-auto mb-1" />
          <div className="text-2xl font-extrabold text-slate-900">{donorProfile?.total_donations || 12}</div>
          <span className="text-xs text-slate-500 font-medium">Verified Donations</span>
        </Card>

        <Card className="p-5 text-center">
          <Award className="h-6 w-6 text-amber-500 mx-auto mb-1" />
          <div className="text-2xl font-extrabold text-slate-900">{donorProfile?.reward_points || 1450}</div>
          <span className="text-xs text-slate-500 font-medium">Reward Credits</span>
        </Card>

        <Card className="p-5 text-center">
          <Calendar className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
          <div className="text-lg font-bold text-emerald-600 mt-1">Eligible Now</div>
          <span className="text-[11px] text-slate-500">Cooldown window passed</span>
        </Card>
      </div>

      {/* Donation History Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Verified Donation Records</h3>
          <span className="text-xs text-slate-400">Total Recorded: {mockDonationRecords.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Facility</th>
                <th className="py-3 px-6">Component</th>
                <th className="py-3 px-6">Screening Status</th>
                <th className="py-3 px-6 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockDonationRecords.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">{item.date}</td>
                  <td className="py-4 px-6 text-slate-700">{item.facility}</td>
                  <td className="py-4 px-6 font-medium text-slate-800">{item.component}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {item.screening_status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => alert(`Certificate ${item.certificate_id} verified by BloodLink Network.`)}
                      className="text-[#C62828] hover:text-[#991b1b] font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <Download className="h-3 w-3" /> Cert
                    </button>
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
