import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Bell,
  Menu,
  X,
  User,
  Shield,
  Building2,
  Activity,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, switchDemoRole, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardPath = (userRole: UserRole): string => {
    switch (userRole) {
      case 'donor':
        return '/donor/dashboard';
      case 'patient':
        return '/patient/dashboard';
      case 'hospital_staff':
        return '/hospital/dashboard';
      case 'blood_bank_staff':
        return '/blood-bank/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getRoleLabel = (userRole: UserRole): string => {
    switch (userRole) {
      case 'donor':
        return 'Donor (Marcus Chen, O-)';
      case 'patient':
        return 'Patient/Requester (Priya)';
      case 'hospital_staff':
        return 'Hospital Staff (Dr. Rao)';
      case 'blood_bank_staff':
        return 'Blood Bank (Elena)';
      case 'admin':
        return 'Admin (Dr. Mitchell)';
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Emergency Map', path: '/map' },
    { name: 'Find Blood', path: '/find-blood' },
    { name: 'Blood Banks', path: '/blood-banks' },
    { name: 'AI Demand Forecast', path: '/forecast' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'About', path: '/about' },
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    switchDemoRole(newRole);
    setRoleMenuOpen(false);
    navigate(getDashboardPath(newRole));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Demo Role Switcher Bar */}
      <div className="bg-[#17233C] text-slate-200 text-xs py-1.5 px-4 border-b border-slate-700/50 flex flex-wrap items-center justify-between gap-2 z-40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#C62828] text-white px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider">
            <Activity className="h-3 w-3 animate-pulse" /> Emergency Network
          </span>
          <span className="hidden sm:inline text-slate-300">
            Active Role: <strong className="text-white font-medium">{getRoleLabel(role)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] text-slate-400 hidden md:inline">Switch Role Sandbox:</span>
          <button
            onClick={() => handleRoleSwitch('donor')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              role === 'donor' ? 'bg-[#C62828] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Donor
          </button>
          <button
            onClick={() => handleRoleSwitch('patient')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              role === 'patient' ? 'bg-[#C62828] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Requester
          </button>
          <button
            onClick={() => handleRoleSwitch('hospital_staff')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              role === 'hospital_staff' ? 'bg-[#C62828] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Hospital
          </button>
          <button
            onClick={() => handleRoleSwitch('blood_bank_staff')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              role === 'blood_bank_staff' ? 'bg-[#C62828] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Blood Bank
          </button>
          <button
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              role === 'admin' ? 'bg-[#C62828] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#C62828] to-[#991b1b] flex items-center justify-center text-white shadow-md shadow-red-200 group-hover:scale-105 transition-transform">
                  <Droplet className="h-5 w-5 fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1">
                    Blood<span className="text-[#C62828]">Link</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider -mt-1">
                    Emergency Network
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex lg:ml-8 lg:space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-[#C62828] bg-red-50/70 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side Navigation Actions */}
            <div className="hidden lg:flex lg:items-center lg:gap-3">
              {/* Emergency Request CTA */}
              <Link
                to="/patient/new-request"
                className="bg-[#C62828] hover:bg-[#b71c1c] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:shadow-md animate-pulse"
              >
                <Activity className="h-4 w-4" />
                Emergency Request
              </Link>

              {/* Notifications Inbox Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-[#C62828] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      <Link
                        to="/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs text-[#C62828] hover:underline font-medium"
                      >
                        View all
                      </Link>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 4).map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-left transition-colors hover:bg-slate-50 ${
                              !n.is_read ? 'bg-red-50/30' : ''
                            }`}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.link) {
                                navigate(n.link);
                                setNotifDropdownOpen(false);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                              {!n.is_read && (
                                <span className="h-1.5 w-1.5 bg-[#C62828] rounded-full shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dashboard / Portal Button */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={getDashboardPath(role)}
                    className="flex items-center gap-2 bg-[#17233C] hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>My Dashboard</span>
                  </Link>

                  <button
                    onClick={() => logout()}
                    title="Sign Out"
                    className="p-2 text-slate-500 hover:text-red-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/auth/login"
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="text-xs font-semibold bg-[#C62828] hover:bg-[#b71c1c] text-white px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden gap-2">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-[#C62828] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? 'text-[#C62828] bg-red-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <Link
                to="/patient/new-request"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-[#C62828] text-white py-2 rounded-lg text-sm font-semibold"
              >
                Emergency Blood Request
              </Link>
              <Link
                to={getDashboardPath(role)}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full bg-[#17233C] text-white py-2 rounded-lg text-sm font-semibold"
              >
                Go to Dashboard ({getRoleLabel(role)})
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
