export type UserRole = 'donor' | 'patient' | 'hospital_staff' | 'blood_bank_staff' | 'admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent =
  | 'Whole Blood'
  | 'Red Blood Cells'
  | 'Platelets'
  | 'Fresh Frozen Plasma'
  | 'Cryoprecipitate';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type RequestStatus =
  | 'submitted'
  | 'pending_verification'
  | 'open'
  | 'matching'
  | 'donor_response_received'
  | 'fulfilled'
  | 'cancelled'
  | 'expired';

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export type MatchStatus = 'queued' | 'sent' | 'accepted' | 'declined' | 'expired';

export type StockBatchStatus = 'available' | 'reserved' | 'quarantined' | 'expired' | 'discarded' | 'issued';

export type StockTxType = 'receipt' | 'reservation' | 'release' | 'issue' | 'expiry' | 'adjustment';

export type NotificationType =
  | 'emergency_request'
  | 'match_invite'
  | 'invite_accepted'
  | 'invite_declined'
  | 'stock_alert'
  | 'request_update'
  | 'system';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'hospital' | 'blood_bank';
  license_number: string;
  address: string;
  city: string;
  district?: string;
  state: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  verification_status: VerificationStatus;
  verified_at?: string;
  rejection_reason?: string;
  is_public_directory: boolean;
  is_demo_data?: boolean;
}

export interface DonorBadge {
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
}

export interface DonorProfile {
  id: string;
  user_id: string;
  donor_name?: string;
  blood_group: BloodGroup;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  city: string;
  district?: string;
  state?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  travel_radius_km: number;
  is_available: boolean;
  consent_emergency_alerts: boolean;
  consent_share_approx_location: boolean;
  last_donation_date?: string;
  next_eligible_date?: string;
  total_donations: number;
  reward_points: number;
  badges: DonorBadge[];
  is_demo_data?: boolean;
}

export interface BloodRequest {
  id: string;
  request_code: string;
  requester_id: string;
  patient_name: string;
  hospital_id?: string;
  hospital_name: string;
  blood_group: BloodGroup;
  blood_component: BloodComponent;
  units_needed: number;
  units_fulfilled: number;
  urgency: UrgencyLevel;
  needed_by: string;
  city: string;
  district?: string;
  state?: string;
  area?: string;
  hospital_room_or_doctor?: string;
  contact_phone: string;
  medical_notes?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  is_demo_data?: boolean;
}

export interface RequestEvent {
  id: string;
  request_id: string;
  actor_id?: string;
  actor_name?: string;
  event_type: string;
  notes: string;
  created_at: string;
}

export interface MatchReason {
  factor: string;
  points?: number;
  max?: number;
  details: string;
}

export interface DonorMatch {
  id: string;
  request_id: string;
  donor_id: string;
  donor_name?: string;
  donor_blood_group?: BloodGroup;
  donor_city?: string;
  match_score: number;
  match_reasons: MatchReason[];
  distance_km?: number;
  outreach_status: MatchStatus;
  outreach_batch: number;
  sent_at?: string;
  responded_at?: string;
  response_notes?: string;
  created_at: string;
}

export interface BloodStockBatch {
  id: string;
  organization_id: string;
  organization_name?: string;
  batch_number: string;
  blood_group: BloodGroup;
  blood_component: BloodComponent;
  units_available: number;
  units_reserved: number;
  collected_date: string;
  expiry_date: string;
  status: StockBatchStatus;
  storage_location?: string;
  is_sample_data: boolean;
  created_at: string;
  updated_at: string;
}

export interface BloodStockTransaction {
  id: string;
  batch_id: string;
  organization_id: string;
  organization_name?: string;
  batch_number?: string;
  blood_group?: BloodGroup;
  blood_component?: BloodComponent;
  performed_by_name?: string;
  transaction_type: StockTxType;
  units: number;
  previous_available: number;
  new_available: number;
  reason?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface ForecastPoint {
  date: string;
  day: string;
  predicted_units: number;
  lower_bound: number;
  upper_bound: number;
}

export interface DemandForecastResult {
  blood_group: BloodGroup;
  blood_component: BloodComponent;
  forecast_horizon_days: number;
  model_version: string;
  model_mae: number;
  baseline_rolling_mae: number;
  performance_improvement_pct: number;
  total_projected_demand: number;
  current_available_stock: number;
  stock_gap: number;
  shortage_risk: 'low' | 'moderate' | 'high';
  shortage_warning: string;
  forecast_points: ForecastPoint[];
  disclaimer: string;
}

export interface AuditLogItem {
  id: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  created_at: string;
}
