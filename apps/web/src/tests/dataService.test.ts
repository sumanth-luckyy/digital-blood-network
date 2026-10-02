import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '../lib/dataService';
import { appStorage } from '../lib/storage';
import { BloodRequest, DonorProfile, BloodStockBatch } from '../types';
import { rankCandidateDonorsLocally, checkClinicalCompatibility } from '../lib/clinicalCompatibility';

describe('DataService and Smart Donor Matching Workflow', () => {
  beforeEach(() => {
    appStorage.resetToDemo();
  });

  it('successfully creates an emergency blood request and logs audit event', async () => {
    const initialReqs = dataService.getRequests().length;
    const initialLogs = dataService.getAuditLogs().length;

    const testReq: BloodRequest = {
      id: `req-unit-test-${Date.now()}`,
      request_code: 'REQ-2026-TEST-99',
      requester_id: 'user-patient',
      patient_name: 'Elena Gilbert',
      hospital_id: '10000000-0000-0000-0000-000000000001',
      hospital_name: 'City Central Trauma Hospital',
      blood_group: 'O-',
      blood_component: 'Red Blood Cells',
      units_needed: 3,
      units_fulfilled: 0,
      urgency: 'critical',
      needed_by: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      city: 'New York',
      contact_phone: '+1-555-0199',
      verification_status: 'pending',
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const created = await dataService.createBloodRequest(testReq, 'Emergency Triage Nurse');

    expect(created.id).toBe(testReq.id);
    expect(dataService.getRequests().length).toBe(initialReqs + 1);
    expect(dataService.getAuditLogs().length).toBeGreaterThan(initialLogs);
  });

  it('ranks donors using transparent 50% proximity, 30% availability, 20% suitability formula', () => {
    const mockRequest: BloodRequest = {
      id: 'req-scoring-test',
      request_code: 'REQ-SCORE-01',
      requester_id: 'user-patient',
      patient_name: 'Test Scoring Patient',
      hospital_name: 'City Central Trauma Hospital',
      blood_group: 'O+',
      blood_component: 'Whole Blood',
      units_needed: 2,
      units_fulfilled: 0,
      urgency: 'high',
      needed_by: new Date().toISOString(),
      city: 'New York',
      contact_phone: '+1-555-0000',
      verification_status: 'verified',
      status: 'matching',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockDonors: DonorProfile[] = [
      {
        id: 'donor-1',
        user_id: 'user-1',
        donor_name: 'Close Active Donor (O-)',
        blood_group: 'O-',
        city: 'New York',
        latitude: 40.7130, // ~0.1 km away
        longitude: -74.0060,
        travel_radius_km: 25,
        is_available: true,
        consent_emergency_alerts: true,
        consent_share_approx_location: true,
        total_donations: 10,
        reward_points: 1000,
        badges: [],
      },
      {
        id: 'donor-2',
        user_id: 'user-2',
        donor_name: 'Incompatible Donor (AB+)',
        blood_group: 'AB+', // Incompatible with O+ recipient
        city: 'New York',
        latitude: 40.7130,
        longitude: -74.0060,
        travel_radius_km: 25,
        is_available: true,
        consent_emergency_alerts: true,
        consent_share_approx_location: true,
        total_donations: 20,
        reward_points: 2000,
        badges: [],
      },
      {
        id: 'donor-3',
        user_id: 'user-3',
        donor_name: 'Unavailable Donor (O+)',
        blood_group: 'O+',
        city: 'New York',
        latitude: 40.7130,
        longitude: -74.0060,
        travel_radius_km: 25,
        is_available: false, // Unavailable
        consent_emergency_alerts: true,
        consent_share_approx_location: true,
        total_donations: 5,
        reward_points: 500,
        badges: [],
      },
    ];

    const matches = rankCandidateDonorsLocally(mockRequest, mockDonors);

    // Only donor-1 should qualify (donor-2 incompatible, donor-3 unavailable)
    expect(matches.length).toBe(1);
    expect(matches[0].donor_id).toBe('donor-1');
    expect(matches[0].match_score).toBeGreaterThan(80);

    const reasons = matches[0].match_reasons;
    expect(reasons.some((r) => r.factor.includes('Proximity (50%'))).toBe(true);
    expect(reasons.some((r) => r.factor.includes('Availability (30%'))).toBe(true);
    expect(reasons.some((r) => r.factor.includes('Response Suitability (20%'))).toBe(true);
  });

  it('updates blood stock units and records stock transaction', async () => {
    const stock = dataService.getStock();
    const targetBatch = stock[0];
    expect(targetBatch).toBeDefined();

    const previousAvailable = targetBatch.units_available;
    const previousReserved = targetBatch.units_reserved;

    await dataService.updateStockBatchUnits(
      targetBatch.id,
      previousAvailable - 2,
      previousReserved + 2,
      'Test Lab Scientist'
    );

    const updated = dataService.getStock().find((b) => b.id === targetBatch.id);
    expect(updated?.units_available).toBe(previousAvailable - 2);
    expect(updated?.units_reserved).toBe(previousReserved + 2);
  });

  it('processes donor match acceptance and updates blood request status', async () => {
    const matches = dataService.getMatches();
    const testMatch = matches[0];
    expect(testMatch).toBeDefined();

    await dataService.respondToMatch(testMatch.id, 'accepted', 'Marcus Chen');

    const updatedMatch = dataService.getMatches().find((m) => m.id === testMatch.id);
    expect(updatedMatch?.outreach_status).toBe('accepted');
    expect(updatedMatch?.responded_at).toBeDefined();

    const relatedReq = dataService.getRequests().find((r) => r.id === testMatch.request_id);
    if (relatedReq) {
      expect(relatedReq.status).toBe('donor_response_received');
    }
  });
});
