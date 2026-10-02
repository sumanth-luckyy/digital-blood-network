import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FindBloodPage } from './pages/FindBloodPage';
import { BloodBanksPage } from './pages/BloodBanksPage';
import { ContactPage } from './pages/ContactPage';
import { EmergencyMapPage } from './pages/EmergencyMapPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorProfilePage } from './pages/donor/DonorProfilePage';
import { DonorInvitationsPage } from './pages/donor/DonorInvitationsPage';
import { DonorHistoryPage } from './pages/donor/DonorHistoryPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { NewRequestPage } from './pages/patient/NewRequestPage';
import { RequestDetailPage } from './pages/patient/RequestDetailPage';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { HospitalRequestsPage } from './pages/hospital/HospitalRequestsPage';
import { HospitalRequestDetailPage } from './pages/hospital/HospitalRequestDetailPage';
import { HospitalInventoryPage } from './pages/hospital/HospitalInventoryPage';
import { HospitalDonorsPage } from './pages/hospital/HospitalDonorsPage';

// Blood Bank Pages
import { BloodBankDashboard } from './pages/blood-bank/BloodBankDashboard';
import { BloodBankInventoryPage } from './pages/blood-bank/BloodBankInventoryPage';
import { BloodBankTransactionsPage } from './pages/blood-bank/BloodBankTransactionsPage';

// AI Forecasting & Notifications & Admin & Settings
import { ForecastPage } from './pages/forecast/ForecastPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrganizationsPage } from './pages/admin/AdminOrganizationsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient();

export function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/find-blood" element={<FindBloodPage />} />
          <Route path="/map" element={<EmergencyMapPage />} />
          <Route path="/emergency-map" element={<EmergencyMapPage />} />
          <Route path="/blood-banks" element={<BloodBanksPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Donor Routes */}
          <Route
            path="/donor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/profile"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/invitations"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorInvitationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/history"
            element={
              <ProtectedRoute allowedRoles={['donor', 'admin']}>
                <DonorHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient', 'hospital_staff', 'admin']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/new-request"
            element={
              <ProtectedRoute allowedRoles={['patient', 'hospital_staff', 'admin']}>
                <NewRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/requests/:id"
            element={
              <ProtectedRoute allowedRoles={['patient', 'hospital_staff', 'admin']}>
                <RequestDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Hospital Routes */}
          <Route
            path="/hospital/dashboard"
            element={
              <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                <HospitalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/requests"
            element={
              <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                <HospitalRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/requests/:id"
            element={
              <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                <HospitalRequestDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/inventory"
            element={
              <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                <HospitalInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospital/donors"
            element={
              <ProtectedRoute allowedRoles={['hospital_staff', 'admin']}>
                <HospitalDonorsPage />
              </ProtectedRoute>
            }
          />

          {/* Blood Bank Routes */}
          <Route
            path="/blood-bank/dashboard"
            element={
              <ProtectedRoute allowedRoles={['blood_bank_staff', 'admin']}>
                <BloodBankDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blood-bank/inventory"
            element={
              <ProtectedRoute allowedRoles={['blood_bank_staff', 'admin']}>
                <BloodBankInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blood-bank/transactions"
            element={
              <ProtectedRoute allowedRoles={['blood_bank_staff', 'admin']}>
                <BloodBankTransactionsPage />
              </ProtectedRoute>
            }
          />

          {/* AI Demand Forecasting */}
          <Route path="/forecast" element={<ForecastPage />} />

          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/organizations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminOrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
