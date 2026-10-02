import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  category: z.enum(['facility_verification', 'support', 'abuse_report', 'general']),
  subject: z.string().min(4, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: 'support',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API dispatch / logging
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900">Contact & Support Operations</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Reach our platform engineering, hospital accreditation desk, or 24/7 emergency dispatch coordinators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Emergency Hotlines</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-[#C62828] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">24/7 Emergency Line</strong>
                  <span>1-800-BLOOD-LINK (Toll-Free)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="h-4 w-4 text-[#17233C] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">Verification Desk</strong>
                  <span>compliance@bloodlink.network</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">Network HQ</strong>
                  <span>Medical Center Boulevard, New York, NY 10001</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-900">
              <ShieldAlert className="h-4 w-4 text-[#C62828]" />
              <span>Reporting Blood Hoarding or Fraud</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Voluntary blood donation is non-remunerated by law. If any individual or entity solicits cash payment for donated units, report immediately under category "Abuse or Fraud Report".
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-2">
          <Card className="p-6">
            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Message Transmitted</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your ticket has been logged with audit reference ID #SUP-{Date.now().toString().slice(-6)}. A response will be issued to your email shortly.
                </p>
                <div className="pt-4">
                  <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="jane@example.com"
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
                      Inquiry Category *
                    </label>
                    <select
                      {...register('category')}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                    >
                      <option value="support">Technical Support</option>
                      <option value="facility_verification">Hospital / Blood Bank Verification</option>
                      <option value="abuse_report">Abuse or Fraud Report</option>
                      <option value="general">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      {...register('subject')}
                      placeholder="Brief topic"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-600 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Message *
                  </label>
                  <textarea
                    rows={4}
                    {...register('message')}
                    placeholder="Provide specific details..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#C62828]"
                  ></textarea>
                  {errors.message && (
                    <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full font-semibold"
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
