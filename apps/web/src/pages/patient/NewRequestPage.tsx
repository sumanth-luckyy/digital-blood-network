import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, PlusCircle, Building2, Calendar, Droplet, User, Phone } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { appStorage } from '../../lib/storage';
import { dataService } from '../../lib/dataService';
import { BloodGroup, BloodComponent, UrgencyLevel, BloodRequest } from '../../types';

const requestSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  bloodComponent: z.enum([
    'Whole Blood',
    'Red Blood Cells',
    'Platelets',
    'Fresh Frozen Plasma',
    'Cryoprecipitate',
  ]),
  unitsNeeded: z.coerce.number().min(1, 'Units must be at least 1').max(20, 'Max 20 units per request'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  neededBy: z.string().min(1, 'Required deadline is required'),
  hospitalId: z.string().min(1, 'Hospital must be selected'),
  city: z.string().min(2, 'City is required'),
  area: z.string().optional(),
  hospitalRoomOrDoctor: z.string().min(2, 'Room or attending doctor is required'),
  contactPhone: z.string().min(6, 'Contact phone is required'),
  medicalNotes: z.string().min(5, 'Clinical notes or surgical indication required'),
});

type RequestFormData = z.infer<typeof requestSchema>;

export const NewRequestPage: React.FC = () => {
  const { user } = useAuth();
  const { dispatchNotification } = useNotifications();
  const navigate = useNavigate();

  const organizations = appStorage
    .getOrganizations()
    .filter((o) => o.type === 'hospital' && o.verification_status === 'verified');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      bloodGroup: 'O+',
      bloodComponent: 'Whole Blood',
      unitsNeeded: 2,
      urgency: 'high',
      hospitalId: organizations[0]?.id || 'org-hosp-1',
      city: 'New York',
      neededBy: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
      contactPhone: user?.phone || '+1-555-0104',
    },
  });

  const onSubmit = async (data: RequestFormData) => {
    const selectedOrg = organizations.find((o) => o.id === data.hospitalId);
    const newId = `req-${Date.now()}`;
    const newCode = `REQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: BloodRequest = {
      id: newId,
      request_code: newCode,
      requester_id: user?.id || 'user-patient',
      patient_name: data.patientName,
      hospital_id: data.hospitalId,
      hospital_name: selectedOrg?.name || 'City Central Trauma Hospital',
      blood_group: data.bloodGroup,
      blood_component: data.bloodComponent,
      units_needed: data.unitsNeeded,
      units_fulfilled: 0,
      urgency: data.urgency,
      needed_by: data.neededBy,
      city: data.city,
      area: data.area || 'Manhattan',
      hospital_room_or_doctor: data.hospitalRoomOrDoctor,
      contact_phone: data.contactPhone,
      medical_notes: data.medicalNotes,
      verification_status: 'pending',
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await dataService.createBloodRequest(newRequest, user?.full_name || 'Emergency Requester');

    // Dispatch notification to hospital staff
    dispatchNotification(
      'user-hospital',
      'emergency_request',
      `New Blood Request: ${newCode}`,
      `A new request for ${data.unitsNeeded} units of ${data.bloodGroup} (${data.bloodComponent}) is pending clinical verification.`,
      `/hospital/requests/${created.id}`
    );

    navigate(`/patient/requests/${created.id}`);
  };

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const components: BloodComponent[] = [
    'Whole Blood',
    'Red Blood Cells',
    'Platelets',
    'Fresh Frozen Plasma',
    'Cryoprecipitate',
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create Emergency Blood Request</h1>
        <p className="text-xs text-slate-500 mt-1">
          Requisition blood products for inpatient trauma, surgery, oncological support, or emergency exchange.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Medical Verification Notice:</strong> The requested hospital's transfusion department will verify medical records before donor outreach broadcasts are initiated.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Patient Identification & Product Required
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  {...register('patientName')}
                  placeholder="e.g. Aarav Patel"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.patientName && (
                  <p className="text-xs text-red-600 mt-1">{errors.patientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Blood Group *
                </label>
                <select
                  {...register('bloodGroup')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                >
                  {bloodGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Component *
                </label>
                <select
                  {...register('bloodComponent')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                >
                  {components.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Units Needed *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  {...register('unitsNeeded')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.unitsNeeded && (
                  <p className="text-xs text-red-600 mt-1">{errors.unitsNeeded.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgency Level *
                </label>
                <select
                  {...register('urgency')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                >
                  <option value="critical">Critical (Under 6 hours)</option>
                  <option value="high">High (Under 24 hours)</option>
                  <option value="medium">Medium (24 - 48 hours)</option>
                  <option value="low">Low (Elective / Scheduled)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hospital & Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Hospital Admission & Facility Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admitting Verified Hospital *
                </label>
                <select
                  {...register('hospitalId')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Needed-By Deadline *
                </label>
                <input
                  type="datetime-local"
                  {...register('neededBy')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.neededBy && (
                  <p className="text-xs text-red-600 mt-1">{errors.neededBy.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ward / Room / Doctor *
                </label>
                <input
                  type="text"
                  {...register('hospitalRoomOrDoctor')}
                  placeholder="e.g. ICU Bed 4 / Dr. Rao"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.hospitalRoomOrDoctor && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.hospitalRoomOrDoctor.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  {...register('city')}
                  placeholder="New York"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  {...register('contactPhone')}
                  placeholder="+1-555-0104"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Diagnosis & Transfusion Justification *
              </label>
              <textarea
                rows={3}
                {...register('medicalNotes')}
                placeholder="Describe clinical situation (e.g. Acute internal hemorrhage post-surgery, target hemoglobin 9.0 g/dL)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
              ></textarea>
              {errors.medicalNotes && (
                <p className="text-xs text-red-600 mt-1">{errors.medicalNotes.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patient/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="font-semibold shadow-xs">
              Submit Request for Verification
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
