import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button } from './Button';
import { Card } from './Card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, isLoading, switchDemoRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[#C62828] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying authorization credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check if role is allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Provide an informative, non-blocking UI for hackathon demo convenience
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="p-6 text-center space-y-4 border-amber-200 bg-amber-50/50">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Role-Restricted Area</h2>
            <p className="text-xs text-slate-600 mt-1">
              Your active role (<strong>{role}</strong>) does not have authorization for this portal.
              Allowed roles: <strong>{allowedRoles.join(', ')}</strong>.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {allowedRoles[0] && (
              <Button
                size="sm"
                className="w-full font-bold"
                onClick={() => switchDemoRole(allowedRoles[0])}
              >
                Switch Role to {allowedRoles[0]} & Continue
              </Button>
            )}

            <Link to="/" className="block">
              <Button size="sm" variant="outline" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Return to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
