import { NextRequest, NextResponse } from 'next/server'

interface CreateTaskRequest {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  energy_required?: number
  estimated_duration?: number
  due_date?: string
  tags?: string[]
  
  // AI classification data
  ai_time_estimate?: number
  ai_urgency_score?: number
  ai_impact_score?: number
  ai_completion_criteria?: string
  ai_suggested_priority?: 'low' | 'medium' | 'high' | 'urgent'
  ai_energy_level?: number
  ai_breakdown_steps?: string[]
  ai_confidence?: number
  ai_classified_at?: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'capture' | 'today' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  energy_required: number
  estimated_duration?: number
  completed_at?: string
  due_date?: string
  tags: string[]
  
  // AI classification fields
  ai_time_estimate?: number
  ai_urgency_score?: number
  ai_impact_score?: number
  ai_completion_criteria?: string
  ai_suggested_priority?: 'low' | 'medium' | 'high' | 'urgent'
  ai_energy_level?: number
  ai_breakdown_steps?: string[]
  ai_confidence?: number
  ai_classified_at?: string
  
  user_id: string
  created_at: string
  updated_at: string
}

// Simulated database for demo purposes
let mockTasks: Task[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    let filteredTasks = mockTasks
    
    if (status) {
      const statusArray = status.split(',')
      filteredTasks = mockTasks.filter(task => statusArray.includes(task.status))
    }
    
    // Sort by created_at descending
    filteredTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    // Apply limit
    filteredTasks = filteredTasks.slice(0, limit)
    
    return NextResponse.json(filteredTasks)
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTaskRequest = await request.json()
    
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      )
    }

    // Create new task
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: body.title.trim(),
      description: body.description?.trim() || undefined,
      status: 'capture',
      priority: body.priority || 'medium',
      energy_required: body.energy_required || 3,
      estimated_duration: body.estimated_duration || undefined,
      due_date: body.due_date || undefined,
      tags: body.tags || [],
      
      // AI classification data
      ai_time_estimate: body.ai_time_estimate || undefined,
      ai_urgency_score: body.ai_urgency_score || undefined,
      ai_impact_score: body.ai_impact_score || undefined,
      ai_completion_criteria: body.ai_completion_criteria || undefined,
      ai_suggested_priority: body.ai_suggested_priority || undefined,
      ai_energy_level: body.ai_energy_level || undefined,
      ai_breakdown_steps: body.ai_breakdown_steps || [],
      ai_confidence: body.ai_confidence || undefined,
      ai_classified_at: body.ai_classified_at || undefined,
      
      user_id: 'demo_user', // For demo purposes
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add to mock database
    mockTasks.push(newTask)
    
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const taskIndex = mockTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Update task
    mockTasks[taskIndex] = {
      ...mockTasks[taskIndex],
      ...body,
      updated_at: new Date().toISOString()
    }
    
    return NextResponse.json(mockTasks[taskIndex])
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const taskIndex = mockTasks.findIndex(task => task.id === taskId)
    if (taskIndex === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Remove task
    mockTasks.splice(taskIndex, 1)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}