import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, DonorProfile } from '../types';
import { appStorage, INITIAL_PROFILES } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { dataService } from '../lib/dataService';

interface AuthContextType {
  user: UserProfile | null;
  donorProfile: DonorProfile | null;
  role: UserRole;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole, bloodGroup?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  updateDonorAvailability: (isAvailable: boolean) => Promise<void>;
  updateDonorConsent: (alerts: boolean, location: boolean) => Promise<void>;
  refreshDonorProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUserId = localStorage.getItem('bloodlink_active_user_id') || 'user-donor';
    const profiles = appStorage.getProfiles();
    return profiles.find((p) => p.id === savedUserId) || profiles[3]; // Default to Donor Marcus Chen
  });

  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load donor profile if active user is a donor
  const refreshDonorProfile = () => {
    if (user?.role === 'donor') {
      const donors = appStorage.getDonors();
      const current = donors.find((d) => d.user_id === user.id) || donors[0];
      setDonorProfile(current || null);
    } else {
      setDonorProfile(null);
    }
  };

  // Initial sync from Supabase if online
  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .maybeSingle();

            if (dbProfile) {
              const mappedUser: UserProfile = {
                id: dbProfile.id,
                email: dbProfile.email,
                full_name: dbProfile.full_name,
                phone: dbProfile.phone,
                role: dbProfile.role,
                is_active: dbProfile.is_active,
                created_at: dbProfile.created_at,
              };
              setUser(mappedUser);
              localStorage.setItem('bloodlink_active_user_id', mappedUser.id);
            }
          }
          await dataService.syncFromSupabase();
        } catch (e) {
          console.warn('[Supabase Session Init Warning]:', e);
        }
      }
      refreshDonorProfile();
      setIsLoading(false);
    }

    initAuth();
  }, []);

  useEffect(() => {
    refreshDonorProfile();
  }, [user]);

  const switchDemoRole = (targetRole: UserRole) => {
    const profiles = appStorage.getProfiles();
    const matched = profiles.find((p) => p.role === targetRole) || profiles[0];
    localStorage.setItem('bloodlink_active_user_id', matched.id);
    setUser(matched);
  };

  const login = async (email: string, password: string = 'password123', role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!error && data?.user) {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (dbProfile) {
              const mapped: UserProfile = {
                id: dbProfile.id,
                email: dbProfile.email,
                full_name: dbProfile.full_name,
                phone: dbProfile.phone,
                role: dbProfile.role,
                is_active: dbProfile.is_active,
                created_at: dbProfile.created_at,
              };
              localStorage.setItem('bloodlink_active_user_id', mapped.id);
              setUser(mapped);
              await dataService.syncFromSupabase();
              return true;
            }
          }
        } catch (err: any) {
          console.warn('Supabase sign-in fallback to local profiles:', err.message);
        }
      }

      // Local / Demo Account Matching Fallback
      const profiles = appStorage.getProfiles();
      let matched = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!matched && role) {
        matched = profiles.find((p) => p.role === role);
      }

      if (!matched) {
        matched = profiles[3]; // default donor
      }

      localStorage.setItem('bloodlink_active_user_id', matched.id);
      setUser(matched);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    role: UserRole,
    bloodGroup?: string,
    password: string = 'password123'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      let createdUserId = `user-${Date.now()}`;

      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                role,
                blood_group: bloodGroup,
              },
            },
          });

          if (!error && data.user) {
            createdUserId = data.user.id;
            await supabase.from('profiles').upsert({
              id: createdUserId,
              email,
              full_name: name,
              role,
              is_active: true,
            });

            if (role === 'donor') {
              await supabase.from('donor_profiles').upsert({
                user_id: createdUserId,
                blood_group: bloodGroup || 'O+',
                city: 'New York',
                travel_radius_km: 25,
                is_available: true,
              });
            }
          }
        } catch (err) {
          console.warn('Supabase sign-up fallback to local profile store:', err);
        }
      }

      const newProfile: UserProfile = {
        id: createdUserId,
        email,
        full_name: name,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
      };

      const profiles = appStorage.getProfiles();
      profiles.push(newProfile);
      appStorage.setProfiles(profiles);

      if (role === 'donor') {
        const donors = appStorage.getDonors();
        const newDonor: DonorProfile = {
          id: `donor-${Date.now()}`,
          user_id: createdUserId,
          donor_name: name,
          blood_group: (bloodGroup as any) || 'O+',
          city: 'New York',
          area: 'Midtown',
          latitude: 40.758,
          longitude: -73.9855,
          travel_radius_km: 25,
          is_available: true,
          consent_emergency_alerts: true,
          consent_share_approx_location: true,
          total_donations: 0,
          reward_points: 100,
          badges: [{ name: 'Welcome Lifesaver', tier: 'bronze', icon: 'heart' }],
        };
        donors.push(newDonor);
        appStorage.setDonors(donors);
      }

      localStorage.setItem('bloodlink_active_user_id', createdUserId);
      setUser(newProfile);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut().catch(console.error);
    }
    localStorage.removeItem('bloodlink_active_user_id');
    const profiles = appStorage.getProfiles();
    setUser(profiles[3]); // Marcus Chen (donor)
  };

  const updateDonorAvailability = async (isAvailable: boolean) => {
    if (!donorProfile) return;
    const donors = appStorage.getDonors();
    const updated = donors.map((d) => (d.id === donorProfile.id ? { ...d, is_available: isAvailable } : d));
    appStorage.setDonors(updated);
    setDonorProfile({ ...donorProfile, is_available: isAvailable });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('donor_profiles')
          .update({ is_available: isAvailable })
          .eq('user_id', user?.id);
      } catch (err) {
        console.warn('Supabase donor availability update notice:', err);
      }
    }
  };

  const updateDonorConsent = async (alerts: boolean, location: boolean) => {
    if (!donorProfile) return;
    const donors = appStorage.getDonors();
    const updated = donors.map((d) =>
      d.id === donorProfile.id
        ? { ...d, consent_emergency_alerts: alerts, consent_share_approx_location: location }
        : d
    );
    appStorage.setDonors(updated);
    setDonorProfile({
      ...donorProfile,
      consent_emergency_alerts: alerts,
      consent_share_approx_location: location,
    });

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('donor_profiles')
          .update({
            consent_emergency_alerts: alerts,
            consent_share_approx_location: location,
          })
          .eq('user_id', user?.id);
      } catch (err) {
        console.warn('Supabase donor consent update notice:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        donorProfile,
        role: user?.role || 'donor',
        isDemoMode: !isSupabaseConfigured,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        updateDonorAvailability,
        updateDonorConsent,
        refreshDonorProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
