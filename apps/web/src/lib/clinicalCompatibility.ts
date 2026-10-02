import { BloodGroup, BloodComponent, DonorProfile, BloodRequest, DonorMatch, MatchReason } from '../types';

export const RBC_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal RBC donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Can only donate RBCs to AB+
};

export const PLASMA_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'], // Universal plasma donor
  'AB-': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A+', 'A-', 'O+', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B+', 'B-', 'O+', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O+', 'O-'],
};

export function checkClinicalCompatibility(
  donorGroup: BloodGroup,
  recipientGroup: BloodGroup,
  component: BloodComponent = 'Whole Blood'
): boolean {
  if (component === 'Fresh Frozen Plasma') {
    const compatibleRecipients = PLASMA_COMPATIBILITY_MAP[donorGroup] || [];
    return compatibleRecipients.includes(recipientGroup);
  }
  // Default to RBC compatibility for Whole Blood, Platelets, Cryoprecipitate, Red Blood Cells
  const compatibleRecipients = RBC_COMPATIBILITY_MAP[donorGroup] || [];
  return compatibleRecipients.includes(recipientGroup);
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function rankCandidateDonorsLocally(
  request: BloodRequest,
  donors: DonorProfile[]
): DonorMatch[] {
  const matches: DonorMatch[] = [];

  for (const donor of donors) {
    // 1. Hard clinical compatibility filter (Non-negotiable)
    if (!checkClinicalCompatibility(donor.blood_group, request.blood_group, request.blood_component)) {
      continue;
    }

    // 2. Availability filter
    if (!donor.is_available) {
      continue;
    }

    // 3. Approximate distance calculation
    const reqLat = 40.7128;
    const reqLon = -74.0060;
    const dLat = donor.latitude || 40.7150;
    const dLon = donor.longitude || -74.0020;
    const distanceKm = calculateDistanceKm(reqLat, reqLon, dLat, dLon);

    if (distanceKm > donor.travel_radius_km) {
      continue;
    }

    // 4. Prototype Matching Score: 50% Proximity, 30% Availability, 20% Response Suitability
    // Proximity (0-50 pts)
    const proximityScore = Math.max(
      5,
      Math.round(50 * (1 - distanceKm / Math.max(donor.travel_radius_km, 1)))
    );

    // Availability (0-30 pts)
    const availabilityScore = donor.is_available ? 30 : 0;

    // Response Suitability / Track Record (0-20 pts)
    const suitabilityScore = Math.min(20, Math.round(10 + Math.min(donor.total_donations, 5) * 2));

    const totalScore = Math.round(proximityScore + availabilityScore + suitabilityScore);

    const reasons: MatchReason[] = [
      {
        factor: 'Proximity (50% max weight)',
        points: proximityScore,
        max: 50,
        details: `~${distanceKm} km away (within ${donor.travel_radius_km} km radius)`,
      },
      {
        factor: 'Availability (30% max weight)',
        points: availabilityScore,
        max: 30,
        details: 'Confirmed active and consented for emergency alerts',
      },
      {
        factor: 'Response Suitability (20% max weight)',
        points: suitabilityScore,
        max: 20,
        details: `${donor.total_donations} verified prior donations completed`,
      },
    ];

    matches.push({
      id: `match-${donor.id}-${request.id}`,
      request_id: request.id,
      donor_id: donor.id,
      donor_name: donor.donor_name || 'Volunteer Donor',
      donor_blood_group: donor.blood_group,
      donor_city: donor.city,
      match_score: totalScore,
      match_reasons: reasons,
      distance_km: distanceKm,
      outreach_status: 'queued',
      outreach_batch: 1,
      created_at: new Date().toISOString(),
    });
  }

  // Sort descending by prototype match score
  return matches.sort((a, b) => b.match_score - a.match_score);
}
