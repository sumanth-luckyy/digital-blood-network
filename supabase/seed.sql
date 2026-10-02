-- ==============================================================================
-- BloodLink — Digital Blood Donation Emergency Network (India Edition)
-- Synthetic Demo Seed Data
-- NOTE: All data herein is strictly synthetic/demonstration data for testing workflows.
-- Conforms to Indian States, Districts, and e-RaktKosh / NHM health facility formats.
-- ==============================================================================

-- 1. PROFILES (All 5 Roles Represented)
INSERT INTO public.profiles (id, email, full_name, phone, role, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@bloodlink.demo', 'Dr. Sarah Mitchell (Platform Admin)', '+91-98480-11223', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'hospital@bloodlink.demo', 'Dr. Rajesh Rao (NIMS Trauma Lead)', '+91-94401-22334', 'hospital_staff', true),
  ('00000000-0000-0000-0000-000000000003', 'bloodbank@bloodlink.demo', 'Dr. K. Srilatha (Blood Bank Officer)', '+91-98492-33445', 'blood_bank_staff', true),
  ('00000000-0000-0000-0000-000000000004', 'donor@bloodlink.demo', 'K. Sai Krishna (O- Universal Donor)', '+91-98480-55667', 'donor', true),
  ('00000000-0000-0000-0000-000000000005', 'patient@bloodlink.demo', 'P. Venkat Rao (Emergency Caregiver)', '+91-94412-66778', 'patient', true),
  ('00000000-0000-0000-0000-000000000006', 'donor.ananya@bloodlink.demo', 'Ananya Sharma (A+ Regular Donor)', '+91-98481-22331', 'donor', true),
  ('00000000-0000-0000-0000-000000000007', 'donor.ramesh@bloodlink.demo', 'M. Ramesh Babu (B+ Platelet Champion)', '+91-98482-33442', 'donor', true),
  ('00000000-0000-0000-0000-000000000008', 'donor.swathi@bloodlink.demo', 'P. Swathi (O+ Regular Donor)', '+91-98483-44553', 'donor', true),
  ('00000000-0000-0000-0000-000000000009', 'donor.kalyan@bloodlink.demo', 'V. Kalyan Varma (A- Rare Donor)', '+91-98484-55664', 'donor', true),
  ('00000000-0000-0000-0000-000000000010', 'donor.srinivas@bloodlink.demo', 'Ch. Srinivas Rao (AB+ Plasma Donor)', '+91-98485-66775', 'donor', true),
  ('00000000-0000-0000-0000-000000000011', 'donor.harika@bloodlink.demo', 'G. Harika (O- Rare Donor)', '+91-98486-77886', 'donor', true),
  ('00000000-0000-0000-0000-000000000012', 'donor.venkat@bloodlink.demo', 'T. Venkat Subbaiah (B- Rare Donor)', '+91-98487-88997', 'donor', true)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role;

-- 2. ORGANIZATIONS (Indian Hospitals & Certified Blood Banks)
INSERT INTO public.organizations (id, name, type, license_number, address, city, state, postal_code, latitude, longitude, phone, email, verification_status, verified_at, is_public_directory)
VALUES
  -- Telangana - Hyderabad
  ('10000000-0000-0000-0000-000000000001', 'Nizam''s Institute of Medical Sciences (NIMS) [DEMO DATA]', 'hospital', 'TS-HOSP-HYD-2024-0012', 'Punjagutta Main Road, Banjara Hills', 'Hyderabad', 'Telangana', '500082', 17.4225, 78.4527, '+91-40-2348-9000', 'trauma.nims@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'blood_bank', 'TS-BB-HYD-2023-0145', 'Road No 1, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 17.4325, 78.4072, '+91-40-2355-5055', 'dispatch.cebc@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000003', 'Indian Red Cross Society Blood Centre [DEMO DATA]', 'blood_bank', 'TS-BB-HYD-2022-0089', 'Red Cross Building, Vidyanagar', 'Hyderabad', 'Telangana', '500044', 17.3970, 78.5085, '+91-40-2763-3056', 'hyd.redcross@bloodlink.demo', 'verified', now(), true),

  -- Andhra Pradesh - Vijayawada
  ('10000000-0000-0000-0000-000000000004', 'Government General Hospital (Old GGH) [DEMO DATA]', 'hospital', 'AP-HOSP-NTR-2024-0045', 'Hanumanpet, Near Railway Station', 'Vijayawada', 'Andhra Pradesh', '520003', 16.5167, 80.6558, '+91-866-257-8901', 'emergency.gghvja@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000005', 'Rotary Blood Bank Vijayawada [DEMO DATA]', 'blood_bank', 'AP-BB-NTR-2023-0098', 'Governorpet 5th Road', 'Vijayawada', 'Andhra Pradesh', '520002', 16.5120, 80.6275, '+91-866-243-6789', 'rotaryblood.vja@bloodlink.demo', 'verified', now(), true),

  -- Andhra Pradesh - Visakhapatnam
  ('10000000-0000-0000-0000-000000000006', 'King George Hospital (KGH) [DEMO DATA]', 'hospital', 'AP-HOSP-VSP-2023-0021', 'Maharanipeta, Collectorate Junction', 'Visakhapatnam', 'Andhra Pradesh', '530002', 17.7088, 83.3056, '+91-891-256-4891', 'trauma.kgh@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000007', 'Lions Club District Blood Centre [DEMO DATA]', 'blood_bank', 'AP-BB-VSP-2022-0114', 'Jagadamba Commercial Complex', 'Visakhapatnam', 'Andhra Pradesh', '530020', 17.7125, 83.3002, '+91-891-274-5678', 'lionsblood.vizag@bloodlink.demo', 'verified', now(), true),

  -- Andhra Pradesh - Guntur
  ('10000000-0000-0000-0000-000000000008', 'Government General Hospital Guntur [DEMO DATA]', 'hospital', 'AP-HOSP-GNT-2024-0067', 'Opp. Collector Office, Sambasiva Pet', 'Guntur', 'Andhra Pradesh', '522004', 16.3067, 80.4365, '+91-863-222-3456', 'ggh.guntur@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000009', 'Red Cross Voluntary Blood Centre [DEMO DATA]', 'blood_bank', 'AP-BB-GNT-2023-0052', 'Kothapet Road, Near Medical College', 'Guntur', 'Andhra Pradesh', '522001', 16.3020, 80.4420, '+91-863-235-6789', 'redcross.guntur@bloodlink.demo', 'verified', now(), true),

  -- Andhra Pradesh - Eluru
  ('10000000-0000-0000-0000-000000000010', 'Government District Teaching Hospital Eluru [DEMO DATA]', 'hospital', 'AP-HOSP-ELR-2024-0081', 'Sanivarapupeta Road, Near Asram Area', 'Eluru', 'Andhra Pradesh', '534005', 16.7107, 81.0952, '+91-8812-230-123', 'districthospital.eluru@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000011', 'Eluru District Red Cross Blood Centre [DEMO DATA]', 'blood_bank', 'AP-BB-ELR-2023-0033', 'Powerpet Main Road', 'Eluru', 'Andhra Pradesh', '534002', 16.7150, 81.1020, '+91-8812-245-890', 'elururedcross@bloodlink.demo', 'verified', now(), true),

  -- Andhra Pradesh - Tirupati
  ('10000000-0000-0000-0000-000000000012', 'SVIMS Super Speciality Hospital [DEMO DATA]', 'hospital', 'AP-HOSP-TPT-2023-0019', 'Alipiri Road', 'Tirupati', 'Andhra Pradesh', '517507', 13.6373, 79.4057, '+91-877-228-7777', 'svims.emergency@bloodlink.demo', 'verified', now(), true),

  -- Delhi NCR
  ('10000000-0000-0000-0000-000000000013', 'AIIMS Main Hospital New Delhi [DEMO DATA]', 'hospital', 'DL-HOSP-DEL-2022-0001', 'Ansari Nagar East, Ring Road', 'Delhi', 'Delhi', '110029', 28.5672, 77.2100, '+91-11-2658-8500', 'trauma.aiims@bloodlink.demo', 'verified', now(), true),
  ('10000000-0000-0000-0000-000000000014', 'Rotary Blood Bank Tughlakabad [DEMO DATA]', 'blood_bank', 'DL-BB-DEL-2023-0015', '56-57 Tughlakabad Institutional Area', 'Delhi', 'Delhi', '110062', 28.5135, 77.2625, '+91-11-2995-5800', 'rotaryblood.delhi@bloodlink.demo', 'verified', now(), true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  verification_status = EXCLUDED.verification_status;

-- 3. ORGANIZATION MEMBERSHIPS
INSERT INTO public.organization_members (organization_id, user_id, member_role, is_active)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'admin', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'admin', true)
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. DONOR PROFILES (All 8 Blood Groups: O-, A+, B+, AB+, O+, A-, B-, AB- across AP, Telangana, and Delhi)
INSERT INTO public.donor_profiles (id, user_id, blood_group, date_of_birth, gender, city, area, latitude, longitude, travel_radius_km, is_available, consent_emergency_alerts, consent_share_approx_location, last_donation_date, next_eligible_date, total_donations, reward_points, badges)
VALUES
  -- Hyderabad Donors
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'O-', '1992-05-14', 'male', 'Hyderabad', 'Banjara Hills', 17.4180, 78.4350, 25, true, true, true, CURRENT_DATE - INTERVAL '95 days', CURRENT_DATE, 12, 1450, '[{"name": "Universal Savior (O-)", "tier": "gold", "icon": "shield"}, {"name": "10+ Donations Milestone", "tier": "platinum", "icon": "award"}]'::jsonb),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'A+', '1995-11-20', 'female', 'Hyderabad', 'Kondapur / Hitec City', 17.4650, 78.3650, 20, true, true, true, CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE, 5, 600, '[{"name": "Regular Lifesaver", "tier": "silver", "icon": "heart"}]'::jsonb),

  -- Vijayawada Donors
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007', 'B+', '1989-03-08', 'male', 'Vijayawada', 'Governorpet', 16.5150, 80.6350, 30, true, true, true, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days', 8, 950, '[{"name": "Platelet Champion", "tier": "gold", "icon": "zap"}]'::jsonb),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', 'O+', '1994-08-12', 'female', 'Vijayawada', 'Gunadala', 16.5210, 80.6650, 25, true, true, true, CURRENT_DATE - INTERVAL '70 days', CURRENT_DATE, 6, 750, '[{"name": "Community Pillar", "tier": "silver", "icon": "shield"}]'::jsonb),

  -- Visakhapatnam Donor
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000009', 'A-', '1993-02-17', 'male', 'Visakhapatnam', 'MVP Colony Sector 3', 17.7380, 83.3320, 20, true, true, true, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE, 7, 880, '[{"name": "Rare Blood Hero (A-)", "tier": "gold", "icon": "shield"}]'::jsonb),

  -- Guntur Donor
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000010', 'AB+', '1990-11-04', 'male', 'Guntur', 'Brodipet 4th Lane', 16.3120, 80.4280, 25, true, true, true, CURRENT_DATE - INTERVAL '80 days', CURRENT_DATE, 4, 490, '[{"name": "Plasma Provider", "tier": "bronze", "icon": "droplet"}]'::jsonb),

  -- Eluru Donors
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000011', 'O-', '1996-09-22', 'female', 'Eluru', 'Powerpet', 16.7140, 81.1040, 20, true, true, true, CURRENT_DATE - INTERVAL '85 days', CURRENT_DATE, 3, 420, '[{"name": "Universal Savior (O-)", "tier": "silver", "icon": "shield"}]'::jsonb),
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000012', 'B-', '1991-04-18', 'male', 'Eluru', 'Sanivarapupeta', 16.7090, 81.0920, 25, true, true, true, CURRENT_DATE - INTERVAL '105 days', CURRENT_DATE, 6, 710, '[{"name": "Rare Hero (B-)", "tier": "gold", "icon": "shield"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  is_available = EXCLUDED.is_available,
  total_donations = EXCLUDED.total_donations;

-- 5. BLOOD REQUESTS (Indian Emergency Telemetry)
INSERT INTO public.blood_requests (id, request_code, requester_id, patient_name, hospital_id, hospital_name, blood_group, blood_component, units_needed, units_fulfilled, urgency, needed_by, city, area, hospital_room_or_doctor, contact_phone, medical_notes, verification_status, verified_by, verified_at, status)
VALUES
  (
    '30000000-0000-0000-0000-000000000001', 'REQ-2026-HYD-01', '00000000-0000-0000-0000-000000000005',
    'G. Lakshmi [DEMO DATA]', '10000000-0000-0000-0000-000000000001', 'Nizam''s Institute of Medical Sciences (NIMS) [DEMO DATA]',
    'O-', 'Red Blood Cells', 3, 1, 'critical', now() + INTERVAL '6 hours',
    'Hyderabad', 'Punjagutta ICU Bed 12', 'Cardiothoracic ICU / Dr. Rao', '+91-94412-66778',
    'Emergency aortic aneurysm repair. Immediate crossmatched O- required.',
    'verified', '00000000-0000-0000-0000-000000000002', now() - INTERVAL '1 hour', 'matching'
  ),
  (
    '30000000-0000-0000-0000-000000000002', 'REQ-2026-VJA-02', '00000000-0000-0000-0000-000000000005',
    'M. Venkatesh [DEMO DATA]', '10000000-0000-0000-0000-000000000004', 'Government General Hospital (Old GGH) [DEMO DATA]',
    'A+', 'Platelets', 2, 2, 'high', now() + INTERVAL '24 hours',
    'Vijayawada', 'Oncology Ward 3B', 'Haematology Unit / Dr. Prasad', '+91-94412-66778',
    'Chemotherapy recovery platelet replacement support.',
    'verified', '00000000-0000-0000-0000-000000000002', now() - INTERVAL '5 hours', 'fulfilled'
  ),
  (
    '30000000-0000-0000-0000-000000000003', 'REQ-2026-VSP-03', '00000000-0000-0000-0000-000000000005',
    'Ch. Anitha [DEMO DATA]', '10000000-0000-0000-0000-000000000006', 'King George Hospital (KGH) [DEMO DATA]',
    'B+', 'Whole Blood', 2, 0, 'high', now() + INTERVAL '18 hours',
    'Visakhapatnam', 'Obstetrics & Gynaecology Wing', 'Labour Room 2 / Dr. Sailaja', '+91-94412-66778',
    'High-risk postpartum haemorrhage resuscitation standby.',
    'verified', '00000000-0000-0000-0000-000000000002', now() - INTERVAL '2 hours', 'matching'
  ),
  (
    '30000000-0000-0000-0000-000000000004', 'REQ-2026-ELR-04', '00000000-0000-0000-0000-000000000005',
    'B. Subba Rao [DEMO DATA]', '10000000-0000-0000-0000-000000000010', 'Government District Teaching Hospital Eluru [DEMO DATA]',
    'B-', 'Red Blood Cells', 2, 0, 'critical', now() + INTERVAL '12 hours',
    'Eluru', 'Emergency Trauma Ward', 'Casualty Bed 4 / Duty Surgeon', '+91-94412-66778',
    'National Highway polytrauma severe blood loss emergency stabilization.',
    'verified', '00000000-0000-0000-0000-000000000002', now() - INTERVAL '30 minutes', 'matching'
  )
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  verification_status = EXCLUDED.verification_status;

-- 6. BLOOD STOCK (Covering all 8 blood groups in Indian Blood Banks)
INSERT INTO public.blood_stock (id, organization_id, organization_name, batch_number, blood_group, blood_component, units_available, units_reserved, low_stock_threshold, critical_stock_threshold, collected_date, expiry_date, storage_location, status, is_sample_data, last_updated)
VALUES
  -- Chiranjeevi Blood Bank Hyderabad
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-O-POS-201', 'O+', 'Whole Blood', 22, 3, 5, 2, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '25 days', 'Chamber TS-A1', 'available', true, now()),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-O-NEG-202', 'O-', 'Red Blood Cells', 3, 1, 5, 2, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '20 days', 'Chamber TS-A3', 'available', true, now()), -- LOW STOCK
  ('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-A-POS-203', 'A+', 'Platelets', 8, 0, 5, 2, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '3 days', 'Platelet Agitator 1', 'available', true, now()),
  ('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-A-NEG-204', 'A-', 'Whole Blood', 2, 0, 5, 2, CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '27 days', 'Chamber TS-B1', 'available', true, now()), -- CRITICAL STOCK (<= 2)
  ('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-B-POS-205', 'B+', 'Fresh Frozen Plasma', 15, 1, 5, 2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 'Deep Freeze -40C Bay 1', 'available', true, now()),
  ('50000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-B-NEG-206', 'B-', 'Red Blood Cells', 1, 0, 5, 2, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '30 days', 'Chamber TS-B2', 'available', true, now()), -- CRITICAL STOCK (<= 2)
  ('50000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-AB-POS-207', 'AB+', 'Fresh Frozen Plasma', 11, 0, 5, 2, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '350 days', 'Deep Freeze -40C Bay 2', 'available', true, now()),
  ('50000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', 'Chiranjeevi Eye & Blood Centre [DEMO DATA]', 'CEBC-AB-NEG-208', 'AB-', 'Whole Blood', 2, 0, 5, 2, CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '29 days', 'Chamber TS-B3', 'available', true, now()), -- CRITICAL STOCK (<= 2)

  -- Rotary Blood Bank Vijayawada
  ('50000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Rotary Blood Bank Vijayawada [DEMO DATA]', 'VJA-ROTARY-OPOS-301', 'O+', 'Whole Blood', 14, 2, 5, 2, CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE + INTERVAL '26 days', 'Rack AP-1', 'available', true, now()),
  ('50000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Rotary Blood Bank Vijayawada [DEMO DATA]', 'VJA-ROTARY-ONEG-302', 'O-', 'Red Blood Cells', 2, 1, 5, 2, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '28 days', 'Rack AP-2', 'available', true, now()), -- CRITICAL STOCK (<= 2)

  -- Eluru District Red Cross Blood Bank
  ('50000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000011', 'Eluru District Red Cross Blood Centre [DEMO DATA]', 'ELR-RC-BNEG-401', 'B-', 'Red Blood Cells', 1, 0, 5, 2, CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '31 days', 'Eluru Unit 1', 'available', true, now()) -- CRITICAL STOCK (<= 2)
ON CONFLICT (organization_id, batch_number) DO UPDATE SET
  units_available = EXCLUDED.units_available,
  units_reserved = EXCLUDED.units_reserved,
  last_updated = now();

-- 7. DONOR MATCHES (Transparent scoring: 50% Proximity, 30% Availability, 20% Response Suitability)
INSERT INTO public.donor_matches (id, request_id, donor_id, match_score, match_reasons, distance_km, outreach_status, outreach_batch, sent_at)
VALUES
  (
    '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
    97.50, '[{"factor": "Proximity (50% max)", "points": 48.5, "max": 50, "details": "~2.1 km from NIMS Punjagutta"}, {"factor": "Availability (30% max)", "points": 30.0, "max": 30, "details": "Active for emergency outreach"}, {"factor": "Response Suitability (20% max)", "points": 19.0, "max": 20, "details": "12 successful verified donations completed"}]'::jsonb,
    2.10, 'sent', 1, now() - INTERVAL '40 minutes'
  )
ON CONFLICT (id) DO UPDATE SET
  match_score = EXCLUDED.match_score,
  outreach_status = EXCLUDED.outreach_status;

-- 8. COMPLETED DONATIONS
INSERT INTO public.donations (id, donor_id, request_id, organization_id, donation_date, units_donated, blood_component, screening_status, certificate_url)
VALUES
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '95 days', 1, 'Whole Blood', 'passed', null),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '60 days', 2, 'Platelets', 'passed', null)
ON CONFLICT (id) DO NOTHING;

