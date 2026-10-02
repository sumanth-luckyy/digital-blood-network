-- ==============================================================================
-- BloodLink — Digital Blood Donation Emergency Network
-- Migration Version: 20261001000000_initial_schema.sql
-- Description: Complete Supabase PostgreSQL Database Layer with RLS, Indexes, & Triggers
-- ==============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- CUSTOM ENUMS & TYPES
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'donor',
    'patient',
    'hospital',
    'hospital_staff',
    'blood_bank',
    'blood_bank_staff',
    'admin'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE org_type AS ENUM ('hospital', 'blood_bank');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE blood_component_type AS ENUM (
    'Whole Blood',
    'Red Blood Cells',
    'Platelets',
    'Fresh Frozen Plasma',
    'Cryoprecipitate'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE request_urgency AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM (
    'submitted',
    'pending_verification',
    'open',
    'matching',
    'donor_response_received',
    'fulfilled',
    'cancelled',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM ('queued', 'sent', 'accepted', 'declined', 'expired');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE stock_tx_type AS ENUM (
    'receipt',
    'reservation',
    'release',
    'issue',
    'expiry',
    'adjustment'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE notif_type AS ENUM (
    'emergency_request',
    'match_invite',
    'invite_accepted',
    'invite_declined',
    'stock_alert',
    'request_update',
    'system'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'donor',
    is_active BOOLEAN NOT NULL DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 2. ORGANIZATIONS TABLE (Hospitals and Blood Banks)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type org_type NOT NULL,
    license_number TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    state TEXT NOT NULL,
    postal_code TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    verification_status verification_status NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    is_public_directory BOOLEAN NOT NULL DEFAULT true,
    is_demo_data BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. ORGANIZATION MEMBERS (Staff association)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    member_role TEXT NOT NULL DEFAULT 'staff' CHECK (member_role IN ('admin', 'staff', 'manager')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, user_id)
);

-- ==============================================================================
-- 4. DONOR PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.donor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    blood_group blood_group_type NOT NULL,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    city TEXT NOT NULL,
    district TEXT,
    state TEXT NOT NULL DEFAULT 'Telangana',
    area TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    travel_radius_km INTEGER NOT NULL DEFAULT 25 CHECK (travel_radius_km > 0 AND travel_radius_km <= 150),
    is_available BOOLEAN NOT NULL DEFAULT true,
    consent_emergency_alerts BOOLEAN NOT NULL DEFAULT true,
    consent_share_approx_location BOOLEAN NOT NULL DEFAULT true,
    is_demo_data BOOLEAN NOT NULL DEFAULT true,
    last_donation_date DATE,
    next_eligible_date DATE,
    total_donations INTEGER NOT NULL DEFAULT 0 CHECK (total_donations >= 0),
    reward_points INTEGER NOT NULL DEFAULT 0 CHECK (reward_points >= 0),
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. BLOOD REQUESTS (Emergency & Clinical Requests)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code TEXT UNIQUE NOT NULL,
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    patient_name TEXT NOT NULL,
    hospital_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    hospital_name TEXT NOT NULL,
    blood_group blood_group_type NOT NULL,
    blood_component blood_component_type NOT NULL DEFAULT 'Whole Blood',
    units_needed INTEGER NOT NULL CHECK (units_needed > 0),
    units_fulfilled INTEGER NOT NULL DEFAULT 0 CHECK (units_fulfilled >= 0),
    urgency request_urgency NOT NULL DEFAULT 'high',
    needed_by TIMESTAMPTZ NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    state TEXT NOT NULL DEFAULT 'Telangana',
    area TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    hospital_room_or_doctor TEXT,
    contact_phone TEXT NOT NULL,
    medical_notes TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    status request_status NOT NULL DEFAULT 'submitted',
    is_demo_data BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. BLOOD STOCK TABLE (Real-time tracking of A+, A-, B+, B-, AB+, AB-, O+, O-)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.blood_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    blood_group blood_group_type NOT NULL,
    blood_component blood_component_type NOT NULL DEFAULT 'Whole Blood',
    units_available INTEGER NOT NULL CHECK (units_available >= 0),
    units_reserved INTEGER NOT NULL DEFAULT 0 CHECK (units_reserved >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    critical_stock_threshold INTEGER NOT NULL DEFAULT 2 CHECK (critical_stock_threshold >= 0),
    collected_date DATE,
    expiry_date DATE,
    storage_location TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    is_sample_data BOOLEAN NOT NULL DEFAULT true,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, batch_number)
);

-- ==============================================================================
-- 7. DONOR MATCHES (Proximity 50%, Availability 30%, Response Suitability 20%)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.donor_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.blood_requests(id) ON DELETE CASCADE,
    donor_id UUID NOT NULL REFERENCES public.donor_profiles(id) ON DELETE CASCADE,
    match_score NUMERIC(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    distance_km NUMERIC(6,2),
    outreach_status match_status NOT NULL DEFAULT 'queued',
    outreach_batch INTEGER NOT NULL DEFAULT 1 CHECK (outreach_batch > 0),
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    response_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(request_id, donor_id)
);

-- ==============================================================================
-- 8. COMPLETED DONATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.donor_profiles(id) ON DELETE RESTRICT,
    request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    units_donated INTEGER NOT NULL DEFAULT 1 CHECK (units_donated > 0),
    blood_component blood_component_type NOT NULL DEFAULT 'Whole Blood',
    screening_status TEXT NOT NULL DEFAULT 'passed' CHECK (screening_status IN ('passed', 'failed', 'pending')),
    certificate_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 9. IN-APP NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type notif_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 10. DEMAND FORECASTS (Predictive Analytics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    blood_group blood_group_type NOT NULL,
    blood_component blood_component_type NOT NULL DEFAULT 'Whole Blood',
    forecast_date DATE NOT NULL,
    forecast_units NUMERIC(6,2) NOT NULL CHECK (forecast_units >= 0),
    lower_bound NUMERIC(6,2) NOT NULL CHECK (lower_bound >= 0),
    upper_bound NUMERIC(6,2) NOT NULL CHECK (upper_bound >= lower_bound),
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    model_version TEXT NOT NULL,
    is_synthetic BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 11. AUDIT LOGS (Immutable Activity Log)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- PERFORMANCE INDEXES FOR FREQUENTLY QUERIED FIELDS
-- ==============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_type ON public.organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON public.organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_verification ON public.organizations(verification_status);

-- Organization members indexes
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);

-- Donor profiles indexes
CREATE INDEX IF NOT EXISTS idx_donor_profiles_user_id ON public.donor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_blood_group ON public.donor_profiles(blood_group);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_availability ON public.donor_profiles(is_available);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_city ON public.donor_profiles(city);
CREATE INDEX IF NOT EXISTS idx_donor_profiles_coords ON public.donor_profiles(latitude, longitude);

-- Blood requests indexes
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_urgency ON public.blood_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group ON public.blood_requests(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_hospital_id ON public.blood_requests(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_requester_id ON public.blood_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_city ON public.blood_requests(city);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON public.blood_requests(created_at DESC);

-- Blood stock indexes
CREATE INDEX IF NOT EXISTS idx_blood_stock_org_id ON public.blood_stock(organization_id);
CREATE INDEX IF NOT EXISTS idx_blood_stock_blood_group ON public.blood_stock(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_stock_status ON public.blood_stock(status);
CREATE INDEX IF NOT EXISTS idx_blood_stock_component ON public.blood_stock(blood_component);

-- Donor matches indexes
CREATE INDEX IF NOT EXISTS idx_donor_matches_request_id ON public.donor_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_donor_matches_donor_id ON public.donor_matches(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_matches_outreach_status ON public.donor_matches(outreach_status);
CREATE INDEX IF NOT EXISTS idx_donor_matches_score ON public.donor_matches(match_score DESC);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_org_id ON public.donations(organization_id);
CREATE INDEX IF NOT EXISTS idx_donations_request_id ON public.donations(request_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON public.donations(donation_date DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Demand forecasts indexes
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_org_id ON public.demand_forecasts(organization_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_blood_group ON public.demand_forecasts(blood_group);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_date ON public.demand_forecasts(forecast_date);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ==============================================================================
-- AUTOMATIC TIMESTAMPS & AUTH TRIGGERS
-- ==============================================================================

-- Generic handle_updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_organizations_updated_at ON public.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_org_members_updated_at ON public.organization_members;
CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_donor_profiles_updated_at ON public.donor_profiles;
CREATE TRIGGER set_donor_profiles_updated_at
  BEFORE UPDATE ON public.donor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_blood_requests_updated_at ON public.blood_requests;
CREATE TRIGGER set_blood_requests_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_blood_stock_updated_at ON public.blood_stock;
CREATE TRIGGER set_blood_stock_updated_at
  BEFORE UPDATE ON public.blood_stock
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_donor_matches_updated_at ON public.donor_matches;
CREATE TRIGGER set_donor_matches_updated_at
  BEFORE UPDATE ON public.donor_matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_donations_updated_at ON public.donations;
CREATE TRIGGER set_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Supabase auth user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role := 'donor';
BEGIN
  -- Safe conversion of user role from raw metadata if present
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    BEGIN
      assigned_role := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION WHEN invalid_text_representation THEN
      assigned_role := 'donor';
    END;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit logging helper function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_stock;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_matches;
EXCEPTION WHEN others THEN null;
END $$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ==============================================================================

-- Check if current authenticated user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current authenticated user is hospital or blood bank staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('hospital', 'hospital_staff', 'blood_bank', 'blood_bank_staff', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is an active member or staff of an organization
CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS boolean AS $$
  SELECT (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = p_org_id AND user_id = auth.uid() AND is_active = true
    )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all 11 tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donor_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- Rule: Users can read/update their own profile. Authenticated users can view directory profiles.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles read own or public directory" ON public.profiles;
CREATE POLICY "Profiles read own or public directory"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    public.is_admin() OR
    public.is_staff() OR
    auth.role() = 'authenticated' OR
    auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Profiles insert own profile" ON public.profiles;
CREATE POLICY "Profiles insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    public.is_admin() OR
    auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Profiles update own profile" ON public.profiles;
CREATE POLICY "Profiles update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 2. ORGANIZATIONS POLICIES
-- Rule: Public read for hospital/blood bank directory; Staff & Admin management.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Organizations directory viewable by all" ON public.organizations;
CREATE POLICY "Organizations directory viewable by all"
  ON public.organizations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizations manage by staff and admin" ON public.organizations;
CREATE POLICY "Organizations manage by staff and admin"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff() OR public.is_admin());

DROP POLICY IF EXISTS "Organizations update by org members or admin" ON public.organizations;
CREATE POLICY "Organizations update by org members or admin"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.is_org_member(id) OR public.is_admin())
  WITH CHECK (public.is_org_member(id) OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. ORGANIZATION MEMBERS POLICIES
-- Rule: Members can view their org roster; Admins can manage all.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Org members viewable by members and admin" ON public.organization_members;
CREATE POLICY "Org members viewable by members and admin"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_org_member(organization_id) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Org members managed by org admin or system admin" ON public.organization_members;
CREATE POLICY "Org members managed by org admin or system admin"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_member(organization_id) OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. DONOR PROFILES POLICIES
-- Rule: Donors can manage their own donor profile. Staff and matching workflows can view.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Donor profiles read own, staff, or matching" ON public.donor_profiles;
CREATE POLICY "Donor profiles read own, staff, or matching"
  ON public.donor_profiles FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_admin() OR
    public.is_staff() OR
    EXISTS (
      SELECT 1 FROM public.donor_matches dm
      JOIN public.blood_requests br ON dm.request_id = br.id
      WHERE dm.donor_id = donor_profiles.id AND (br.requester_id = auth.uid() OR public.is_org_member(br.hospital_id))
    ) OR
    auth.role() = 'authenticated' OR
    auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Donors manage own profile insert" ON public.donor_profiles;
CREATE POLICY "Donors manage own profile insert"
  ON public.donor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Donors manage own profile update" ON public.donor_profiles;
CREATE POLICY "Donors manage own profile update"
  ON public.donor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. BLOOD REQUESTS POLICIES
-- Rule: Hospitals & requesters can create and manage their own blood requests.
-- Donors and public can view active requests.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Blood requests viewable by all" ON public.blood_requests;
CREATE POLICY "Blood requests viewable by all"
  ON public.blood_requests FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Hospitals and patients can create requests" ON public.blood_requests;
CREATE POLICY "Hospitals and patients can create requests"
  ON public.blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid() OR
    public.is_staff() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Hospitals and requesters can manage requests" ON public.blood_requests;
CREATE POLICY "Hospitals and requesters can manage requests"
  ON public.blood_requests FOR UPDATE
  TO authenticated
  USING (
    requester_id = auth.uid() OR
    public.is_org_member(hospital_id) OR
    public.is_staff() OR
    public.is_admin()
  )
  WITH CHECK (
    requester_id = auth.uid() OR
    public.is_org_member(hospital_id) OR
    public.is_staff() OR
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 6. BLOOD STOCK POLICIES
-- Rule: Blood banks can manage their own inventory. Public/hospitals can view.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Blood stock inventory viewable by all" ON public.blood_stock;
CREATE POLICY "Blood stock inventory viewable by all"
  ON public.blood_stock FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Blood banks and staff manage stock insert" ON public.blood_stock;
CREATE POLICY "Blood banks and staff manage stock insert"
  ON public.blood_stock FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_org_member(organization_id) OR
    public.is_staff() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Blood banks and staff manage stock update" ON public.blood_stock;
CREATE POLICY "Blood banks and staff manage stock update"
  ON public.blood_stock FOR UPDATE
  TO authenticated
  USING (
    public.is_org_member(organization_id) OR
    public.is_staff() OR
    public.is_admin()
  )
  WITH CHECK (
    public.is_org_member(organization_id) OR
    public.is_staff() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Blood banks and staff manage stock delete" ON public.blood_stock;
CREATE POLICY "Blood banks and staff manage stock delete"
  ON public.blood_stock FOR DELETE
  TO authenticated
  USING (
    public.is_org_member(organization_id) OR
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 7. DONOR MATCHES POLICIES
-- Rule: Donors can view relevant matching requests; Hospitals manage outreach.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Donors view relevant matches and hospitals view request matches" ON public.donor_matches;
CREATE POLICY "Donors view relevant matches and hospitals view request matches"
  ON public.donor_matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_matches.donor_id AND dp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = donor_matches.request_id AND (br.requester_id = auth.uid() OR public.is_org_member(br.hospital_id))
    ) OR
    public.is_staff() OR
    public.is_admin() OR
    auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Hospitals and staff insert donor matches" ON public.donor_matches;
CREATE POLICY "Hospitals and staff insert donor matches"
  ON public.donor_matches FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_staff() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Donors and hospitals update match status" ON public.donor_matches;
CREATE POLICY "Donors and hospitals update match status"
  ON public.donor_matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_matches.donor_id AND dp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = donor_matches.request_id AND (br.requester_id = auth.uid() OR public.is_org_member(br.hospital_id))
    ) OR
    public.is_staff() OR
    public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donor_matches.donor_id AND dp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.blood_requests br
      WHERE br.id = donor_matches.request_id AND (br.requester_id = auth.uid() OR public.is_org_member(br.hospital_id))
    ) OR
    public.is_staff() OR
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 8. DONATIONS POLICIES
-- Rule: Donors view their own donations; Orgs record completed donations.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Donations read access" ON public.donations;
CREATE POLICY "Donations read access"
  ON public.donations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.donor_profiles dp
      WHERE dp.id = donations.donor_id AND dp.user_id = auth.uid()
    ) OR
    public.is_org_member(organization_id) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Donations record by staff and admin" ON public.donations;
CREATE POLICY "Donations record by staff and admin"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_org_member(organization_id) OR
    public.is_staff() OR
    public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 9. NOTIFICATIONS POLICIES
-- Rule: Users can view and update their own notifications.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Notifications user view own" ON public.notifications;
CREATE POLICY "Notifications user view own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Notifications insert by system or staff" ON public.notifications;
CREATE POLICY "Notifications insert by system or staff"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications update own status" ON public.notifications;
CREATE POLICY "Notifications update own status"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. DEMAND FORECASTS POLICIES
-- Rule: Clinical staff and admins can view forecasts; models insert.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Demand forecasts viewable by authenticated users" ON public.demand_forecasts;
CREATE POLICY "Demand forecasts viewable by authenticated users"
  ON public.demand_forecasts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Demand forecasts insert by staff and admin" ON public.demand_forecasts;
CREATE POLICY "Demand forecasts insert by staff and admin"
  ON public.demand_forecasts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff() OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 11. AUDIT LOGS POLICIES
-- Rule: Users view own activity; Admins view all; Immutable append-only.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Audit logs viewable by actor or admin" ON public.audit_logs;
CREATE POLICY "Audit logs viewable by actor or admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Audit logs insert by authenticated actions" ON public.audit_logs;
CREATE POLICY "Audit logs insert by authenticated actions"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- End of Migration
