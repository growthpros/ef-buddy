import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const body: AdjustCapacityRequest = await request.json()

    // Validate input
    const { energy_units, brain_mode, burnout_flags } = body

    if (typeof energy_units !== 'number' || energy_units < 0 || energy_units > 10) {
      return NextResponse.json(
        { error: 'energy_units must be a number between 0 and 10' },
        { status: 400 }
      )
    }

    if (!['Normal', 'Fog', 'Shutdown'].includes(brain_mode)) {
      return NextResponse.json(
        { error: 'brain_mode must be Normal, Fog, or Shutdown' },
        { status: 400 }
      )
    }

    if (!Array.isArray(burnout_flags)) {
      return NextResponse.json(
        { error: 'burnout_flags must be an array' },
        { status: 400 }
      )
    }

    // For demo purposes, implement the 2-B logic locally
    // In production, this would call the Supabase Edge Function
    let capacity = energy_units
    let brain_mode_adjustment = 0
    let burnout_adjustment = 0

    // Brain mode adjustments (from 2-B Adjust-Capacity Code)
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

    const response: AdjustCapacityResponse = {
      capacity,
      adjustments: {
        original_energy: energy_units,
        brain_mode_adjustment,
        burnout_adjustment,
        final_capacity: capacity
      }
    }

    // Simulate saving to database (in production this would be handled by Edge Function)
    console.log('Capacity adjustment calculated:', {
      energy_units,
      brain_mode,
      burnout_flag_count: burnout_flags.length,
      final_capacity: capacity,
      adjustments: response.adjustments
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Adjust capacity error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  })
}