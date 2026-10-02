import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Droplet, Heart, User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { appStorage } from '../../lib/storage';
import { BloodGroup, UserRole } from '../../types';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['donor', 'patient', 'hospital_staff', 'blood_bank_staff', 'admin']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  city: z.string().min(2, 'City is required'),
  orgName: z.string().optional(),
  licenseNumber: z.string().optional(),
  contactPhone: z.string().optional(),
  consentAlerts: z.boolean(),
  consentLocation: z.boolean(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('donor');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'donor',
      bloodGroup: 'O+',
      city: 'New York',
      orgName: '',
      licenseNumber: '',
      contactPhone: '',
      consentAlerts: true,
      consentLocation: true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const safeRole: UserRole = data.role as UserRole;
    await authRegister(data.fullName, data.email, safeRole, data.bloodGroup, data.password);

    // Save organization details if hospital or blood bank
    if ((safeRole === 'hospital_staff' || safeRole === 'blood_bank_staff') && data.orgName) {
      const orgs = appStorage.getOrganizations();
      orgs.push({
        id: `org-${Date.now()}`,
        name: data.orgName,
        type: safeRole === 'hospital_staff' ? 'hospital' : 'blood_bank',
        license_number: data.licenseNumber || 'PENDING-VERIFY-001',
        address: `${data.city} Medical District`,
        city: data.city,
        state: 'NY',
        latitude: 40.7128,
        longitude: -74.006,
        phone: data.contactPhone || '+1-555-0199',
        email: data.email,
        verification_status: 'verified',
        is_public_directory: true,
      });
      appStorage.setOrganizations(orgs);
    }

    if (safeRole === 'donor') navigate('/donor/dashboard');
    else if (safeRole === 'patient') navigate('/patient/dashboard');
    else if (safeRole === 'hospital_staff') navigate('/hospital/dashboard');
    else if (safeRole === 'blood_bank_staff') navigate('/blood-bank/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role as any);
  };

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#C62828] to-[#991b1b] flex items-center justify-center text-white mx-auto shadow-md shadow-red-200">
            <Droplet className="h-6 w-6 fill-current" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Your BloodLink Account</h2>
          <p className="text-xs text-slate-500">
            Join the verified emergency network as a voluntary donor, patient, or medical coordinator.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('donor')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'donor'
                      ? 'border-[#C62828] bg-red-50 text-[#C62828]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>Donor</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('patient')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'patient'
                      ? 'border-[#C62828] bg-red-50 text-[#C62828]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Requester</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('hospital_staff')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'hospital_staff'
                      ? 'border-[#C62828] bg-red-50 text-[#C62828]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('blood_bank_staff')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'blood_bank_staff'
                      ? 'border-[#C62828] bg-red-50 text-[#C62828]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Blood Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    selectedRole === 'admin'
                      ? 'border-[#17233C] bg-slate-900 text-amber-400'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Common Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="Alex Morgan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="alex@domain.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Location *
                </label>
                <input
                  type="text"
                  {...register('city')}
                  placeholder="New York"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                />
                {errors.city && (
                  <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>
                )}
              </div>
            </div>

            {/* Role-specific profile completion fields */}
            {selectedRole === 'donor' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Group *
                </label>
                <select
                  {...register('bloodGroup')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                >
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} {bg === 'O-' ? '(Universal RBC Donor)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedRole === 'hospital_staff' || selectedRole === 'blood_bank_staff') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {selectedRole === 'hospital_staff' ? 'Hospital Name' : 'Blood Bank Center Name'}
                  </label>
                  <input
                    type="text"
                    {...register('orgName')}
                    placeholder={selectedRole === 'hospital_staff' ? 'City Memorial Hospital' : 'Apex Regional Blood Center'}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State Health License Number
                  </label>
                  <input
                    type="text"
                    {...register('licenseNumber')}
                    placeholder="HOSP-NY-2026-0042"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs sm:text-sm font-mono text-slate-900"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'patient' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Phone Number
                </label>
                <input
                  type="text"
                  {...register('contactPhone')}
                  placeholder="+1-555-0144"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900"
                />
              </div>
            )}

            {/* Consents */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('consentAlerts')}
                  className="mt-0.5 rounded text-[#C62828] focus:ring-[#C62828]"
                />
                <span>
                  I consent to receive high-urgency emergency donor outreach alerts within my approximate geographic radius.
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('consentLocation')}
                  className="mt-0.5 rounded text-[#C62828] focus:ring-[#C62828]"
                />
                <span>
                  I consent to approximate distance matching (my exact residential coordinates remain private and confidential).
                </span>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full font-semibold"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Complete Registration & Go to Dashboard
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/auth/login" className="font-semibold text-[#C62828] hover:underline">
            Log in to existing profile
          </Link>
        </p>
      </div>
    </div>
  );
};
