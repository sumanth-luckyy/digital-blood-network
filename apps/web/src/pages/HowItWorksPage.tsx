import React, { useState } from 'react';
import { CheckCircle2, Shield, Brain, Heart, Clock, ArrowRight, Activity, MapPin } from 'lucide-react';
import { Card } from '../components/common/Card';
import { BloodGroup } from '../types';
import { RBC_COMPATIBILITY_MAP, PLASMA_COMPATIBILITY_MAP } from '../lib/clinicalCompatibility';

export const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donor' | 'patient' | 'hospital'>('donor');
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');

  const groups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const rbcReceivers = RBC_COMPATIBILITY_MAP[selectedGroup] || [];
  const plasmaReceivers = PLASMA_COMPATIBILITY_MAP[selectedGroup] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          How BloodLink Connects Lifesavers
        </h1>
        <p className="text-sm text-slate-600">
          An end-to-end coordinated emergency workflow with safety protocols, explainable AI donor matching, and live hospital stock verification.
        </p>
      </div>

      {/* Role Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('donor')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'donor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For Donors
          </button>
          <button
            onClick={() => setActiveTab('patient')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'patient'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For Patients & Families
          </button>
          <button
            onClick={() => setActiveTab('hospital')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'hospital'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            For Hospitals & Blood Banks
          </button>
        </div>
      </div>

      {/* Role Specific Step Walkthrough */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        {activeTab === 'donor' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Donor Journey: Empowered, Consented & Safe</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-red-100 text-[#C62828] font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Register & Consent</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Provide your blood group, city/area, and consented notification radius (e.g. 15–25 km). Toggle your availability on or off at any time.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-red-100 text-[#C62828] font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Receive Emergency Invites</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When a verified hospital in your radius enters a critical shortage for your blood group, you receive an in-app invite with match reasons and estimated travel distance.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-red-100 text-[#C62828] font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Accept & Screen On-Site</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accept the invitation to notify the hospital staff. Arrive at the authorized collection suite for mandatory hemoglobin checks and medical screening.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patient' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Patient & Requester: Swift Clinical Coordination</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-navy-100 text-[#17233C] font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Submit Request</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Specify units needed, component (RBC, Platelets, Whole Blood), hospital name, attending physician, and needed-by deadline.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-navy-100 text-[#17233C] font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Hospital Verification</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Staff verify the requisition order against hospital records. This prevents duplicate alerts and protects donors from unverified claims.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-navy-100 text-[#17233C] font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Real-Time Progress</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Follow along as suitable donors accept outreach and inventory batches are reserved. Private donor personal info is protected.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hospital' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Healthcare Facilities: Synchronized Emergency Care</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Triage & Batch Outreach</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Triage requests, view candidate rankings, and notify compatible donors in managed batches with one click.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Atomic Stock Reservations</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Reserve units from on-hand batches with PostgreSQL row locks to guarantee zero double-allocations during mass casualty surges.
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Predictive Forecasting</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Run daily AI demand models to foresee upcoming stock cliffs before critical thresholds are breached.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Compatibility Inspector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Interactive Clinical Compatibility Guide</h3>
            <p className="text-xs text-slate-500">
              Select a donor blood group to see who can clinically receive Red Blood Cells and Plasma
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedGroup === g
                    ? 'bg-[#C62828] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* RBC Section */}
          <div className="p-5 rounded-xl bg-red-50/60 border border-red-200 space-y-3">
            <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
              Red Blood Cell Transfusion Recipients
            </span>
            <p className="text-xs text-slate-600">
              A donor with <strong className="text-slate-900">{selectedGroup}</strong> can give Red Blood Cells to:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {rbcReceivers.map((r) => (
                <span
                  key={r}
                  className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-[#C62828] font-black text-sm shadow-xs"
                >
                  {r}
                </span>
              ))}
            </div>
            {selectedGroup === 'O-' && (
              <p className="text-[11px] text-red-700 font-semibold pt-2">
                ★ Universal Red Blood Cell Donor: O- can give red cells to all recipient blood groups!
              </p>
            )}
          </div>

          {/* Plasma Section */}
          <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              Fresh Frozen Plasma Recipients (Reverse ABO)
            </span>
            <p className="text-xs text-slate-600">
              A donor with <strong className="text-slate-900">{selectedGroup}</strong> can give Plasma to:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {plasmaReceivers.map((r) => (
                <span
                  key={r}
                  className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 font-black text-sm shadow-xs"
                >
                  {r}
                </span>
              ))}
            </div>
            {(selectedGroup === 'AB+' || selectedGroup === 'AB-') && (
              <p className="text-[11px] text-blue-700 font-semibold pt-2">
                ★ Universal Plasma Donor: AB plasma contains no anti-A or anti-B antibodies and is universal for plasma transfusions!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Explainable AI Scoring Weights */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Brain className="h-4 w-4" /> Explainable AI Scoring Weights
        </div>
        <h3 className="text-xl font-bold">Transparent Multi-Factor Ranking Pipeline</h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Unlike opaque algorithms, BloodLink documents every point awarded to candidate donors. The model strictly filters candidates before scoring:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-2xl font-black text-red-400">40 pts</div>
            <h5 className="font-semibold text-sm mt-1">Clinical Compatibility</h5>
            <p className="text-xs text-slate-400 mt-1">
              Exact blood match (40 pts) or compatible alternative/universal group (35 pts). Incompatible donors are rejected 100%.
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-2xl font-black text-blue-400">30 pts</div>
            <h5 className="font-semibold text-sm mt-1">Geographic Proximity</h5>
            <p className="text-xs text-slate-400 mt-1">
              Scaled using Haversine great-circle distance relative to donor's consented travel threshold.
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-2xl font-black text-amber-400">20 pts</div>
            <h5 className="font-semibold text-sm mt-1">Interval Eligibility</h5>
            <p className="text-xs text-slate-400 mt-1">
              Requires full completion of the safe 56-day (whole blood) or 112-day (RBC) biological recovery window.
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="text-2xl font-black text-emerald-400">10 pts</div>
            <h5 className="font-semibold text-sm mt-1">Reliability & History</h5>
            <p className="text-xs text-slate-400 mt-1">
              Recognizes repeat verified donors with consistent past attendance and zero unexcused no-shows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
