import { supabase, isSupabaseConfigured } from './supabase';
import { appStorage } from './storage';
import {
  BloodRequest,
  DonorMatch,
  BloodStockBatch,
  NotificationItem,
  AuditLogItem,
  DonorProfile,
  Organization,
  UserProfile,
  UserRole,
  BloodGroup,
} from '../types';
import { rankCandidateDonorsLocally } from './clinicalCompatibility';
import { requestDonorRanking } from './aiServiceClient';

/**
 * Event emitter for real-time reactivity across components
 */
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribeToDataChanges(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyDataChanged() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error in data change listener', e);
    }
  });
}

// Setup Supabase Realtime channel if configured
if (isSupabaseConfigured) {
  try {
    const channel = supabase
      .channel('bloodlink-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_requests' },
        (payload) => {
          console.log('[Supabase Realtime] blood_requests change:', payload);
          dataService.syncFromSupabase().then(notifyDataChanged);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blood_stock' },
        (payload) => {
          console.log('[Supabase Realtime] blood_stock change:', payload);
          dataService.syncFromSupabase().then(notifyDataChanged);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donor_matches' },
        (payload) => {
          console.log('[Supabase Realtime] donor_matches change:', payload);
          dataService.syncFromSupabase().then(notifyDataChanged);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          console.log('[Supabase Realtime] notifications change:', payload);
          dataService.syncFromSupabase().then(notifyDataChanged);
        }
      )
      .subscribe();
  } catch (err) {
    console.warn('[Supabase Realtime] Could not subscribe:', err);
  }
}

export const dataService = {
  /**
   * Sync initial data from Supabase if online
   */
  async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured) return;

    try {
      // 1. Fetch Blood Requests
      const { data: requests, error: reqErr } = await supabase
        .from('blood_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!reqErr && requests && requests.length > 0) {
        appStorage.setRequests(requests as BloodRequest[]);
      }

      // 2. Fetch Blood Stock
      const { data: stock, error: stockErr } = await supabase
        .from('blood_stock')
        .select('*')
        .order('last_updated', { ascending: false });

      if (!stockErr && stock && stock.length > 0) {
        // Map database fields to frontend interface if needed
        const mappedStock: BloodStockBatch[] = stock.map((s: any) => ({
          id: s.id,
          organization_id: s.organization_id,
          organization_name: s.organization_name,
          batch_number: s.batch_number,
          blood_group: s.blood_group,
          blood_component: s.blood_component,
          units_available: s.units_available,
          units_reserved: s.units_reserved,
          collected_date: s.collected_date,
          expiry_date: s.expiry_date,
          status: s.status,
          storage_location: s.storage_location,
          is_sample_data: s.is_sample_data ?? true,
          created_at: s.created_at,
          updated_at: s.last_updated || s.created_at,
        }));
        appStorage.setStock(mappedStock);
      }

      // 3. Fetch Matches
      const { data: matches, error: matchErr } = await supabase
        .from('donor_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (!matchErr && matches && matches.length > 0) {
        appStorage.setMatches(matches as DonorMatch[]);
      }

      // 4. Fetch Notifications
      const { data: notifs, error: notifErr } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!notifErr && notifs && notifs.length > 0) {
        appStorage.setNotifications(notifs as NotificationItem[]);
      }

      // 5. Fetch Audit Logs
      const { data: logs, error: logErr } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!logErr && logs && logs.length > 0) {
        const mappedLogs: AuditLogItem[] = logs.map((l: any) => ({
          id: l.id,
          actor_name: l.actor_id || 'System User',
          action: l.action,
          resource_type: l.resource_type,
          resource_id: l.resource_id,
          details: l.details || {},
          created_at: l.created_at,
        }));
        appStorage.setAuditLogs(mappedLogs);
      }

      // 6. Fetch Organizations (Hospitals & Blood Banks)
      const { data: orgs, error: orgErr } = await supabase
        .from('organizations')
        .select('*');

      if (!orgErr && orgs && orgs.length > 0) {
        appStorage.setOrganizations(orgs as Organization[]);
      }

      // 7. Fetch Donor Profiles
      const { data: donors, error: donorErr } = await supabase
        .from('donor_profiles')
        .select('*');

      if (!donorErr && donors && donors.length > 0) {
        const mappedDonors: DonorProfile[] = donors.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          donor_name: d.donor_name || 'Consented Donor',
          blood_group: d.blood_group,
          date_of_birth: d.date_of_birth,
          gender: d.gender,
          city: d.city,
          area: d.area,
          latitude: d.latitude,
          longitude: d.longitude,
          travel_radius_km: d.travel_radius_km || 25,
          is_available: d.is_available ?? true,
          consent_emergency_alerts: d.consent_emergency_alerts ?? true,
          consent_share_approx_location: d.consent_share_approx_location ?? true,
          last_donation_date: d.last_donation_date,
          next_eligible_date: d.next_eligible_date,
          total_donations: d.total_donations || 0,
          reward_points: d.reward_points || 0,
          badges: d.badges || [],
        }));
        appStorage.setDonors(mappedDonors);
      }
    } catch (err) {
      console.warn('[Supabase Sync Notice] Using local memory store:', err);
    }
  },

  // ==========================================
  // BLOOD REQUESTS
  // ==========================================
  getRequests(): BloodRequest[] {
    return appStorage.getRequests();
  },

  getRequestById(id: string): BloodRequest | undefined {
    return appStorage.getRequests().find((r) => r.id === id);
  },

  async createBloodRequest(newReq: BloodRequest, actorName: string = 'Caregiver / Requester'): Promise<BloodRequest> {
    // 1. Save to local storage cache immediately
    const existing = appStorage.getRequests();
    const updated = [newReq, ...existing];
    appStorage.setRequests(updated);

    // 2. Persist to Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('blood_requests').insert({
          id: newReq.id.includes('-') && newReq.id.length === 36 ? newReq.id : undefined,
          request_code: newReq.request_code,
          requester_id: newReq.requester_id.includes('-') && newReq.requester_id.length === 36 ? newReq.requester_id : '00000000-0000-0000-0000-000000000005',
          patient_name: newReq.patient_name,
          hospital_id: newReq.hospital_id?.includes('-') && newReq.hospital_id.length === 36 ? newReq.hospital_id : '10000000-0000-0000-0000-000000000001',
          hospital_name: newReq.hospital_name,
          blood_group: newReq.blood_group,
          blood_component: newReq.blood_component,
          units_needed: newReq.units_needed,
          units_fulfilled: 0,
          urgency: newReq.urgency,
          needed_by: newReq.needed_by,
          city: newReq.city,
          area: newReq.area,
          hospital_room_or_doctor: newReq.hospital_room_or_doctor,
          contact_phone: newReq.contact_phone,
          medical_notes: newReq.medical_notes,
          verification_status: 'pending',
          status: 'submitted',
        });
      } catch (err) {
        console.warn('Supabase request insert fallback:', err);
      }
    }

    // 3. Automatically trigger Smart Donor Matching Prototype
    const donors = appStorage.getDonors();
    try {
      const matchResult = await requestDonorRanking(newReq, donors);
      if (matchResult.matches.length > 0) {
        const existingMatches = appStorage.getMatches();
        const mergedMatches = [...matchResult.matches, ...existingMatches.filter((m) => m.request_id !== newReq.id)];
        appStorage.setMatches(mergedMatches);

        if (isSupabaseConfigured) {
          try {
            const rowsToInsert = matchResult.matches.slice(0, 5).map((m) => ({
              request_id: newReq.id.includes('-') && newReq.id.length === 36 ? newReq.id : '30000000-0000-0000-0000-000000000001',
              donor_id: '20000000-0000-0000-0000-000000000001',
              match_score: m.match_score,
              match_reasons: m.match_reasons,
              distance_km: m.distance_km || 2.5,
              outreach_status: 'queued',
            }));
            await supabase.from('donor_matches').insert(rowsToInsert);
          } catch (e) {
            console.warn('Supabase match insert fallback:', e);
          }
        }
      }
    } catch (e) {
      console.warn('Auto donor matching notice:', e);
    }

    // 4. Log Audit Event
    await this.logAudit({
      actor_name: actorName,
      action: 'EMERGENCY_REQUEST_CREATED',
      resource_type: 'blood_request',
      resource_id: newReq.id,
      details: {
        code: newReq.request_code,
        group: newReq.blood_group,
        units: newReq.units_needed,
        urgency: newReq.urgency,
      },
    });

    notifyDataChanged();
    return newReq;
  },

  async updateRequest(
    requestId: string,
    updates: Partial<BloodRequest>,
    actorName: string = 'Medical Coordinator'
  ): Promise<void> {
    const all = appStorage.getRequests();
    const updated = all.map((r) => (r.id === requestId ? { ...r, ...updates, updated_at: new Date().toISOString() } : r));
    appStorage.setRequests(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('blood_requests')
          .update(updates)
          .eq('id', requestId);
      } catch (err) {
        console.warn('Supabase request update fallback:', err);
      }
    }

    await this.logAudit({
      actor_name: actorName,
      action: 'BLOOD_REQUEST_UPDATED',
      resource_type: 'blood_request',
      resource_id: requestId,
      details: updates,
    });

    notifyDataChanged();
  },

  // ==========================================
  // SMART DONOR MATCHING
  // ==========================================
  getMatches(): DonorMatch[] {
    return appStorage.getMatches();
  },

  getMatchesForRequest(requestId: string): DonorMatch[] {
    return appStorage.getMatches().filter((m) => m.request_id === requestId);
  },

  async saveMatches(matches: DonorMatch[]): Promise<void> {
    const all = appStorage.getMatches();
    const reqIds = new Set(matches.map((m) => m.request_id));
    const merged = [...matches, ...all.filter((m) => !reqIds.has(m.request_id))];
    appStorage.setMatches(merged);

    if (isSupabaseConfigured) {
      try {
        const rows = matches.map((m) => ({
          request_id: m.request_id.includes('-') && m.request_id.length === 36 ? m.request_id : '30000000-0000-0000-0000-000000000001',
          donor_id: '20000000-0000-0000-0000-000000000001',
          match_score: m.match_score,
          match_reasons: m.match_reasons,
          distance_km: m.distance_km || 2.5,
          outreach_status: m.outreach_status,
        }));
        await supabase.from('donor_matches').upsert(rows);
      } catch (e) {
        console.warn('Supabase match upsert fallback:', e);
      }
    }

    notifyDataChanged();
  },

  async respondToMatch(
    matchId: string,
    response: 'accepted' | 'declined',
    donorName: string = 'Marcus Chen'
  ): Promise<void> {
    const allMatches = appStorage.getMatches();
    const targetMatch = allMatches.find((m) => m.id === matchId);

    const updated = allMatches.map((m) =>
      m.id === matchId
        ? {
            ...m,
            outreach_status: response,
            responded_at: new Date().toISOString(),
          }
        : m
    );
    appStorage.setMatches(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('donor_matches')
          .update({
            outreach_status: response,
            responded_at: new Date().toISOString(),
          })
          .eq('id', matchId);
      } catch (e) {
        console.warn('Supabase match response update fallback:', e);
      }
    }

    if (targetMatch) {
      const requests = appStorage.getRequests();
      const req = requests.find((r) => r.id === targetMatch.request_id);

      if (req) {
        if (response === 'accepted') {
          await this.updateRequest(req.id, {
            status: 'donor_response_received',
          }, donorName);

          await this.createNotification({
            user_id: 'user-hospital',
            type: 'invite_accepted',
            title: `Donor Accepted: ${req.request_code}`,
            message: `${donorName} has accepted emergency outreach for ${req.blood_group} (${req.blood_component}). Triage informed.`,
            link: `/hospital/requests/${req.id}`,
          });
        } else {
          await this.createNotification({
            user_id: 'user-hospital',
            type: 'invite_declined',
            title: `Donor Declined: ${req.request_code}`,
            message: `Donor declined outreach invitation. Matching engine will expand outreach queue.`,
            link: `/hospital/requests/${req.id}`,
          });
        }
      }
    }

    await this.logAudit({
      actor_name: donorName,
      action: response === 'accepted' ? 'DONOR_ACCEPTED_OUTREACH' : 'DONOR_DECLINED_OUTREACH',
      resource_type: 'donor_match',
      resource_id: matchId,
      details: { response },
    });

    notifyDataChanged();
  },

  // ==========================================
  // BLOOD STOCK INVENTORY
  // ==========================================
  getStock(): BloodStockBatch[] {
    return appStorage.getStock();
  },

  async addStockBatch(batch: BloodStockBatch, actorName: string = 'Blood Bank Director'): Promise<void> {
    const existing = appStorage.getStock();
    const updated = [batch, ...existing];
    appStorage.setStock(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('blood_stock').insert({
          organization_id: batch.organization_id.includes('-') && batch.organization_id.length === 36 ? batch.organization_id : '10000000-0000-0000-0000-000000000002',
          organization_name: batch.organization_name || 'Metro Health Blood Bank Center',
          batch_number: batch.batch_number,
          blood_group: batch.blood_group,
          blood_component: batch.blood_component,
          units_available: batch.units_available,
          units_reserved: batch.units_reserved,
          low_stock_threshold: 5,
          critical_stock_threshold: 2,
          collected_date: batch.collected_date,
          expiry_date: batch.expiry_date,
          storage_location: batch.storage_location,
          status: batch.status,
          is_sample_data: true,
          last_updated: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Supabase stock insert fallback:', err);
      }
    }

    await this.logAudit({
      actor_name: actorName,
      action: 'STOCK_BATCH_ADDED',
      resource_type: 'blood_stock',
      resource_id: batch.id,
      details: {
        batch: batch.batch_number,
        group: batch.blood_group,
        units: batch.units_available,
      },
    });

    notifyDataChanged();
  },

  async updateStockBatchUnits(
    batchId: string,
    newAvailable: number,
    newReserved: number = 0,
    actorName: string = 'Transfusion Lead'
  ): Promise<void> {
    const existing = appStorage.getStock();
    const updated = existing.map((b) =>
      b.id === batchId
        ? {
            ...b,
            units_available: Math.max(0, newAvailable),
            units_reserved: Math.max(0, newReserved),
            updated_at: new Date().toISOString(),
          }
        : b
    );
    appStorage.setStock(updated);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('blood_stock')
          .update({
            units_available: Math.max(0, newAvailable),
            units_reserved: Math.max(0, newReserved),
            last_updated: new Date().toISOString(),
          })
          .eq('id', batchId);
      } catch (e) {
        console.warn('Supabase stock unit update fallback:', e);
      }
    }

    await this.logAudit({
      actor_name: actorName,
      action: 'STOCK_UNITS_UPDATED',
      resource_type: 'blood_stock',
      resource_id: batchId,
      details: { newAvailable, newReserved },
    });

    notifyDataChanged();
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications(): NotificationItem[] {
    return appStorage.getNotifications();
  },

  async createNotification(notif: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>): Promise<void> {
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const existing = appStorage.getNotifications();
    appStorage.setNotifications([item, ...existing]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notifications').insert({
          user_id: notif.user_id.includes('-') && notif.user_id.length === 36 ? notif.user_id : '00000000-0000-0000-0000-000000000004',
          type: notif.type,
          title: notif.title,
          message: notif.message,
          link: notif.link,
          is_read: false,
        });
      } catch (e) {
        console.warn('Supabase notification insert fallback:', e);
      }
    }

    notifyDataChanged();
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  getAuditLogs(): AuditLogItem[] {
    return appStorage.getAuditLogs();
  },

  async logAudit(log: Omit<AuditLogItem, 'id' | 'created_at'>): Promise<void> {
    const newLog: AuditLogItem = {
      ...log,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };

    const existing = appStorage.getAuditLogs();
    appStorage.setAuditLogs([newLog, ...existing]);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('audit_logs').insert({
          action: log.action,
          resource_type: log.resource_type,
          resource_id: log.resource_id?.includes('-') && log.resource_id.length === 36 ? log.resource_id : undefined,
          details: log.details || {},
        });
      } catch (e) {
        console.warn('Supabase audit log fallback:', e);
      }
    }

    notifyDataChanged();
  },

  // ==========================================
  // ORGANIZATIONS & DONOR PROFILES
  // ==========================================
  getOrganizations(): Organization[] {
    return appStorage.getOrganizations();
  },

  getDonors(): DonorProfile[] {
    return appStorage.getDonors();
  },
};