-- 9. NOTIFICATIONS
INSERT INTO public.notifications (id, user_id, type, title, message, link, is_read, created_at)
VALUES
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'match_invite', 'Emergency O- Request: NIMS Hospital Hyderabad', 'Urgent need for 3 units of O- Red Blood Cells for cardiac emergency in Punjagutta (~2.1 km).', '/donor/invitations', false, now() - INTERVAL '38 minutes'),
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'emergency_request', 'Emergency Request Submitted: REQ-2026-ELR-04 (Eluru)', 'National Highway trauma emergency: 2 units of B- Red Blood Cells requested at Eluru District Hospital.', '/hospital/requests/30000000-0000-0000-0000-000000000004', false, now() - INTERVAL '20 minutes'),
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'stock_alert', 'Critical Stock Warning: O- & B- Reserves Low', 'Current reserves for O- and B- are below safety threshold (≤2 units) at Chiranjeevi Blood Bank & Eluru Red Cross.', '/blood-bank/inventory', false, now() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 10. DEMAND FORECASTS (Predictive Analytics Synthetic Sample for Indian Blood Centers)
INSERT INTO public.demand_forecasts (id, organization_id, blood_group, blood_component, forecast_date, forecast_units, lower_bound, upper_bound, risk_level, model_version, is_synthetic)
VALUES
  ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 1, 4.5, 3.2, 5.8, 'high', 'Ridge-TimeSeries-Demo-1.0', true),
  ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 2, 5.1, 3.8, 6.4, 'high', 'Ridge-TimeSeries-Demo-1.0', true),
  ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 3, 4.8, 3.5, 6.1, 'high', 'Ridge-TimeSeries-Demo-1.0', true),
  ('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 4, 3.9, 2.7, 5.2, 'moderate', 'Ridge-TimeSeries-Demo-1.0', true),
  ('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 5, 4.2, 2.9, 5.5, 'moderate', 'Ridge-TimeSeries-Demo-1.0', true),
  ('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 6, 3.0, 1.8, 4.2, 'low', 'Ridge-TimeSeries-Demo-1.0', true),
  ('80000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'O-', 'Red Blood Cells', CURRENT_DATE + 7, 2.8, 1.6, 4.0, 'low', 'Ridge-TimeSeries-Demo-1.0', true)
ON CONFLICT (id) DO NOTHING;

-- 11. AUDIT LOGS
INSERT INTO public.audit_logs (id, actor_id, action, resource_type, resource_id, details)
VALUES
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ORGANIZATION_VERIFIED', 'organization', '10000000-0000-0000-0000-000000000001', '{"name": "Nizam''s Institute of Medical Sciences", "license": "TS-HOSP-HYD-2024-0012"}'::jsonb),
  ('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'REQUEST_VERIFIED', 'blood_request', '30000000-0000-0000-0000-000000000001', '{"request_code": "REQ-2026-HYD-01", "urgency": "critical", "blood_group": "O-"}'::jsonb),
  ('90000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'STOCK_BATCH_ADDED', 'blood_stock', '50000000-0000-0000-0000-000000000001', '{"batch_number": "CEBC-O-POS-201", "units": 22, "blood_group": "O+"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
