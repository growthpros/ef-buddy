/**
 * Admin API: Confirm Users
 * 
 * This endpoint auto-confirms all unconfirmed users to resolve
 * the "invalid login credentials" issue caused by email confirmation requirements.
 * 
 * Usage: POST /api/admin/confirm-users
 */

import { NextRequest, NextResponse } from 'next/server'
import { confirmAllUnconfirmedUsers, listUsers } from '@/utils/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    // Get current users status
    const usersResult = await listUsers()
    if (!usersResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users: ' + usersResult.error
      }, { status: 500 })
    }

    const unconfirmedCount = usersResult.users.filter(u => !u.confirmed).length

    if (unconfirmedCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users are already confirmed',
        confirmed: 0,
        total: usersResult.users.length
      })
    }

    // Confirm all unconfirmed users
    const confirmResult = await confirmAllUnconfirmedUsers()
    
    if (!confirmResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to confirm users: ' + confirmResult.error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully confirmed ${confirmResult.confirmed} users`,
      confirmed: confirmResult.confirmed,
      failed: confirmResult.failed,
      total: usersResult.users.length,
      details: confirmResult.results
    })

  } catch (error) {
    console.error('Admin confirm users error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const usersResult = await listUsers()
    
    if (!usersResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users: ' + usersResult.error
      }, { status: 500 })
    }

    const unconfirmed = usersResult.users.filter(u => !u.confirmed)
    const confirmed = usersResult.users.filter(u => u.confirmed)

    return NextResponse.json({
      success: true,
      total: usersResult.users.length,
      confirmed: confirmed.length,
      unconfirmed: unconfirmed.length,
      users: usersResult.users
    })

  } catch (error) {
    console.error('Admin list users error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}