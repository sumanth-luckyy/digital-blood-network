import { describe, it, expect } from 'vitest';
import {
  checkClinicalCompatibility,
  calculateDistanceKm,
  rankCandidateDonorsLocally,
} from '../lib/clinicalCompatibility';
import { BloodRequest, DonorProfile } from '../types';

describe('Clinical Transfusion Compatibility Rules', () => {
  it('correctly validates Universal O- Red Blood Cell donor', () => {
    expect(checkClinicalCompatibility('O-', 'AB+', 'Red Blood Cells')).toBe(true);
    expect(checkClinicalCompatibility('O-', 'O-', 'Red Blood Cells')).toBe(true);
    expect(checkClinicalCompatibility('O-', 'A+', 'Whole Blood')).toBe(true);
    expect(checkClinicalCompatibility('O-', 'B-', 'Red Blood Cells')).toBe(true);
  });

  it('correctly forbids incompatible Red Blood Cell transfusions', () => {
    expect(checkClinicalCompatibility('A+', 'O-', 'Red Blood Cells')).toBe(false);
    expect(checkClinicalCompatibility('A+', 'B+', 'Red Blood Cells')).toBe(false);
    expect(checkClinicalCompatibility('AB+', 'A+', 'Red Blood Cells')).toBe(false);
    expect(checkClinicalCompatibility('AB+', 'AB+', 'Red Blood Cells')).toBe(true);
  });

  it('correctly validates reverse ABO rules for Fresh Frozen Plasma', () => {
    expect(checkClinicalCompatibility('AB+', 'O+', 'Fresh Frozen Plasma')).toBe(true);
    expect(checkClinicalCompatibility('AB+', 'A-', 'Fresh Frozen Plasma')).toBe(true);
    expect(checkClinicalCompatibility('O+', 'AB+', 'Fresh Frozen Plasma')).toBe(false);
  });
});

describe('Geographic Distance Calculation', () => {
  it('accurately computes Haversine distance in kilometers', () => {
    const dist = calculateDistanceKm(40.7128, -74.006, 40.7061, -73.9969);
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(3.0);
  });
});

describe('Smart Donor Matching Prototype (50% Proximity, 30% Availability, 20% Response Suitability)', () => {
  it('filters out clinically incompatible and unavailable donors', () => {
    const mockRequest: BloodRequest = {
      id: 'req-test',
      request_code: 'REQ-TEST-001',
      requester_id: 'user-1',
      patient_name: 'Test Patient',
      hospital_name: 'Test Hospital',
      blood_group: 'A+',
      blood_component: 'Red Blood Cells',
      units_needed: 2,
      units_fulfilled: 0,
      urgency: 'high',
      needed_by: '2026-10-02T12:00:00Z',
      city: 'New York',
      contact_phone: '+1-555-0000',
      verification_status: 'verified',
      status: 'matching',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockDonors: DonorProfile[] = [
      {
        id: 'donor-incompatible',
        user_id: 'user-d1',
        donor_name: 'Incompatible B+ Donor',
        blood_group: 'B+',
        city: 'New York',
        latitude: 40.713,
        longitude: -74.006,
        travel_radius_km: 25,
        is_available: true,
        consent_emergency_alerts: true,
        consent_share_approx_location: true,
        total_donations: 10,
        reward_points: 1000,
        badges: [],
      },
      {
        id: 'donor-compatible',
        user_id: 'user-d2',
        donor_name: 'Compatible A+ Donor',
        blood_group: 'A+',
        city: 'New York',
        latitude: 40.714,
        longitude: -74.005,
        travel_radius_km: 25,
        is_available: true,
        consent_emergency_alerts: true,
        consent_share_approx_location: true,
        total_donations: 8,
        reward_points: 800,
        badges: [],
      },
      {
        id: 'donor-unavailable',
        user_id: 'user-d3',
        donor_name: 'Unavailable Donor',
        blood_group: 'A+',
        city: 'New York',
        latitude: 40.714,
        longitude: -74.005,
        travel_radius_km: 25,
        is_available: false,
        consent_emergency_alerts: true,
        consent_share_approx_location: true,
        total_donations: 5,
        reward_points: 500,
        badges: [],
      },
    ];

    const ranked = rankCandidateDonorsLocally(mockRequest, mockDonors);

    expect(ranked.length).toBe(1);
    expect(ranked[0].donor_id).toBe('donor-compatible');
    expect(ranked[0].match_score).toBeGreaterThan(80);
    expect(ranked[0].match_reasons.length).toBe(3);
    expect(ranked[0].match_reasons[0].factor).toContain('50%');
  });
});
