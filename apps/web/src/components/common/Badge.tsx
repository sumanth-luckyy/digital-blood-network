import React from 'react';
import { BloodGroup, UrgencyLevel, RequestStatus, VerificationStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blood' | 'urgency' | 'status' | 'verification' | 'neutral';
  urgency?: UrgencyLevel;
  status?: RequestStatus;
  verification?: VerificationStatus;
  bloodGroup?: BloodGroup;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  urgency,
  status,
  verification,
  bloodGroup,
  className = '',
}) => {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (bloodGroup) {
    colorStyles = 'bg-red-50 text-red-700 border-red-200 font-bold';
  } else if (urgency) {
    switch (urgency) {
      case 'critical':
        colorStyles = 'bg-red-100 text-red-800 border-red-300 animate-pulse font-semibold';
        break;
      case 'high':
        colorStyles = 'bg-amber-100 text-amber-800 border-amber-300 font-medium';
        break;
      case 'medium':
        colorStyles = 'bg-blue-100 text-blue-800 border-blue-200';
        break;
      case 'low':
        colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'fulfilled':
        colorStyles = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
        break;
      case 'matching':
      case 'donor_response_received':
        colorStyles = 'bg-purple-100 text-purple-800 border-purple-200 font-medium';
        break;
      case 'open':
        colorStyles = 'bg-blue-100 text-blue-800 border-blue-200 font-medium';
        break;
      case 'submitted':
      case 'pending_verification':
        colorStyles = 'bg-amber-100 text-amber-800 border-amber-300';
        break;
      case 'cancelled':
      case 'expired':
        colorStyles = 'bg-rose-50 text-rose-600 border-rose-200';
        break;
    }
  } else if (verification) {
    switch (verification) {
      case 'verified':
        colorStyles = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold';
        break;
      case 'pending':
        colorStyles = 'bg-amber-100 text-amber-800 border-amber-300';
        break;
      case 'rejected':
      case 'suspended':
        colorStyles = 'bg-rose-100 text-rose-800 border-rose-300';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border tracking-wide uppercase transition-colors ${colorStyles} ${className}`}
    >
      {children}
    </span>
  );
};
