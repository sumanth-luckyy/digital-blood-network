// Supabase Edge Function: send-notification
// Logs in-app notification and sends optional Web Push

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, type, title, message, link, metadata } = await req.json();

    if (!userId || !title || !message) {
      return new Response(JSON.stringify({ error: 'userId, title, and message are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: type || 'system',
        title,
        message,
        link: link || null,
        metadata: metadata || {},
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, notification: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
