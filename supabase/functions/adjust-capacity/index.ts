// 2-B Adjust-Capacity Edge Function
// Dynamically adjusts daily capacity based on brain state and burnout flags

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AdjustCapacityRequest {
  energy_units: number
  brain_mode: 'Normal' | 'Fog' | 'Shutdown'
  burnout_flags: string[]
}

interface AdjustCapacityResponse {
  capacity: number
  adjustments: {
    original_energy: number
    brain_mode_adjustment: number
    burnout_adjustment: number
    final_capacity: number
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { energy_units, brain_mode, burnout_flags }: AdjustCapacityRequest = await req.json()

    // Validate inputs
    if (typeof energy_units !== 'number' || energy_units < 0 || energy_units > 10) {
      return new Response(
        JSON.stringify({ error: 'energy_units must be a number between 0 and 10' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['Normal', 'Fog', 'Shutdown'].includes(brain_mode)) {
      return new Response(
        JSON.stringify({ error: 'brain_mode must be Normal, Fog, or Shutdown' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(burnout_flags)) {
      return new Response(
        JSON.stringify({ error: 'burnout_flags must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2-B Adjust-Capacity Logic (from original code)
    let capacity = energy_units
    let brain_mode_adjustment = 0
    let burnout_adjustment = 0

    // Brain mode adjustments
    if (brain_mode === 'Fog') {
      brain_mode_adjustment = -2
      capacity -= 2
    } else if (brain_mode === 'Shutdown') {
      brain_mode_adjustment = -4
      capacity -= 4
    }

    // Burnout flags adjustment
    if (burnout_flags.length >= 3) {
      burnout_adjustment = -3
      capacity -= 3
    }

    // Ensure capacity stays within bounds (0-10)
    capacity = Math.max(0, Math.min(10, capacity))

    // Prepare adjustment history entry
    const adjustment_entry = {
      timestamp: new Date().toISOString(),
      original_energy: energy_units,
      brain_mode,
      brain_mode_adjustment,
      burnout_flags: burnout_flags,
      burnout_flag_count: burnout_flags.length,
      burnout_adjustment,
      final_capacity: capacity
    }

    // Update or insert daily check record
    const { data: dailyCheck, error: upsertError } = await supabaseClient
      .from('daily_check')
      .upsert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0], // Today's date
        energy_units,
        brain_mode,
        burnout_flags,
        capacity_today: capacity,
        capacity_adjustments: [adjustment_entry], // Store adjustment history
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      })
      .select('*')
      .single()

    if (upsertError) {
      console.error('Database upsert error:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to update capacity', details: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare response
    const response: AdjustCapacityResponse = {
      capacity,
      adjustments: {
        original_energy: energy_units,
        brain_mode_adjustment,
        burnout_adjustment,
        final_capacity: capacity
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Adjust capacity error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})