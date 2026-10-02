import React from 'react';
import { Shield, Award, Heart, CheckCircle2, AlertTriangle, Users, FileCheck } from 'lucide-react';
import { Card } from '../components/common/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200">
          Our Mission & Safety Principles
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Transforming Emergency Blood Coordination Through Technology & Trust
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          BloodLink was built to solve the fragmentation, delays, and clinical uncertainties inherent in traditional blood donation calls. We empower healthcare professionals and voluntary donors with verifiable, synchronized digital tools.
        </p>
      </div>

      {/* Safety & Compliance Advisory */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-900 leading-relaxed">
          <h3 className="font-bold text-sm text-amber-950">Clinical & Regulatory Notice</h3>
          <p>
            BloodLink is not an automated medical diagnostic tool and does not replace the critical clinical judgment of licensed transfusion specialists, hematologists, or certified laboratory technicians. Every blood collection event must be preceded by certified on-site hemoglobin testing, infectious disease screening, blood typing, and compatibility crossmatching under applicable national blood safety standards.
          </p>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-red-100 text-[#C62828] flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Verified Organizations Only</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Only state-licensed hospitals and accredited blood bank facilities with verified license IDs can broadcast emergency alerts, confirm stock reserves, or manage clinical donor lists.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-navy-100 text-[#17233C] flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Privacy by Design</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Donor locations are never disclosed as exact residential addresses. Calculations use approximate radius centroids, and contact phone numbers are shared solely with authorized triage staff upon invitation acceptance.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Transparent & Explainable AI</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We avoid black-box algorithmic prioritization. Every candidate ranking includes itemized points for blood group compatibility, proximity, donation interval eligibility, and past reliability.
          </p>
        </Card>
      </div>

      {/* Blood Component Education Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Understanding Blood Components</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Blood is rarely transfused as whole blood today. Modern hospitals separate whole donations into specific therapeutic components, each with unique shelf lives, compatibility rules, and clinical indications:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-red-700 uppercase">Red Blood Cells (RBC)</span>
            <p className="text-[11px] text-slate-500 mt-1">Shelf Life: 35–42 days (refrigerated)</p>
            <p className="text-xs text-slate-600 mt-2">
              Vital for acute trauma, severe anemia, and surgical blood loss. Universal donor: O-.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-amber-700 uppercase">Platelets</span>
            <p className="text-[11px] text-slate-500 mt-1">Shelf Life: 5–7 days (room temp agitation)</p>
            <p className="text-xs text-slate-600 mt-2">
              Critical for cancer patients undergoing chemotherapy, organ transplants, and bleeding disorders.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-blue-700 uppercase">Plasma (FFP)</span>
            <p className="text-[11px] text-slate-500 mt-1">Shelf Life: 1 year (frozen at -18°C)</p>
            <p className="text-xs text-slate-600 mt-2">
              Essential for burn patients, shock, and clotting factor replacement. Universal donor: AB.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-purple-700 uppercase">Cryoprecipitate</span>
            <p className="text-[11px] text-slate-500 mt-1">Shelf Life: 1 year (frozen)</p>
            <p className="text-xs text-slate-600 mt-2">
              Concentrated fibrinogen and Factor VIII used for massive hemorrhages and hemophilia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
